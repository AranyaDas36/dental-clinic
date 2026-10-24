import {
  createDefaultWebsiteSnapshot,
  DEFAULT_CLINIC,
  websiteSnapshotSchema,
  clinicSchema,
  type WebsiteDraftUpdate,
  type WebsitePublishInput,
  type WebsiteSnapshot,
  type ClinicInfo,
} from '@dental/shared';
import mongoose from 'mongoose';
import { WebsiteConfigModel } from '../models/WebsiteConfig.js';
import { WebsiteRevisionModel } from '../models/WebsiteRevision.js';
import { AppError } from '../middleware/error-handler.js';
import { assertMediaIdsExist, resolveReferencedMedia } from './media-refs.js';
import { getCached, invalidatePublicCaches, setCached } from './public-cache.js';

async function ensureConfig() {
  let config = await WebsiteConfigModel.findOne({ key: 'primary' });
  if (!config) {
    config = await WebsiteConfigModel.create({
      key: 'primary',
      clinic: DEFAULT_CLINIC,
      draft: createDefaultWebsiteSnapshot(),
      draftVersion: 0,
      activeRevisionId: null,
      updatedBy: null,
    });
  }

  return config;
}

function toPlain(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}

function serializeClinic(clinic: unknown): ClinicInfo {
  return clinicSchema.parse(toPlain(clinic));
}

function serializeSnapshot(snapshot: unknown): WebsiteSnapshot {
  return websiteSnapshotSchema.parse(toPlain(snapshot));
}

export async function getDraftWebsite(adminUserId: string) {
  const config = await ensureConfig();
  const clinic = serializeClinic(config.clinic);
  const draft = serializeSnapshot(config.draft);
  return {
    clinic,
    draft,
    media: await resolveReferencedMedia(draft, clinic),
    draftVersion: config.draftVersion,
    activeRevisionId: config.activeRevisionId ? String(config.activeRevisionId) : null,
    updatedAt: config.updatedAt,
    updatedBy: config.updatedBy ? String(config.updatedBy) : null,
    requestedBy: adminUserId,
  };
}

export async function updateDraftWebsite(adminUserId: string, input: WebsiteDraftUpdate) {
  const draft = websiteSnapshotSchema.parse(input.draft);
  const clinic = clinicSchema.parse(input.clinic);
  await assertMediaIdsExist(draft, clinic);

  const updated = await WebsiteConfigModel.findOneAndUpdate(
    { key: 'primary', draftVersion: input.expectedDraftVersion },
    {
      $set: {
        clinic,
        draft,
        updatedBy: adminUserId,
      },
      $inc: { draftVersion: 1 },
    },
    { new: true },
  );

  if (!updated) {
    const current = await WebsiteConfigModel.findOne({ key: 'primary' });
    throw new AppError(409, 'DRAFT_CONFLICT', 'Draft was modified by another session', {
      currentDraftVersion: current?.draftVersion ?? null,
    });
  }

  return {
    clinic: serializeClinic(updated.clinic),
    draft: serializeSnapshot(updated.draft),
    draftVersion: updated.draftVersion,
    updatedAt: updated.updatedAt,
  };
}

export async function publishWebsite(adminUserId: string, input: WebsitePublishInput) {
  /**
   * Create a complete immutable revision first, then flip `activeRevisionId`.
   * Public readers only resolve the active revision, so a failed flip leaves an
   * unused revision rather than a partially published site.
   *
   * Sequential writes are used so standalone MongoDB (local) and Atlas both work.
   * On Atlas replica sets this can be wrapped in a multi-doc transaction later.
   */
  const config = await WebsiteConfigModel.findOne({ key: 'primary' });
  if (!config) {
    throw new AppError(404, 'NOT_FOUND', 'Website configuration not found');
  }
  if (config.draftVersion !== input.expectedDraftVersion) {
    throw new AppError(409, 'DRAFT_CONFLICT', 'Draft version mismatch', {
      currentDraftVersion: config.draftVersion,
    });
  }

  const snapshot = serializeSnapshot(config.draft);
  const clinic = serializeClinic(config.clinic);
  await assertMediaIdsExist(snapshot, clinic);

  const latest = await WebsiteRevisionModel.findOne().sort({ version: -1 }).select('version');
  const nextVersion = (latest?.version ?? 0) + 1;

  const revision = await WebsiteRevisionModel.create({
    version: nextVersion,
    schemaVersion: snapshot.schemaVersion,
    snapshot,
    clinic,
    publishedBy: adminUserId,
    publishedAt: new Date(),
    changeSummary: input.changeSummary ?? null,
  });

  const activated = await WebsiteConfigModel.findOneAndUpdate(
    {
      key: 'primary',
      draftVersion: input.expectedDraftVersion,
      activeRevisionId: config.activeRevisionId,
    },
    {
      $set: {
        activeRevisionId: revision._id,
        updatedBy: new mongoose.Types.ObjectId(adminUserId),
      },
    },
    { new: true },
  );

  if (!activated) {
    await WebsiteRevisionModel.deleteOne({ _id: revision._id });
    const current = await WebsiteConfigModel.findOne({ key: 'primary' });
    throw new AppError(409, 'PUBLISH_CONFLICT', 'Publish conflict — retry with latest draft', {
      currentDraftVersion: current?.draftVersion ?? null,
    });
  }

  invalidatePublicCaches();
  return {
    revisionId: revision._id.toString(),
    version: revision.version,
    publishedAt: revision.publishedAt,
  };
}

