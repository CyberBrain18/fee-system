import { Router } from 'express';
import { requireAuth } from '../middleware/auth.ts';
import { createFeeComponent, listFeeComponents } from '../controllers/feeComponents.controller.ts';

const router = Router();

router.post('/', requireAuth, createFeeComponent);
router.get('/', listFeeComponents);

export default router;
