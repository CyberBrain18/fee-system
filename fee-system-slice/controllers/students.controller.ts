import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.ts';

export async function createStudent(req: Request, res: Response) {
    const { name, grade } = req.body;
    try {
        const student = await prisma.student.create({
            data: { name, grade }
        });
        res.status(201).json(student);
    } catch(err) {
        res.status(500).json({ error: 'failed to save student data' });
    }
}

// Note: shadowed by createStudent when both are registered on POST /students
export async function createStudentWithSection(req: Request, res: Response) {
  const { name, grade, section } = req.body;
  try {
    const student = await prisma.student.create({
      data: { name, grade, section }
    });
    res.status(201).json(student);
  } catch (err) {
    console.error('Database write failed:', err);
    res.status(500).json({ error: 'Failed to save student' });
  }
}

export async function updateStudent(req: Request, res: Response) {
  const { section, distanceKm, isBoarder } = req.body;
  try {
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: { section, distanceKm, isBoarder }
    });
    res.json(student);
  } catch (err) {
    console.error('Failed to update student:', err);
    res.status(500).json({ error: 'Failed to update student' });
  }
}

export async function listStudents(req: Request, res: Response) {
  try {
    const students = await prisma.student.findMany({
      include: {
        assignments: {
          include: { feeRule: { include: { feeComponent: true } }, transactions: true }
        }
      },
      orderBy: [{ grade: 'asc' }, { section: 'asc' }]
    });
    res.json(students);
  } catch (err) {
    console.error('Failed to fetch students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
}

export async function getStudent(req: Request, res: Response) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        assignments: {
          include: {
            feeRule: { include: { feeComponent: true } },
            installments: { include: { transactions: true } },
            transactions: true
          }
        }
      }
    });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    console.error('Failed to fetch student:', err);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
}

export async function getStudentNoDues(req: Request, res: Response) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        assignments: {
          include: { feeRule: { include: { feeComponent: true } }, transactions: true }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const outstanding = student.assignments
      .map((assignment) => {
        let balance = assignment.amount;
        for (const t of assignment.transactions) {
          if (t.type === 'PAYMENT' || t.type === 'REFUND' || t.type === 'WAIVER') {
            balance -= t.amount;
          } else if (t.type === 'LATE_FEE') {
            balance += t.amount;
          }
        }
        return { feeName: assignment.feeRule.feeComponent.name, balance };
      })
      .filter((a) => a.balance > 0);

    res.json({
      studentId: student.id,
      studentName: student.name,
      hasDues: outstanding.length > 0,
      outstanding
    });
  } catch (err) {
    console.error('Failed to check no-dues status:', err);
    res.status(500).json({ error: 'Failed to check no-dues status' });
  }
}
