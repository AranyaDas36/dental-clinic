import { v2 as cloudinary } from 'cloudinary';
import { fileTypeFromBuffer } from 'file-type';
import { Types } from 'mongoose';
import { z } from 'zod';
import { getEnv } from '../config/env.js';
import { MediaAssetModel } from '../models/MediaAsset.js';
import { WebsiteConfigModel } from '../models/WebsiteConfig.js';
import { ServiceModel } from '../models/Service.js';
import { AppError } from '../middleware/error-handler.js';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 5 * 1024 * 1024;
const MIN_DIMENSION = 32;
const MAX_DIMENSION = 6000;

const mediaUpdateSchema = z.object({
  altText: z.string().max(300).optional(),
  caption: z.string().max(500).optional(),
});

function configureCloudinary() {
  const env = getEnv();
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new AppError(
      503,
      'MEDIA_NOT_CONFIGURED',
      'Cloudinary is not configured. Set CLOUDINARY_* environment variables.',
    );
  }
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function serialize(doc: {
  _id: { toString(): string };
  provider: string;
  providerAssetId: string;
  publicId: string;
  secureUrl: string;
  resourceType: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  altText?: string;
  caption?: string;
  uploadedBy: { toString(): string };
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: doc._id.toString(),
    provider: doc.provider,
    providerAssetId: doc.providerAssetId,
    publicId: doc.publicId,
    secureUrl: doc.secureUrl,
    resourceType: doc.resourceType,
    format: doc.format,
    width: doc.width,
    height: doc.height,
    bytes: doc.bytes,
    altText: doc.altText ?? '',
    caption: doc.caption ?? '',
    uploadedBy: String(doc.uploadedBy),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function listMedia(page: number, pageSize: number) {
  const [items, total] = await Promise.all([
    MediaAssetModel.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    MediaAssetModel.countDocuments(),
  ]);
  return { items: items.map(serialize), total };
}

export async function updateMedia(id: string, body: unknown) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Invalid media id');
  }
  const input = mediaUpdateSchema.parse(body);
  const media = await MediaAssetModel.findById(id);
  if (!media) {
    throw new AppError(404, 'NOT_FOUND', 'Media asset not found');
  }
  if (input.altText !== undefined) media.altText = input.altText;
  if (input.caption !== undefined) media.caption = input.caption;
  await media.save();
  return serialize(media);
}

export async function deleteMedia(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Invalid media id');
  }

  const media = await MediaAssetModel.findById(id);
  if (!media) {
    throw new AppError(404, 'NOT_FOUND', 'Media asset not found');
  }

  const referencedByService = await ServiceModel.exists({ imageMediaId: id });
  if (referencedByService) {
    throw new AppError(
      409,
      'MEDIA_IN_USE',
      'Media is referenced by a service. Unlink it before deleting.',
    );
  }

  const config = await WebsiteConfigModel.findOne({ key: 'primary' }).lean();
  if (config) {
    const clinic = config.clinic as {
      logoMediaId?: Types.ObjectId | null;
      faviconMediaId?: Types.ObjectId | null;
      dentist?: { portraitMediaId?: Types.ObjectId | null };
    };
    const draft = JSON.stringify(config.draft);
    const idStr = id.toString();
    if (
      String(clinic.logoMediaId ?? '') === idStr ||
      String(clinic.faviconMediaId ?? '') === idStr ||
      String(clinic.dentist?.portraitMediaId ?? '') === idStr ||
      draft.includes(idStr)
    ) {
      throw new AppError(
        409,
        'MEDIA_IN_USE',
        'Media is referenced by website configuration. Remove references before deleting.',
      );
    }
  }

  configureCloudinary();
  try {
    await cloudinary.uploader.destroy(media.publicId, { resource_type: 'image' });
  } catch {
    // Continue local cleanup if remote already gone.
  }

  await MediaAssetModel.deleteOne({ _id: id });
  return { id };
}

export async function uploadMedia(
  adminUserId: string,
  file: Express.Multer.File | undefined,
  meta: { altText?: string; caption?: string },
) {
  if (!file) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Image file is required');
  }
  if (file.size > MAX_BYTES) {
    throw new AppError(422, 'FILE_TOO_LARGE', 'Image must be 5MB or smaller');
  }

  const detected = await fileTypeFromBuffer(file.buffer);
  if (!detected || !ALLOWED_MIME.has(detected.mime)) {
    throw new AppError(
      422,
      'INVALID_FILE_TYPE',
      'Only JPEG, PNG, WebP, and GIF images are allowed',
    );
  }

  configureCloudinary();
  const env = getEnv();

  const uploaded = await new Promise<{
    asset_id?: string;
    public_id: string;
    secure_url: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.CLOUDINARY_FOLDER,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Upload failed'));
          return;
        }
        resolve(result);
      },
    );
    stream.end(file.buffer);
  });

  if (
    uploaded.width < MIN_DIMENSION ||
    uploaded.height < MIN_DIMENSION ||
    uploaded.width > MAX_DIMENSION ||
    uploaded.height > MAX_DIMENSION
  ) {
    try {
      await cloudinary.uploader.destroy(uploaded.public_id, { resource_type: 'image' });
    } catch {
      // ignore cleanup failure
    }
    throw new AppError(422, 'INVALID_DIMENSIONS', 'Image dimensions are out of allowed range');
  }

  const created = await MediaAssetModel.create({
    provider: 'cloudinary',
    providerAssetId: uploaded.asset_id ?? uploaded.public_id,
    publicId: uploaded.public_id,
    secureUrl: uploaded.secure_url,
    resourceType: 'image',
    format: uploaded.format,
    width: uploaded.width,
    height: uploaded.height,
    bytes: uploaded.bytes,
    altText: meta.altText ?? '',
    caption: meta.caption ?? '',
    uploadedBy: adminUserId,
  });

  return serialize(created);
}
