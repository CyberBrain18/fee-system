import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.ts';
import { createInstallment, chargeLateFee, deleteInstallment} from '../controllers/installments.controller.ts';

const router = Router();

router.post('/', requireAuth, createInstallment);
router.post('/:id/charge-late-fee', requireAuth, chargeLateFee);
router.delete('/:id', requireAuth, requireAdmin, deleteInstallment);

export default router;
