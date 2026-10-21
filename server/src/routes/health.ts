import { Router } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../utils/api-response.js';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  sendSuccess(res, {
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});
