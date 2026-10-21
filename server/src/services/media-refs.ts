import { Types } from 'mongoose';
import type { WebsiteSnapshot } from '@dental/shared';
import { MediaAssetModel } from '../models/MediaAsset.js';
import { AppError } from '../middleware/error-handler.js';

function collectMediaIds(snapshot: WebsiteSnapshot, clinic: Record<string, unknown>): string[] {
  const ids = new Set<string>();

  const push = (value: unknown) => {
    if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
      ids.add(value);
    }
  };

  push(clinic.logoMediaId);
  push(clinic.faviconMediaId);
  const dentist = clinic.dentist as Record<string, unknown> | undefined;
  push(dentist?.portraitMediaId);
  push(snapshot.seo.socialImageMediaId);

  for (const section of snapshot.sections) {
    if (section.type === 'hero') push(section.settings.imageMediaId);
    if (section.type === 'gallery') {
      for (const id of section.settings.mediaIds) push(id);
    }
  }

  return [...ids];
}

export async function assertMediaIdsExist(
  snapshot: WebsiteSnapshot,
  clinic: Record<string, unknown>,
): Promise<void> {
  const ids = collectMediaIds(snapshot, clinic);
  if (ids.length === 0) return;

  const count = await MediaAssetModel.countDocuments({
    _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
  });

  if (count !== ids.length) {
    throw new AppError(422, 'INVALID_MEDIA_REF', 'One or more media references are invalid');
  }
}
