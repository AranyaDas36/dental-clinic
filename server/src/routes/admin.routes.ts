import { Router } from 'express';
import {
  deleteAdminMedia,
  deleteAdminReviewHandler,
  deleteAdminService,
  getAdminAppointmentById,
  getAdminAppointments,
  getAdminMedia,
  getAdminReviews,
  getAdminServiceById,
  getAdminServices,
  getDashboard,
  getWebsiteDraft,
  getWebsiteVersions,
  patchAdminAppointment,
  patchAdminMedia,
  patchAdminReview,
  patchAdminService,
  postAdminMedia,
  postAdminService,
  postWebsitePublish,
  postWebsiteRestore,
  putWebsiteDraft,
} from '../controllers/admin.controller.js';
import { requireAuth, requireCsrf, requirePasswordChanged } from '../middleware/auth.js';
import { uploadRateLimiter } from '../middleware/rate-limit.js';
import { imageUpload } from '../middleware/upload.js';
import { asyncHandler } from '../utils/async-handler.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requirePasswordChanged, requireCsrf);

adminRouter.get('/dashboard', asyncHandler(getDashboard));

adminRouter.get('/website/draft', asyncHandler(getWebsiteDraft));
adminRouter.put('/website/draft', asyncHandler(putWebsiteDraft));
adminRouter.post('/website/publish', asyncHandler(postWebsitePublish));
adminRouter.get('/website/versions', asyncHandler(getWebsiteVersions));
adminRouter.post('/website/versions/:id/restore', asyncHandler(postWebsiteRestore));

adminRouter.get('/services', asyncHandler(getAdminServices));
adminRouter.post('/services', asyncHandler(postAdminService));
adminRouter.get('/services/:id', asyncHandler(getAdminServiceById));
adminRouter.patch('/services/:id', asyncHandler(patchAdminService));
adminRouter.delete('/services/:id', asyncHandler(deleteAdminService));

adminRouter.get('/reviews', asyncHandler(getAdminReviews));
adminRouter.patch('/reviews/:id', asyncHandler(patchAdminReview));
adminRouter.delete('/reviews/:id', asyncHandler(deleteAdminReviewHandler));

adminRouter.get('/appointments', asyncHandler(getAdminAppointments));
adminRouter.get('/appointments/:id', asyncHandler(getAdminAppointmentById));
adminRouter.patch('/appointments/:id', asyncHandler(patchAdminAppointment));

adminRouter.get('/media', asyncHandler(getAdminMedia));
adminRouter.post(
  '/media/upload',
  uploadRateLimiter,
  imageUpload.single('file'),
  asyncHandler(postAdminMedia),
);
adminRouter.patch('/media/:id', asyncHandler(patchAdminMedia));
adminRouter.delete('/media/:id', asyncHandler(deleteAdminMedia));
