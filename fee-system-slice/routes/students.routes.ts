import { Router } from 'express';
import { requireAuth } from '../middleware/auth.ts';
import {
  createStudent,
  createStudentWithSection,
  updateStudent,
  listStudents,
  getStudent,
  getStudentNoDues
} from '../controllers/students.controller.ts';

const router = Router();

router.post('/', requireAuth, createStudent);
router.patch('/:id', requireAuth, updateStudent);
router.post('/', requireAuth, createStudentWithSection);
router.get('/', listStudents);
router.get('/:id', getStudent);
router.get('/:id/no-dues', getStudentNoDues);

export default router;
