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

export async function bulkCreateStudents(req: Request, res: Response) {
  const { students, academicYear } = req.body;
  const results = [];

  for (const row of students) {
    try {
      const student = await prisma.student.create({
        data: {
          name: row.name,
          grade: row.grade,
          section: row.section,
          distanceKm: row.distanceKm ?? undefined,
          isBoarder: row.isBoarder ?? false
        }
      });

      const rules = await prisma.feeRule.findMany({
        where: { academicYear },
        include: { feeComponent: true }
      });

      const assignedFees: string[] = [];
      for (const rule of rules) {
        const type = rule.feeComponent.calculationType;
        const applies =
          (type === 'GRADE_BASED' && rule.grade === student.grade) ||
          (type === 'DISTANCE_BASED' && student.distanceKm != null) ||
          (type === 'FLAT' && student.isBoarder);

        if (!applies) continue;

        const amount = type === 'DISTANCE_BASED'
          ? rule.ratePerKm! * student.distanceKm!
          : rule.amount;

        await prisma.feeAssignment.create({
          data: { studentId: student.id, feeRuleId: rule.id, academicYear, amount }
        });
        assignedFees.push(rule.feeComponent.name);
      }

      results.push({ row: row.name, status: 'created', studentId: student.id, assignedFees });
    } catch (err: any) {
      results.push({ row: row.name, status: 'failed', error: err.message });
    }
  }

  res.status(207).json({ results });
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
      where: { id: (req.params.id as string) },
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
      where: { withdrawnAt: null },
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
      where: { id: (req.params.id as string) },
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
      where: { id: (req.params.id as string) },
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

export async function withdrawStudent(req: Request, res: Response) {
  try {
    const student = await prisma.student.update({
      where: { id: (req.params.id as string) },
      data: { withdrawnAt: new Date() }
    });
    res.json(student);
  } catch (err) {
    console.error('Failed to withdraw student:', err);
    res.status(500).json({ error: 'Failed to withdraw student' });
  }
}

export async function listWithdrawnStudents(req: Request, res: Response) {
  try {
    const students = await prisma.student.findMany({
      where: { withdrawnAt: { not: null } },
      orderBy: { withdrawnAt: 'desc' }
    });
    res.json(students);
  } catch (err) {
    console.error('Failed to fetch withdrawn students:', err);
    res.status(500).json({ error: 'Failed to fetch withdrawn students' });
  }
}
