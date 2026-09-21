import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.ts';

export async function createFeeAssignment(req: Request, res: Response) {
    const { studentId, feeRuleId, academicYear } = req.body;
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
        
        let amount: number;

        if (feeRule.feeComponent.calculationType === 'DISTANCE_BASED') {
            if (student.distanceKm == null || feeRule.ratePerKm == null) {
                return res.status(400).json({ error: 'Missing distanceKm on student or ratePerKm on rule' });
            }
            amount = feeRule.ratePerKm * student.distanceKm;
        } else {
            amount = feeRule.amount;
        }
        const assignment = await prisma.feeAssignment.create({
            data: { studentId, feeRuleId, academicYear, amount }
        });
        res.status(201).json(assignment);
    } catch(err) {
        res.status(500).json({ error: 'failed to save fee assignment data'});
    }
}

export async function getFeeAssignmentBalance(req: Request, res: Response) {
    try {
        const assignment = await prisma.feeAssignment.findUnique({
            where: { id: req.params.id },
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
