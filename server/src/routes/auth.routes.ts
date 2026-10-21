import { Router } from 'express';
import { changePassword, csrf, login, logout, me } from '../controllers/auth.controller.js';
import { requireAuth, requireCsrf } from '../middleware/auth.js';
import { loginRateLimiter } from '../middleware/rate-limit.js';
import { asyncHandler } from '../utils/async-handler.js';

export const authRouter = Router();

authRouter.get('/csrf', asyncHandler(csrf));
authRouter.post('/login', loginRateLimiter, requireCsrf, asyncHandler(login));
authRouter.post('/logout', requireCsrf, asyncHandler(logout));
authRouter.get('/me', requireAuth, asyncHandler(me));
authRouter.post('/change-password', requireAuth, requireCsrf, asyncHandler(changePassword));
