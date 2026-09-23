import { Router } from 'express';
import type { Request, Response } from 'express';
import type { HealthResponse } from '../types/api.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const response: HealthResponse = {
    status: 'ok',
  };
  res.status(200).json(response);
});

export default router;
