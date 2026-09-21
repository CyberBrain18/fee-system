import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import {
  createStudent,
  createStudentWithSection,
  bulkCreateStudents,
  updateStudent,
  withdrawStudent,
  listStudents,
  getStudent,
  getStudentNoDues,
  listWithdrawnStudents
} from '../controllers/students.controller.ts';

const router = Router();

router.post('/', requireAuth, createStudent);
router.patch('/:id', requireAuth, updateStudent);
router.post('/', requireAuth, createStudentWithSection);
router.get('/', listStudents);
router.get('/withdrawn', requireAuth, requireAdmin, listWithdrawnStudents);
router.get('/:id', getStudent);
router.get('/:id/no-dues', getStudentNoDues);
router.post('/bulk', requireAuth, bulkCreateStudents);
router.post('/:id/withdraw', requireAuth, requireAdmin, withdrawStudent);

export default router;
