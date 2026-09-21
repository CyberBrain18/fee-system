import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.ts';
import { createFeeRule, updateFeeRule, listFeeRules, deleteFeeRule} from '../controllers/feeRules.controller.ts';

const router = Router();

router.delete('/:id', requireAuth, requireAdmin, deleteFeeRule);
router.post('/', requireAuth, createFeeRule);
router.patch('/:id', requireAuth, updateFeeRule);
router.get('/', listFeeRules);

export default router;
