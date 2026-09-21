import { Router } from 'express';
import { requireAuth } from '../middleware/auth.ts';
import { createFeeAssignment, getFeeAssignmentBalance } from '../controllers/feeAssignments.controller.ts';
import { listInstallmentsForAssignment } from '../controllers/installments.controller.ts';

const router = Router();

router.post('/', requireAuth, createFeeAssignment);
router.get('/:id/balance', getFeeAssignmentBalance);
router.get('/:id/installments', listInstallmentsForAssignment);

export default router;
