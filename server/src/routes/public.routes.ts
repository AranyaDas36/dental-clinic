import { Router } from 'express';
import {
  getPublicReviews,
  getPublicService,
  getPublicServices,
  getPublicWebsite,
  postPublicAppointment,
  postPublicReview,
} from '../controllers/public.controller.js';
import { publicWriteRateLimiter } from '../middleware/rate-limit.js';
import { asyncHandler } from '../utils/async-handler.js';

export const publicRouter = Router();

publicRouter.get('/website', asyncHandler(getPublicWebsite));
publicRouter.get('/services', asyncHandler(getPublicServices));
publicRouter.get('/services/:slug', asyncHandler(getPublicService));
publicRouter.get('/reviews', asyncHandler(getPublicReviews));
publicRouter.post('/reviews', publicWriteRateLimiter, asyncHandler(postPublicReview));
publicRouter.post('/appointments', publicWriteRateLimiter, asyncHandler(postPublicAppointment));
