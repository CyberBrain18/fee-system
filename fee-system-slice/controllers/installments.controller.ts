import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.ts';

export async function createInstallment(req: Request, res: Response) {
    const { feeAssignmentId, installmentNumber, amount, dueDate } = req.body;
    try {
        const installment = await prisma.installment.create({
            data: {
                feeAssignmentId,
                installmentNumber, 
                amount, 
                dueDate: new Date(dueDate)
            }
        });
        res.status(201).json(installment);
    } catch (err) {
        console.error('Database write failed:', err);
        res.status(500).json({ error: 'Failed to save installment' });
    }
}

export async function listInstallmentsForAssignment(req: Request, res: Response) {
    try {
        const installments = await prisma.installment.findMany({
            where: { feeAssignmentId: req.params.id },
            include: { transactions: true },
            orderBy: { installmentNumber: 'asc'}
        });
        const result = installments.map(inst => {
            const paid = inst.transactions.reduce((sum, t) => sum + t.amount, 0);
            return {
                installmentNumber: inst.installmentNumber,
                amount: inst.amount,
                dueDate: inst.dueDate,
                paid,
                balance: inst.amount-paid
            }
        });
        res.json(result);
    } catch(err) {
        res.status(500).json({ error: 'Failed to fetch installments' });
    }
}

export async function chargeLateFee(req: Request, res: Response) {
    try {
        const installment = await prisma.installment.findUnique({
            where: { id: req.params.id },
            include: { transactions: true, feeAssignment: { include: { feeRule: true } } }
        });
        if (!installment) {
            return res.status(404).json({ error: 'Installment not found' });
        }
        const paid = installment.transactions.filter(t => t.type === 'PAYMENT').reduce(
            (sum, t) => sum + t.amount, 0
        );
        const overdueAmount = installment.amount - paid;
        const isOverdue = new Date() > installment.dueDate;
        if (!isOverdue || overdueAmount <= 0) {
            return res.status(400).json({ error: 'Installment is not overdue or already fully paid' });
        }
        const lateFeeAmount = overdueAmount * (installment.feeAssignment.feeRule.lateFeePercent / 100);
        const lateFeeTransaction = await prisma.transaction.create({
            data: {
                feeAssignmentId: installment.feeAssignmentId,
                installmentId: installment.id,
                type: 'LATE_FEE',
                amount: lateFeeAmount
        }
    });
    res.status(201).json(lateFeeTransaction);
    } catch(err) {
        res.status(500).json({ error: 'Failed to charge late fee' });
    }
}
