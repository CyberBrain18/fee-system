import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getWithdrawnStudents } from '../lib/api';

function WithdrawnStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWithdrawnStudents()
      .then(setStudents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FAF9F5] text-[#141413] font-sans">
      <Sidebar active="withdrawn" />
      <main className="flex-1 p-10 flex flex-col gap-6">
        <div>
          <h1 className="font-display font-semibold text-[28px] m-0">Withdrawn Students</h1>
          <div className="text-sm text-[#73726C] mt-1">Kept for record — not shown in active views</div>
        </div>

        {loading && <div>Loading...</div>}
        {error && <div className="text-[#B3261E] text-sm">{error}</div>}

        {!loading && !error && (
          <div className="bg-white border border-black/10 rounded-xl overflow-hidden">
            {students.length === 0 ? (
              <div className="p-6 text-sm text-[#73726C]">No withdrawn students on record.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[13px] text-[#73726C] bg-black/[0.02]">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Grade</th>
                    <th className="px-6 py-3">Withdrawn On</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-t border-black/5">
                      <td className="px-6 py-3 font-semibold">{s.name}</td>
                      <td className="px-6 py-3">Grade {s.grade}{s.section}</td>
                      <td className="px-6 py-3 font-mono text-[13px]">
                        {new Date(s.withdrawnAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Link to={`/students/${s.id}`} className="font-semibold text-[#2A78D6] no-underline">
                          View record →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default WithdrawnStudents;