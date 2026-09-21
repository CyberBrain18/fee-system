import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import authRouter from './routes/auth.routes.ts';
import studentsRouter from './routes/students.routes.ts';
import feeComponentsRouter from './routes/feeComponents.routes.ts';
import feeRulesRouter from './routes/feeRules.routes.ts';
import feeAssignmentsRouter from './routes/feeAssignments.routes.ts';
import installmentsRouter from './routes/installments.routes.ts';
import paymentsRouter from './routes/payments.routes.ts';
import transactionsRouter from './routes/transactions.routes.ts';

const app = express();
app.use(express.json());
app.use(cors());

app.use('/auth', authRouter);
app.use('/students', studentsRouter);
app.use('/fee-components', feeComponentsRouter);
app.use('/fee-rules', feeRulesRouter);
app.use('/fee-assignments', feeAssignmentsRouter);
app.use('/installments', installmentsRouter);
app.use('/payments', paymentsRouter);
app.use('/transactions', transactionsRouter);

app.listen(3000, ()=> {
    console.log('Running on port 3000');
})
