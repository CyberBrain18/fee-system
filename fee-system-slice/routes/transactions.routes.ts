import { Router } from 'express';
import { requireAuth } from '../middleware/auth.ts';
import { createAdjustment } from '../controllers/transactions.controller.ts';

const router = Router();

router.post('/adjustment', requireAuth, createAdjustment);

export default router;
