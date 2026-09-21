import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeeRules } from './api';

function FeeRules() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFeeRules()
      .then(setRules)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 font-sans">Loading...</div>;
  if (error) return <div className="p-8 text-red-600 font-sans">Error: {error}</div>;

  return (
    <div className="flex min-h-screen bg-[#FAF9F5] text-[#141413] font-sans">
      <aside className="w-60 shrink-0 bg-white border-r border-black/10 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#2A78D6]" />
          <div className="font-display font-semibold text-[15px]">Meridian School</div>
        </div>
        <nav className="flex flex-col gap-1">
          <Link to="/" className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#5E5D59] no-underline">Dashboard</Link>
          <div className="px-3 py-2.5 rounded-lg text-sm font-medium bg-[#2A78D6]/10 text-[#2A78D6]">Fee Rules</div>
        </nav>
      </aside>

      <main className="flex-1 p-10 flex flex-col gap-6">
        <div>
          <h1 className="font-display font-semibold text-[28px] m-0">Fee Rules</h1>
          <div className="text-sm text-[#73726C] mt-1">What each fee costs, per academic year</div>
        </div>

        <div className="bg-white border border-black/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-[13px] text-[#73726C]">
                <th className="px-6 py-3 font-medium">Component</th>
                <th className="px-6 py-3 font-medium">Grade</th>
                <th className="px-6 py-3 font-medium">Year</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Rate/km</th>
                <th className="px-6 py-3 font-medium">Late Fee</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className="border-t border-black/5">
                  <td className="px-6 py-3 font-semibold">{rule.feeComponent.name}</td>
                  <td className="px-6 py-3 text-[#73726C]">{rule.grade ?? '—'}</td>
                  <td className="px-6 py-3">{rule.academicYear}</td>
                  <td className="px-6 py-3 font-mono">₹{rule.amount.toLocaleString()}</td>
                  <td className="px-6 py-3 font-mono text-[#73726C]">
                    {rule.ratePerKm != null ? `₹${rule.ratePerKm}` : '—'}
                  </td>
                  <td className="px-6 py-3 font-mono">{rule.lateFeePercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default FeeRules;