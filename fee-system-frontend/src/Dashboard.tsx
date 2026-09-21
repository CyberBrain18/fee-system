import { useEffect, useState } from 'react';
import { getStudents } from './api';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { clearToken } from './auth';

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

function statusFor(balance: number) {
  if (balance <= 0) return { label: 'Paid', bg: 'bg-[#558A42]/10', text: 'text-[#558A42]' };
  return { label: 'Due', bg: 'bg-[#B3261E]/10', text: 'text-[#B3261E]' };
}

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

function Dashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  function handleLogout() {
    clearToken();
    navigate('/login');
  }

  useEffect(() => {
    getStudents()
      .then(setStudents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 font-sans">Loading...</div>;
  if (error) return <div className="p-8 text-red-600 font-sans">Error: {error}</div>;

  const grouped: Record<string, any[]> = {};
  for (const student of students) {
    if (!grouped[student.grade]) grouped[student.grade] = [];
    grouped[student.grade].push(student);
  }

  const totalCollected = students.reduce(
    (sum, s) => sum + s.assignments.reduce((s2: number, a: any) => s2 + computeAssignmentTotals(a).paid, 0),
    0
  );
  const totalOutstanding = students.reduce(
    (sum, s) => sum + s.assignments.reduce((s2: number, a: any) => s2 + Math.max(computeAssignmentTotals(a).balance, 0), 0),
    0
  );

  return (
    <div className="flex min-h-screen bg-[#FAF9F5] text-[#141413] font-sans">
      <aside className="w-60 shrink-0 bg-white border-r border-black/10 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#2A78D6]" />
          <div className="font-display font-semibold text-[15px]">Meridian School</div>
        </div>
        <nav className="flex flex-col gap-1">
          <div className="px-3 py-2.5 rounded-lg text-sm font-medium bg-[#2A78D6]/10 text-[#2A78D6]">Dashboard</div>
          <Link to="/fee-rules" className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#5E5D59] no-underline">Fee Rules</Link>
          <Link to="/no-dues" className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#5E5D59] no-underline">No-Dues Check</Link>
          <button
          type="button"
          onClick={handleLogout}
          className="mt-auto px-3 py-2.5 rounded-lg text-sm font-medium text-[#B3261E] text-left bg-transparent border-none cursor-pointer"
        >
          Log Out
        </button>
        
        </nav>
      </aside>

      <main className="flex-1 p-10 flex flex-col gap-7">
        <div className="flex justify-between items-center">
          <h1 className="font-display font-semibold text-[28px] m-0">Fee Collection — 2026</h1>
          <Link
            to="/students/new"
            className="px-4.5 py-2.5 rounded-lg border-none bg-[#2A78D6] text-white text-sm font-semibold no-underline"
          >
            + New Student
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-5">
          <div className="bg-white border border-black/10 rounded-xl p-5">
            <div className="text-[13px] text-[#73726C]">Total Collected</div>
            <div className="font-display font-semibold text-2xl mt-1">₹{totalCollected.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-black/10 rounded-xl p-5">
            <div className="text-[13px] text-[#73726C]">Total Outstanding</div>
            <div className="font-display font-semibold text-2xl mt-1 text-[#B3261E]">₹{totalOutstanding.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-black/10 rounded-xl p-5">
            <div className="text-[13px] text-[#73726C]">Students</div>
            <div className="font-display font-semibold text-2xl mt-1">{students.length}</div>
          </div>
          <div className="bg-white border border-black/10 rounded-xl p-5">
            <div className="text-[13px] text-[#73726C]">Fee Assignments</div>
            <div className="font-display font-semibold text-2xl mt-1">
              {students.reduce((s, st) => s + st.assignments.length, 0)}
            </div>
          </div>
        </div>

        <div className="bg-white border border-black/10 rounded-xl overflow-hidden">
          {Object.keys(grouped).sort().map((grade) => (
            <details key={grade} open className="border-b border-black/10 last:border-b-0">
              <summary className="px-6 py-3 font-display font-semibold text-[15px] cursor-pointer marker:text-[#9C9A92]">
                Grade {grade}
              </summary>
              <div className="px-6 pb-4">
                {Object.entries(
                  grouped[grade].reduce((acc: Record<string, any[]>, s) => {
                    (acc[s.section] ||= []).push(s);
                    return acc;
                  }, {})
                ).map(([section, sectionStudents]) => (
                  <div key={section} className="mb-2">
                    <div className="text-xs font-semibold text-[#9C9A92] mt-3 mb-1.5">Section {section}</div>
                    {sectionStudents.map((student) => (
                      <Link
                        key={student.id}
                        to={`/students/${student.id}`}
                        className="flex items-center gap-4 py-3 border-t border-black/5 hover:bg-black/[0.015] no-underline"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#2A78D6] text-white flex items-center justify-center font-display font-semibold text-xs shrink-0">
                          {initials(student.name)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-[#141413]">{student.name}</div>
                        </div>
                        <div className="flex gap-4 items-center">
                          {student.assignments.map((assignment: any) => {
                            const { balance } = computeAssignmentTotals(assignment);
                            const status = statusFor(balance);
                            return (
                              <div key={assignment.id} className="flex items-center gap-2 text-sm">
                                <span className="text-[#73726C]">{assignment.feeRule.feeComponent.name}</span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                                  {status.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;