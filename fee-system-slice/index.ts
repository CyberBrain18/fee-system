import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from './prisma/generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({adapter});

const app = express();
app.use(express.json());
app.use(cors());

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.post('/auth/signup', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash }
    });
    res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error('Signup failed:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

app.post('/fee-rules', requireAuth, async (req: Request, res: Response) => {
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
});

app.post('/students', requireAuth, async (req: Request, res: Response) => {
    const { name, grade } = req.body;
    try {
        const student = await prisma.student.create({
            data: { name, grade }
        });
        res.status(201).json(student);
    } catch(err) {
        res.status(500).json({ error: 'failed to save student data' });
    }
});

app.post('/fee-assignments', requireAuth, async (req: Request, res: Response) => {
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
});

app.post('/payments', requireAuth, async (req: Request, res: Response) => {
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
});

app.get('/fee-assignments/:id/balance', async (req: Request, res: Response) => {
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
});

app.post('/installments', requireAuth, async (req: Request, res: Response) => {
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
});

app.get('/fee-assignments/:id/installments', async (req: Request, res: Response) => {
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
});

app.patch('/fee-rules/:id', requireAuth, async (req: Request, res: Response) => {
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
});

app.post('/installments/:id/charge-late-fee', requireAuth, async (req: Request, res: Response) => {
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
});

app.post('/transactions/adjustment', requireAuth, async (req: Request, res: Response) => {
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
});

app.post('/students',requireAuth, async (req: Request, res: Response) => {
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
});

app.post('/fee-components', requireAuth, async (req: Request, res: Response) => {
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
});

app.patch('/students/:id', requireAuth, async (req: Request, res: Response) => {
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
});

app.get('/students', async (req: Request, res: Response) => {
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
});

app.get('/students/:id', async (req: Request, res: Response) => {
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
});

app.get('/fee-rules', async (req: Request, res: Response) => {
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
});

app.listen(3000, ()=> {
    console.log('Running on port 3000');
})