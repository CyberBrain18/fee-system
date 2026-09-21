import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.ts';

export async function createPayment(req: Request, res: Response) {
  const { feeAssignmentId, installmentId, amount } = req.body;
  try {
    if (installmentId) {
      const installment = await prisma.installment.findUnique({
        where: { id: installmentId },
        include: { transactions: true }
      });

      if (!installment) {
        return res.status(404).json({ error: 'Installment not found' });
      }

      let installmentBalance = installment.amount;
      for (const t of installment.transactions) {
        if (t.type === 'PAYMENT' || t.type === 'REFUND' || t.type === 'WAIVER') {
          installmentBalance -= t.amount;
        } else if (t.type === 'LATE_FEE') {
          installmentBalance += t.amount;
        }
      }

      if (amount > installmentBalance) {
        return res.status(400).json({ error: `Payment exceeds installment balance of ${installmentBalance}` });
      }
    } else {
      const assignment = await prisma.feeAssignment.findUnique({
        where: { id: feeAssignmentId },
        include: { feeRule: true, transactions: true }
      });

      if (!assignment) {
        return res.status(404).json({ error: 'Fee assignment not found' });
      }

      let assignmentBalance = assignment.amount;
      for (const t of assignment.transactions) {
        if (t.type === 'PAYMENT' || t.type === 'REFUND' || t.type === 'WAIVER') {
          assignmentBalance -= t.amount;
        } else if (t.type === 'LATE_FEE') {
          assignmentBalance += t.amount;
        }
      }

      if (amount > assignmentBalance) {
        return res.status(400).json({ error: `Payment exceeds assignment balance of ${assignmentBalance}` });
      }
    }

    const paymentCount = await prisma.transaction.count({
    where: { type: 'PAYMENT', receiptNumber: { not: null } }
    });
    const receiptNumber = `RCPT-2026-${String(paymentCount + 1).padStart(4, '0')}`;


    const transaction = await prisma.transaction.create({
      data: { feeAssignmentId, installmentId, amount, receiptNumber }
    });
    res.status(201).json(transaction);
  } catch (err) {
    console.error('Database write failed:', err);
    res.status(500).json({ error: 'Failed to save payment' });
  }
}

export async function createAdjustment(req: Request, res: Response) {
    const { feeAssignmentId, installmentId, type, amount, reason, approvedBy } = req.body;
    
    if (type !== 'REFUND' && type !== 'WAIVER') {
        return res.status(400).json({ error: 'type must be REFUND or WAIVER' });
    }

    try {
        const transaction = await prisma.transaction.create({
            data: {feeAssignmentId, installmentId, type, amount, reason, approvedBy }
        });
        res.status(201).json(transaction);
    } catch(err) {
         console.error('Failed to create adjustment:', err);
        res.status(500).json({ error: 'Failed to create adjustment' });
    }
}
