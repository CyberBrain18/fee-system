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
