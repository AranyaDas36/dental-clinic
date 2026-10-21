import { Router } from 'express';
import { healthRouter } from './health.js';
import { authRouter } from './auth.routes.js';
import { publicRouter } from './public.routes.js';
import { adminRouter } from './admin.routes.js';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/public', publicRouter);
apiRouter.use('/admin', adminRouter);

apiRouter.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Dental Clinic API',
      version: 'v1',
      status: 'ok',
    },
  });
});
