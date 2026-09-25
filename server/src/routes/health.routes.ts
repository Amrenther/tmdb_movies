import { Router } from 'express';
import type { Request, Response } from 'express';
import type { HealthResponse } from '../types/api.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    // Test database connectivity
    await prisma.$queryRaw`SELECT 1`;
    const response: HealthResponse = {
      status: 'ok',
      db: 'up',
    };
    res.status(200).json(response);
  } catch (error) {
    // Log error internally without exposing details to client
    console.error('Database health check failed:', error);
    const response: HealthResponse = {
      status: 'down',
      db: 'down',
    };
    res.status(503).json(response);
  }
});

export default router;
