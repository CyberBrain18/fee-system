import { Router } from 'express';
import { requireAuth } from '../middleware/auth.ts';
import { createInstallment, chargeLateFee } from '../controllers/installments.controller.ts';

const router = Router();

router.post('/', requireAuth, createInstallment);
router.post('/:id/charge-late-fee', requireAuth, chargeLateFee);

export default router;
