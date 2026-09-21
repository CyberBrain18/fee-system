import { useState } from 'react';
import { getStudents, getNoDuesStatus } from '../lib/api';
import Sidebar from '../components/Sidebar';
import Avatar from '../components/Avatar';

function NoDuesCheck() {
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    try {
      const all = await getStudents();
      const matches = all.filter((s: any) =>
        s.name.toLowerCase().includes(query.toLowerCase())
      );
      if (matches.length === 0) {
        setError('No student found matching that name.');
        return;
      }
      const status = await getNoDuesStatus(matches[0].id);
      setResult({ ...status, grade: matches[0].grade, section: matches[0].section });
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#FAF9F5] text-[#141413] font-sans">
      <Sidebar active="no-dues" fillHeight />

      <main className="flex-1 p-10 flex flex-col gap-6">
        <div>
          <h1 className="font-display font-semibold text-[28px] m-0">No-Dues Check</h1>
          <div className="text-sm text-[#73726C] mt-1">
            Verify a student has no outstanding balance before issuing a TC or approving re-admission
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by student name..."
            className="flex-1 px-4 py-3 rounded-lg border border-black/15 text-sm bg-white"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-lg border-none bg-[#2A78D6] text-white text-sm font-semibold"
          >
            Check Status
          </button>
        </form>

        {error && (
          <div className="bg-[#B3261E]/10 text-[#B3261E] text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        {result && (
          <div className="bg-white border border-black/10 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3.5 items-center">
                <Avatar name={result.studentName} className="w-11 h-11" />
                <div>
                  <div className="font-semibold text-[17px]">{result.studentName}</div>
                  <div className="text-[13px] text-[#73726C]">Grade {result.grade}{result.section}</div>
                </div>
              </div>
              <span
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-bold ${
                  result.hasDues ? 'bg-[#B3261E]/10 text-[#B3261E]' : 'bg-[#558A42]/10 text-[#558A42]'
                }`}
              >
                {result.hasDues ? '✕ Dues Pending' : '✓ Cleared for TC'}
              </span>
            </div>
            {result.hasDues && (
              <div className="border-t border-black/10 pt-4">
                <div className="text-[13px] text-[#73726C] mb-2.5">Outstanding balances</div>
                {result.outstanding.map((o: any) => (
                  <div key={o.feeName} className="flex justify-between py-2 text-sm">
                    <span>{o.feeName}</span>
                    <span className="font-mono text-[#B3261E]">₹{o.balance.toLocaleString()} due</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default NoDuesCheck;