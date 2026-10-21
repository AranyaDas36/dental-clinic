import type { Request, Response } from 'express';
import { paginationQuerySchema } from '@dental/shared';
import { getPublishedWebsite } from '../services/website.service.js';
import { getPublishedServiceBySlug, listPublishedServices } from '../services/service.service.js';
import { createPublicReview, listApprovedReviews } from '../services/review.service.js';
import { createPublicAppointment } from '../services/appointment.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function getPublicWebsite(_req: Request, res: Response): Promise<void> {
  const data = await getPublishedWebsite();
  sendSuccess(res, data);
}

export async function getPublicServices(req: Request, res: Response): Promise<void> {
  const { page, pageSize } = paginationQuerySchema.parse(req.query);
  const { items, total } = await listPublishedServices(page, pageSize);
  sendSuccess(res, { items }, 200, { page, pageSize, total });
}

export async function getPublicService(req: Request, res: Response): Promise<void> {
  const slug = String(req.params.slug ?? '');
  const service = await getPublishedServiceBySlug(slug);
  sendSuccess(res, { service });
}

export async function getPublicReviews(req: Request, res: Response): Promise<void> {
  const { page, pageSize } = paginationQuerySchema.parse(req.query);
  const { items, total } = await listApprovedReviews(page, pageSize);
  sendSuccess(res, { items }, 200, { page, pageSize, total });
}

export async function postPublicReview(req: Request, res: Response): Promise<void> {
  const result = await createPublicReview(req.body);
  sendSuccess(res, result, 201);
}

export async function postPublicAppointment(req: Request, res: Response): Promise<void> {
  const result = await createPublicAppointment(req.body);
  sendSuccess(res, result, 201);
}
