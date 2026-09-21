import { Router } from 'express';
import { requireAuth } from '../middleware/auth.ts';
import { createPayment } from '../controllers/transactions.controller.ts';

const router = Router();

router.post('/', requireAuth, createPayment);

export default router;
