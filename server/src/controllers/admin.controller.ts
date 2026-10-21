import type { Request, Response } from 'express';
import {
  APPOINTMENT_STATUSES,
  REVIEW_STATUSES,
  websiteDraftUpdateSchema,
  paginationQuerySchema,
  serviceInputSchema,
  servicePatchSchema,
  websitePublishSchema,
} from '@dental/shared';
import { z } from 'zod';
import { getDashboardOverview } from '../services/dashboard.service.js';
import {
  getDraftWebsite,
  listWebsiteVersions,
  publishWebsite,
  restoreWebsiteVersion,
  updateDraftWebsite,
} from '../services/website.service.js';
import {
  createService,
  deleteService,
  getAdminService,
  listAdminServices,
  updateService,
} from '../services/service.service.js';
import {
  deleteAdminReview,
  listAdminReviews,
  updateAdminReview,
} from '../services/review.service.js';
import {
  getAdminAppointment,
  listAdminAppointments,
  updateAdminAppointment,
} from '../services/appointment.service.js';
import { deleteMedia, listMedia, updateMedia, uploadMedia } from '../services/media.service.js';
import { sendSuccess } from '../utils/api-response.js';
import { AppError } from '../middleware/error-handler.js';

function requireAdminId(req: Request): string {
  if (!req.adminUser) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }
  return req.adminUser.id;
}

export async function getDashboard(req: Request, res: Response): Promise<void> {
  requireAdminId(req);
  sendSuccess(res, await getDashboardOverview());
}

export async function getWebsiteDraft(req: Request, res: Response): Promise<void> {
  const adminId = requireAdminId(req);
  sendSuccess(res, await getDraftWebsite(adminId));
}

export async function putWebsiteDraft(req: Request, res: Response): Promise<void> {
  const adminId = requireAdminId(req);
  const input = websiteDraftUpdateSchema.parse(req.body);
  sendSuccess(res, await updateDraftWebsite(adminId, input));
}

export async function postWebsitePublish(req: Request, res: Response): Promise<void> {
  const adminId = requireAdminId(req);
  const input = websitePublishSchema.parse(req.body);
  sendSuccess(res, await publishWebsite(adminId, input));
}

export async function getWebsiteVersions(req: Request, res: Response): Promise<void> {
  requireAdminId(req);
  sendSuccess(res, { items: await listWebsiteVersions() });
}

export async function postWebsiteRestore(req: Request, res: Response): Promise<void> {
  const adminId = requireAdminId(req);
  const body = z.object({ expectedDraftVersion: z.number().int().min(0) }).parse(req.body);
  const id = String(req.params.id ?? '');
  sendSuccess(res, await restoreWebsiteVersion(adminId, id, body.expectedDraftVersion));
}

export async function getAdminServices(req: Request, res: Response): Promise<void> {
  requireAdminId(req);
  const { page, pageSize } = paginationQuerySchema.parse(req.query);
  const { items, total } = await listAdminServices(page, pageSize);
  sendSuccess(res, { items }, 200, { page, pageSize, total });
}

export async function postAdminService(req: Request, res: Response): Promise<void> {
  requireAdminId(req);
  const input = serviceInputSchema.parse(req.body);
  sendSuccess(res, { service: await createService(input) }, 201);
}

export async function getAdminServiceById(req: Request, res: Response): Promise<void> {
  requireAdminId(req);
  sendSuccess(res, { service: await getAdminService(String(req.params.id ?? '')) });
}

export async function patchAdminService(req: Request, res: Response): Promise<void> {
  requireAdminId(req);
  const partial = servicePatchSchema.parse(req.body);
  sendSuccess(res, {
    service: await updateService(String(req.params.id ?? ''), partial),
  });
}

export async function deleteAdminService(req: Request, res: Response): Promise<void> {
  requireAdminId(req);
  sendSuccess(res, await deleteService(String(req.params.id ?? '')));
}

export async function getAdminReviews(req: Request, res: Response): Promise<void> {
  requireAdminId(req);
  const query = paginationQuerySchema
    .extend({
      status: z.enum(REVIEW_STATUSES).optional(),
    })
    .parse(req.query);
  const { items, total } = await listAdminReviews(query.page, query.pageSize, query.status);
  sendSuccess(res, { items }, 200, {
    page: query.page,
    pageSize: query.pageSize,
    total,
  });
}

export async function patchAdminReview(req: Request, res: Response): Promise<void> {
  const adminId = requireAdminId(req);
  sendSuccess(res, {
    review: await updateAdminReview(String(req.params.id ?? ''), adminId, req.body),
  });
}

export async function deleteAdminReviewHandler(req: Request, res: Response): Promise<void> {
  requireAdminId(req);
  sendSuccess(res, await deleteAdminReview(String(req.params.id ?? '')));
}

export async function getAdminAppointments(req: Request, res: Response): Promise<void> {
  requireAdminId(req);
  const query = paginationQuerySchema
    .extend({
      status: z.enum(APPOINTMENT_STATUSES).optional(),
    })
    .parse(req.query);
  const { items, total } = await listAdminAppointments(query.page, query.pageSize, query.status);
  sendSuccess(res, { items }, 200, {
    page: query.page,
    pageSize: query.pageSize,
    total,
  });
}

export async function getAdminAppointmentById(req: Request, res: Response): Promise<void> {
  requireAdminId(req);
  sendSuccess(res, {
    appointment: await getAdminAppointment(String(req.params.id ?? '')),
  });
}

export async function patchAdminAppointment(req: Request, res: Response): Promise<void> {
  requireAdminId(req);
  sendSuccess(res, {
    appointment: await updateAdminAppointment(String(req.params.id ?? ''), req.body),
  });
}

export async function getAdminMedia(req: Request, res: Response): Promise<void> {
  requireAdminId(req);
  const { page, pageSize } = paginationQuerySchema.parse(req.query);
  const { items, total } = await listMedia(page, pageSize);
  sendSuccess(res, { items }, 200, { page, pageSize, total });
}

export async function postAdminMedia(req: Request, res: Response): Promise<void> {
  const adminId = requireAdminId(req);
  const altText = typeof req.body?.altText === 'string' ? req.body.altText : undefined;
  const caption = typeof req.body?.caption === 'string' ? req.body.caption : undefined;
  sendSuccess(
    res,
    {
      media: await uploadMedia(adminId, req.file, { altText, caption }),
    },
    201,
  );
}

export async function patchAdminMedia(req: Request, res: Response): Promise<void> {
  requireAdminId(req);
  sendSuccess(res, {
    media: await updateMedia(String(req.params.id ?? ''), req.body),
  });
}

export async function deleteAdminMedia(req: Request, res: Response): Promise<void> {
  requireAdminId(req);
  sendSuccess(res, await deleteMedia(String(req.params.id ?? '')));
}
