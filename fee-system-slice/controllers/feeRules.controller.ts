import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.ts';

export async function createFeeRule(req: Request, res: Response) {
    console.log('Request received:', req.body);
    const { feeComponentId, grade, academicYear, amount, ratePerKm } = req.body;
    try {
        const rule = await prisma.feeRule.create({
            data: { feeComponentId, grade, academicYear, amount, ratePerKm }
        });
        console.log('Saved to database:', rule);
        res.status(201).json(rule);
    } catch (err) {
        console.error('Database write failed:', err);
        res.status(500).json({ error: 'Failed to save fee rule' });
    }
}

export async function updateFeeRule(req: Request, res: Response) {
    const { lateFeePercent } = req.body;
    try {
        const rule = await prisma.feeRule.update({
            where: { id: req.params.id },
            data: { lateFeePercent }
        });
        res.json(rule);
    } catch(err) {
        console.error('Failed to update fee rule:', err)
        res.status(500).json({ error: 'Failed to update fee rule' });
    }
}

export async function listFeeRules(req: Request, res: Response) {
  try {
    const rules = await prisma.feeRule.findMany({
      include: { feeComponent: true },
      orderBy: { academicYear: 'desc' }
    });
    res.json(rules);
  } catch (err) {
    console.error('Failed to fetch fee rules:', err);
    res.status(500).json({ error: 'Failed to fetch fee rules' });
  }
}
