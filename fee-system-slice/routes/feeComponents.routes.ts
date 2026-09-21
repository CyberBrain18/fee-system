import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.ts';
import { createFeeComponent, listFeeComponents, deleteFeeComponent } from '../controllers/feeComponents.controller.ts';


const router = Router();

router.post('/', requireAuth, createFeeComponent);
router.get('/', listFeeComponents);
router.delete('/:id', requireAuth, requireAdmin, deleteFeeComponent);

export default router;
