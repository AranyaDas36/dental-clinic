import { Types } from 'mongoose';
import type { ClinicInfo, WebsiteSnapshot } from '@dental/shared';
import { MediaAssetModel } from '../models/MediaAsset.js';
import { AppError } from '../middleware/error-handler.js';

function collectMediaIds(snapshot: WebsiteSnapshot, clinic: ClinicInfo): string[] {
  const ids = new Set<string>();

  const push = (value: unknown) => {
    if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
      ids.add(value);
    }
  };

  push(clinic.logoMediaId);
  push(clinic.faviconMediaId);
  push(clinic.dentist.portraitMediaId);
  push(snapshot.seo.socialImageMediaId);

  for (const section of snapshot.sections) {
    if (section.type === 'hero') push(section.settings.imageMediaId);
    if (section.type === 'gallery') {
      for (const id of section.settings.mediaIds) push(id);
    }
  }

  return [...ids];
}

export async function resolveReferencedMedia(
  snapshot: WebsiteSnapshot,
  clinic: ClinicInfo,
): Promise<Record<string, { url: string; altText: string; caption: string }>> {
  const ids = collectMediaIds(snapshot, clinic);
  if (ids.length === 0) return {};

  const assets = await MediaAssetModel.find({
    _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
  })
    .select('_id secureUrl altText caption')
    .lean();

  return Object.fromEntries(
    assets.map((asset) => [
      String(asset._id),
      {
        url: asset.secureUrl,
        altText: asset.altText ?? '',
        caption: asset.caption ?? '',
      },
    ]),
  );
}

export async function assertMediaIdsExist(
  snapshot: WebsiteSnapshot,
  clinic: ClinicInfo,
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
