import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.ts';

export async function createFeeAssignment(req: Request, res: Response) {
  const { studentId, feeRuleId, academicYear, installmentCount, firstDueDate, monthsBetween } = req.body;
  try {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const feeRule = await prisma.feeRule.findUnique({
      where: { id: feeRuleId },
      include: { feeComponent: true }
    });
    if (!feeRule) {
      return res.status(404).json({ error: 'Fee rule not found' });
    }

    const existing = await prisma.feeAssignment.findFirst({ where: { studentId, feeRuleId } });
    if (existing) {
      return res.status(409).json({ error: 'This fee is already assigned to this student' });
    }

    let amount: number;
    if (feeRule.feeComponent.calculationType === 'DISTANCE_BASED') {
      if (student.distanceKm == null || feeRule.ratePerKm == null) {
        return res.status(400).json({ error: 'Set the student\'s distance from school before assigning transport' });
      }
      amount = feeRule.ratePerKm * student.distanceKm;
    } else {
      amount = feeRule.amount;
    }

    const count = Number(installmentCount) || 0;
    const installmentsData: { installmentNumber: number; amount: number; dueDate: Date }[] = [];
    if (count > 1) {
      if (!firstDueDate) {
        return res.status(400).json({ error: 'First due date is required when splitting into installments' });
      }
      const gap = Number(monthsBetween) || 1;
      const base = Math.floor((amount / count) * 100) / 100;
      for (let i = 0; i < count; i++) {
        const due = new Date(firstDueDate);
        due.setMonth(due.getMonth() + i * gap);
        const isLast = i === count - 1;
        const instAmount = isLast ? Math.round((amount - base * (count - 1)) * 100) / 100 : base;
        installmentsData.push({ installmentNumber: i + 1, amount: instAmount, dueDate: due });
      }
    }

    const assignment = await prisma.feeAssignment.create({
      data: {
        studentId,
        feeRuleId,
        academicYear,
        amount,
        installments: installmentsData.length ? { create: installmentsData } : undefined
      },
      include: { installments: true }
    });
    res.status(201).json(assignment);
  } catch (err) {
    console.error('Database write failed:', err);
    res.status(500).json({ error: 'Failed to save fee assignment' });
  }
}

export async function getFeeAssignmentBalance(req: Request, res: Response) {
    try {
        const assignment = await prisma.feeAssignment.findUnique({
            where: { id: (req.params.id as string) },
            include: {feeRule: true, transactions: true}
        });
        if (!assignment) {
            return res.status(404).json({ error: 'fee assignment not found' });
        }
        let balance = assignment.amount;
        for (const t of assignment.transactions) {
            if (t.type === 'PAYMENT' || t.type === 'REFUND' || t.type === 'WAIVER') {
                balance -= t.amount;
            }
            else if (t.type === 'LATE_FEE') {
                balance += t.amount;
            }
        }
        res.json({ owed: assignment.amount, balance });

    } catch (err) {
        console.error('Failed to compute balance:', err);
        res.status(500).json({ error: 'Failed to compute balance' });
    }
}