export async function listWebsiteVersions() {
  const revisions = await WebsiteRevisionModel.find()
    .sort({ version: -1 })
    .limit(50)
    .select('version schemaVersion publishedAt changeSummary publishedBy');

  return revisions.map((item) => ({
    id: item._id.toString(),
    version: item.version,
    schemaVersion: item.schemaVersion,
    publishedAt: item.publishedAt,
    changeSummary: item.changeSummary,
    publishedBy: item.publishedBy.toString(),
  }));
}

export async function restoreWebsiteVersion(
  adminUserId: string,
  revisionId: string,
  expectedDraftVersion: number,
) {
  if (!mongoose.Types.ObjectId.isValid(revisionId)) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Invalid revision id');
  }

  const revision = await WebsiteRevisionModel.findById(revisionId);
  if (!revision) {
    throw new AppError(404, 'NOT_FOUND', 'Revision not found');
  }

  const snapshot = websiteSnapshotSchema.parse(revision.snapshot);
  const clinic = clinicSchema.parse(revision.clinic);

  // Restore into draft with OCC, then publish as a new revision.
  await updateDraftWebsite(adminUserId, {
    expectedDraftVersion,
    clinic,
    draft: snapshot,
  });

  const config = await WebsiteConfigModel.findOne({ key: 'primary' });
  if (!config) {
    throw new AppError(404, 'NOT_FOUND', 'Website configuration not found');
  }

  return publishWebsite(adminUserId, {
    expectedDraftVersion: config.draftVersion,
    changeSummary: `Restored from revision v${revision.version}`,
  });
}

export async function getPublishedWebsite() {
  const cacheKey = 'public:website';
  const cached = getCached<{
    clinic: ClinicInfo;
    snapshot: WebsiteSnapshot;
    version: number;
    publishedAt: Date;
  }>(cacheKey);
  if (cached) return cached;

  const config = await WebsiteConfigModel.findOne({ key: 'primary' }).lean();
  if (!config?.activeRevisionId) {
    throw new AppError(404, 'NOT_PUBLISHED', 'Website has not been published yet');
  }

  const revision = await WebsiteRevisionModel.findById(config.activeRevisionId).lean();
  if (!revision) {
    throw new AppError(404, 'NOT_PUBLISHED', 'Active revision not found');
  }

  const clinic = serializeClinic(revision.clinic);
  const snapshot = serializeSnapshot(revision.snapshot);
  const payload = {
    clinic,
    snapshot,
    media: await resolveReferencedMedia(snapshot, clinic),
    version: revision.version,
    publishedAt: revision.publishedAt,
  };
  setCached(cacheKey, payload);
  return payload;
}

export async function getWebsiteStatus() {
  const config = await ensureConfig();
  const active = config.activeRevisionId
    ? await WebsiteRevisionModel.findById(config.activeRevisionId).select(
        'version publishedAt changeSummary',
      )
    : null;

  return {
    draftVersion: config.draftVersion,
    hasPublishedRevision: Boolean(active),
    activeRevision: active
      ? {
          id: active._id.toString(),
          version: active.version,
          publishedAt: active.publishedAt,
          changeSummary: active.changeSummary,
        }
      : null,
    updatedAt: config.updatedAt,
  };
}
