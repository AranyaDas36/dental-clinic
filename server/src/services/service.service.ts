import { serviceInputSchema, type ServiceInput, type ServicePatch } from '@dental/shared';
import { Types } from 'mongoose';
import { ServiceModel } from '../models/Service.js';
import { MediaAssetModel } from '../models/MediaAsset.js';
import { AppError } from '../middleware/error-handler.js';
import { invalidatePublicCaches } from './public-cache.js';

type ServiceRecord = {
  _id: { toString(): string };
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  priceType: string;
  price?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  currency: string;
  imageMediaId?: { toString(): string } | null;
  isFeatured: boolean;
  isPublished: boolean;
  displayOrder: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

function serializeService(
  doc: ServiceRecord,
  image?: { secureUrl: string; altText?: string } | null,
) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    shortDescription: doc.shortDescription,
    description: doc.description,
    category: doc.category,
    priceType: doc.priceType,
    price: doc.price ?? null,
    minPrice: doc.minPrice ?? null,
    maxPrice: doc.maxPrice ?? null,
    currency: doc.currency,
    imageMediaId: doc.imageMediaId ? String(doc.imageMediaId) : null,
    imageUrl: image?.secureUrl ?? null,
    imageAltText: image?.altText ?? '',
    isFeatured: doc.isFeatured,
    isPublished: doc.isPublished,
    displayOrder: doc.displayOrder,
    seoTitle: doc.seoTitle ?? null,
    seoDescription: doc.seoDescription ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function serializePublishedServices(services: ServiceRecord[]) {
  const mediaIds = [
    ...new Set(
      services.flatMap((service) => {
        const id = service.imageMediaId?.toString();
        return id && Types.ObjectId.isValid(id) ? [id] : [];
      }),
    ),
  ];
  const assets = mediaIds.length
    ? await MediaAssetModel.find({ _id: { $in: mediaIds } })
        .select('_id secureUrl altText')
        .lean()
    : [];
  const mediaById = new Map(
    assets.map((asset) => [
      String(asset._id),
      { secureUrl: asset.secureUrl, altText: asset.altText },
    ]),
  );

  return services.map((service) =>
    serializeService(service, mediaById.get(service.imageMediaId?.toString() ?? '') ?? null),
  );
}

async function assertImageMedia(imageMediaId: string | null) {
  if (!imageMediaId) return;
  if (!Types.ObjectId.isValid(imageMediaId)) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Invalid imageMediaId');
  }
  const exists = await MediaAssetModel.exists({ _id: imageMediaId });
  if (!exists) {
    throw new AppError(422, 'INVALID_MEDIA_REF', 'Service image media not found');
  }
}

export async function listAdminServices(page: number, pageSize: number) {
  const [items, total] = await Promise.all([
    ServiceModel.find()
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    ServiceModel.countDocuments(),
  ]);
  return { items: items.map((item) => serializeService(item)), total };
}

export async function listPublishedServices(page: number, pageSize: number) {
  const filter = { isPublished: true };
  const [items, total] = await Promise.all([
    ServiceModel.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    ServiceModel.countDocuments(filter),
  ]);
  return { items: await serializePublishedServices(items), total };
}

export async function getPublishedServiceBySlug(slug: string) {
  const service = await ServiceModel.findOne({ slug, isPublished: true });
  if (!service) {
    throw new AppError(404, 'NOT_FOUND', 'Service not found');
  }
  return (await serializePublishedServices([service]))[0];
}

export async function getAdminService(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Invalid service id');
  }
  const service = await ServiceModel.findById(id);
  if (!service) {
    throw new AppError(404, 'NOT_FOUND', 'Service not found');
  }
  return serializeService(service);
}

export async function createService(input: ServiceInput) {
  const data = serviceInputSchema.parse(input);
  await assertImageMedia(data.imageMediaId);

  try {
    const created = await ServiceModel.create(data);
    invalidatePublicCaches();
    return serializeService(created);
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw new AppError(409, 'SLUG_CONFLICT', 'Service slug already exists');
    }
    throw error;
  }
}

export async function updateService(id: string, input: ServicePatch) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Invalid service id');
  }

  const existing = await ServiceModel.findById(id);
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Service not found');
  }

  const merged = serviceInputSchema.parse({
    name: input.name ?? existing.name,
    slug: input.slug ?? existing.slug,
    shortDescription: input.shortDescription ?? existing.shortDescription,
    description: input.description ?? existing.description,
    category: input.category ?? existing.category,
    priceType: input.priceType ?? existing.priceType,
    price: input.price !== undefined ? input.price : existing.price,
    minPrice: input.minPrice !== undefined ? input.minPrice : existing.minPrice,
    maxPrice: input.maxPrice !== undefined ? input.maxPrice : existing.maxPrice,
    currency: input.currency ?? existing.currency,
    imageMediaId:
      input.imageMediaId !== undefined
        ? input.imageMediaId
        : existing.imageMediaId
          ? String(existing.imageMediaId)
          : null,
    isFeatured: input.isFeatured ?? existing.isFeatured,
    isPublished: input.isPublished ?? existing.isPublished,
    displayOrder: input.displayOrder ?? existing.displayOrder,
    seoTitle: input.seoTitle !== undefined ? input.seoTitle : existing.seoTitle,
    seoDescription:
      input.seoDescription !== undefined ? input.seoDescription : existing.seoDescription,
  });

  await assertImageMedia(merged.imageMediaId);

  try {
    Object.assign(existing, merged);
    await existing.save();
    invalidatePublicCaches();
    return serializeService(existing);
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw new AppError(409, 'SLUG_CONFLICT', 'Service slug already exists');
    }
    throw error;
  }
}

export async function deleteService(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Invalid service id');
  }
  const deleted = await ServiceModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError(404, 'NOT_FOUND', 'Service not found');
  }
  invalidatePublicCaches();
  return { id };
}
