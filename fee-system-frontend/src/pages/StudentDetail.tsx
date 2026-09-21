import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudent } from '../lib/api';
import Sidebar from '../components/Sidebar';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import { withdrawStudent as withdrawStudentApi } from '../lib/api';
import { getRole } from '../lib/auth';

function computeInstallmentTotals(installment: any) {

  let balance = installment.amount;
  let paid = 0;
  let lateFee = 0;
  for (const t of installment.transactions) {
    if (t.type === 'PAYMENT' || t.type === 'REFUND' || t.type === 'WAIVER') {
      balance -= t.amount;
      if (t.type === 'PAYMENT') paid += t.amount;
    } else if (t.type === 'LATE_FEE') {
      balance += t.amount;
      lateFee += t.amount;
    }
  }
  return { paid, balance, lateFee };
}

function computeAssignmentTotals(assignment: any) {
  let balance = assignment.amount;
  let paid = 0;
  for (const t of assignment.transactions) {
    if (t.type === 'PAYMENT' || t.type === 'REFUND' || t.type === 'WAIVER') {
      balance -= t.amount;
      if (t.type === 'PAYMENT') paid += t.amount;
    } else if (t.type === 'LATE_FEE') {
      balance += t.amount;
    }
  }
  return { paid, balance };
}

function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!id) return;
    getStudent(id)
      .then(setStudent)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 font-sans">Loading...</div>;
  if (error) return <div className="p-8 text-red-600 font-sans">Error: {error}</div>;
  if (!student) return null;

  const allTransactions = student.assignments
    .flatMap((a: any) => a.transactions.map((t: any) => ({ ...t, feeName: a.feeRule.feeComponent.name })))
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex min-h-screen bg-[#FAF9F5] text-[#141413] font-sans">
      <Sidebar active="dashboard" activeAsLink />

      <main className="flex-1 p-10 flex flex-col gap-6">
        <Link to="/" className="text-sm font-medium text-[#73726C] no-underline">← Back to students</Link>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Avatar name={student.name} className="w-14 h-14 text-xl" />
          <div>
            <h1 className="font-display font-semibold text-2xl m-0">{student.name}</h1>
            <div className="text-[13px] text-[#73726C] flex gap-2 items-center mt-1">
              <span className="font-mono">{student.id.slice(0, 8)}</span>
              <span>·</span>
              <span>Grade {student.grade}{student.section}</span>
              {student.distanceKm != null && (
                <>
                  <span>·</span>
                  <span>{student.distanceKm} km from school</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
        <Link
          to={`/students/${student.id}/assign-fee`}
          className="px-4.5 py-2.5 rounded-lg border-none bg-[#2A78D6] text-white text-sm font-semibold no-underline"
        >
          + Assign Fee
        </Link>
        {student.withdrawnAt ? (
        <div className="bg-black/5 text-[#5E5D59] text-sm rounded-lg px-4 py-3">
          This student was withdrawn on {new Date(student.withdrawnAt).toLocaleDateString()}. Their record is kept for history but they no longer appear in active lists.
        </div>
      ) : getRole() === 'ADMIN' ? (
        <button
          type="button"
          onClick={async () => {
            if (!confirm(`Withdraw ${student.name}? This can't be undone.`)) return;
            await withdrawStudentApi(student.id);
            window.location.reload();
          }}
          className="px-4 py-2.5 rounded-lg border border-[#B3261E]/30 text-[#B3261E] text-[13px] font-semibold bg-white"
        >
          Withdraw Student
        </button>
      ) : null}
        </div>
      </div>
      

      {student.assignments.map((assignment: any) => {
        const { paid, balance } = computeAssignmentTotals(assignment);
        return (
          <div key={assignment.id} className="bg-white border border-black/10 rounded-xl p-6">
            <div className="flex justify-between items-center">
              <div className="font-display font-semibold text-lg">
                {assignment.feeRule.feeComponent.name} — {assignment.academicYear}
              </div>
              <div className="flex gap-6 text-[13px] items-center">
                <span className="text-[#73726C]">Owed <span className="font-mono text-[#141413]">₹{assignment.amount.toLocaleString()}</span></span>
                <span className="text-[#73726C]">Paid <span className="font-mono text-[#141413]">₹{paid.toLocaleString()}</span></span>
                <span className="text-[#73726C]">
                  Balance{' '}
                  <span className={`font-mono font-semibold ${balance > 0 ? 'text-[#B3261E]' : 'text-[#558A42]'}`}>
                    ₹{Math.abs(balance).toLocaleString()}{balance < 0 ? ' (credit)' : ''}
                  </span>
                </span>
                {balance > 0 && (
                  <Link
                    to={`/payments/new?assignmentId=${assignment.id}`}
                    className="px-3.5 py-2 rounded-lg border border-black/15 text-[13px] font-semibold text-[#141413] no-underline"
                  >
                    Record Payment
                  </Link>
                )}
              </div>
            </div>

            {assignment.installments.length > 0 && (
              <div className="mt-4">
                {assignment.installments
                  .sort((a: any, b: any) => a.installmentNumber - b.installmentNumber)
                  .map((installment: any) => {
                    const inst = computeInstallmentTotals(installment);
                    return (
                      <div key={installment.id} className="flex justify-between items-center py-3 border-t border-black/10 text-sm">
                        <div>
                          <div className="font-semibold">Installment {installment.installmentNumber}</div>
                          <div className="text-[13px] text-[#73726C]">
                            Due {new Date(installment.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <StatusBadge paid={inst.balance <= 0} />
                          {inst.lateFee > 0 && (
                            <span className="text-xs text-[#B3261E]">Late fee +₹{inst.lateFee.toLocaleString()}</span>
                          )}
                        </div>
                        <div className="text-right font-mono">
                          <div>₹{Math.max(inst.balance, 0).toLocaleString()} due</div>
                          <div className="text-xs text-[#9C9A92]">₹{inst.paid.toLocaleString()} paid</div>
                        </div>
                        {inst.balance > 0 && (
                          <Link
                            to={`/payments/new?assignmentId=${assignment.id}&installmentId=${installment.id}`}
                            className="px-3.5 py-2 rounded-lg border border-black/15 text-[13px] font-semibold text-[#141413] no-underline"
                          >
                            Record Payment
                          </Link>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}

      <div className="bg-white border border-black/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-black/10 font-display font-semibold">Transaction History</div>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-[13px] text-[#73726C]">
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Fee</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Receipt</th>
              <th className="px-6 py-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {allTransactions.map((t: any) => (
              <tr key={t.id} className="border-t border-black/5">
                <td className="px-6 py-3 font-mono text-[13px]">{new Date(t.date).toLocaleDateString()}</td>
                <td className="px-6 py-3">{t.feeName}</td>
                <td className="px-6 py-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/5 text-[#5E5D59]">
                    {t.type}
                  </span>
                </td>
                <td className="px-6 py-3 font-mono text-xs text-[#9C9A92]">{t.receiptNumber ?? '—'}</td>
                <td className="px-6 py-3 text-right font-mono">₹{t.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </main>
    </div>
  );
}

export default StudentDetail;