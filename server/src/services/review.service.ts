import {
  adminReviewUpdateSchema,
  publicReviewCreateSchema,
  type PublicReviewCreate,
  type ReviewStatus,
} from '@dental/shared';
import { Types } from 'mongoose';
import { ReviewModel } from '../models/Review.js';
import { AppError } from '../middleware/error-handler.js';
import { invalidatePublicCaches } from './public-cache.js';

function serializePublic(doc: {
  _id: { toString(): string };
  displayName: string;
  rating: number;
  message: string;
  adminResponse?: string | null;
  createdAt?: Date;
}) {
  return {
    id: doc._id.toString(),
    displayName: doc.displayName,
    rating: doc.rating,
    message: doc.message,
    adminResponse: doc.adminResponse ?? null,
    createdAt: doc.createdAt,
  };
}

function serializeAdmin(doc: {
  _id: { toString(): string };
  displayName: string;
  rating: number;
  message: string;
  status: string;
  adminResponse?: string | null;
  moderatedAt?: Date | null;
  moderatedBy?: { toString(): string } | null;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    ...serializePublic(doc),
    status: doc.status,
    moderatedAt: doc.moderatedAt ?? null,
    moderatedBy: doc.moderatedBy ? String(doc.moderatedBy) : null,
    updatedAt: doc.updatedAt,
  };
}

export async function createPublicReview(input: PublicReviewCreate) {
  const data = publicReviewCreateSchema.parse(input);
  // Never trust client status — always pending.
  const created = await ReviewModel.create({
    ...data,
    status: 'pending',
    adminResponse: null,
    moderatedAt: null,
    moderatedBy: null,
  });
  return { id: created._id.toString(), status: 'pending' as const };
}

export async function listApprovedReviews(page: number, pageSize: number) {
  const filter = { status: 'approved' as const };
  const [items, total] = await Promise.all([
    ReviewModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    ReviewModel.countDocuments(filter),
  ]);
  return { items: items.map(serializePublic), total };
}

export async function listAdminReviews(page: number, pageSize: number, status?: ReviewStatus) {
  const filter = status ? { status } : {};
  const [items, total] = await Promise.all([
    ReviewModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    ReviewModel.countDocuments(filter),
  ]);
  return { items: items.map(serializeAdmin), total };
}

export async function updateAdminReview(id: string, adminUserId: string, body: unknown) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Invalid review id');
  }
  const input = adminReviewUpdateSchema.parse(body);
  const review = await ReviewModel.findById(id);
  if (!review) {
    throw new AppError(404, 'NOT_FOUND', 'Review not found');
  }

  if (input.status !== undefined) {
    review.status = input.status;
    review.moderatedAt = new Date();
    review.moderatedBy = new Types.ObjectId(adminUserId);
  }
  if (input.adminResponse !== undefined) {
    review.adminResponse = input.adminResponse;
  }

  await review.save();
  invalidatePublicCaches();
  return serializeAdmin(review);
}

export async function deleteAdminReview(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Invalid review id');
  }
  const deleted = await ReviewModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError(404, 'NOT_FOUND', 'Review not found');
  }
  invalidatePublicCaches();
  return { id };
}
