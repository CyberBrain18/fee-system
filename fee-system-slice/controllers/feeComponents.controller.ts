import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.ts';

export async function createFeeComponent(req: Request, res: Response) {
  const { name, calculationType } = req.body;
  try {
    const component = await prisma.feeComponent.create({
      data: { name, calculationType }
    });
    res.status(201).json(component);
  } catch (err) {
    console.error('Database write failed:', err);
    res.status(500).json({ error: 'Failed to save fee component' });
  }
}

export async function listFeeComponents(req: Request, res: Response) {
  try {
    const components = await prisma.feeComponent.findMany();
    res.json(components);
  } catch (err) {
    console.error('Failed to fetch fee components:', err);
    res.status(500).json({ error: 'Failed to fetch fee components' });
  }
}

export async function deleteFeeComponent(req: Request, res: Response) {
  try {
    const rulesUsingIt = await prisma.feeRule.count({ where: { feeComponentId: req.params.id } });
    if (rulesUsingIt > 0) {
      return res.status(409).json({ error: `Cannot delete: ${rulesUsingIt} fee rule(s) still use this component` });
    }
    await prisma.feeComponent.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete fee component:', err);
    res.status(500).json({ error: 'Failed to delete fee component' });
  }
}
