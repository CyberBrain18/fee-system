import { Router } from 'express';
import { requireAuth } from '../middleware/auth.ts';
import { createFeeRule, updateFeeRule, listFeeRules } from '../controllers/feeRules.controller.ts';

const router = Router();

router.post('/', requireAuth, createFeeRule);
router.patch('/:id', requireAuth, updateFeeRule);
router.get('/', listFeeRules);

export default router;
