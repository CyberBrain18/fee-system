import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeeRules, getFeeComponents, deleteFeeComponent, deleteFeeRule } from '../lib/api';
import Sidebar from '../components/Sidebar';
import { getRole } from '../lib/auth';


function FeeRules() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [components, setComponents] = useState<any[]>([]);

  const isAdmin = getRole() === 'ADMIN';

  function refetch() {
    getFeeRules().then(setRules).catch((err) => setError(err.message));
    getFeeComponents().then(setComponents).catch(() => {});
  }

  useEffect(() => {
    getFeeRules()
      .then(setRules)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    getFeeComponents()
      .then(setComponents)
      .catch(() => {});
  }, []);

  

  if (loading) return <div className="p-8 font-sans">Loading...</div>;
  if (error) return <div className="p-8 text-red-600 font-sans">Error: {error}</div>;

  return (
    <div className="flex min-h-screen bg-[#FAF9F5] text-[#141413] font-sans">
      <Sidebar active="fee-rules" />

      <main className="flex-1 p-10 flex flex-col gap-6">
        <div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-display font-semibold text-[28px] m-0">Fee Rules</h1>
              <div className="text-sm text-[#73726C] mt-1">What each fee costs, per academic year</div>
            </div>
            <div className="flex gap-3">
              <Link
                to="/fee-components/new"
                className="px-4.5 py-2.5 rounded-lg border-none bg-[#2A78D6] text-white text-sm font-semibold no-underline"
              >
                + New Fee Component
              </Link>
              <Link
                to="/fee-rules/new"
                className="px-4.5 py-2.5 rounded-lg border-none bg-[#2A78D6] text-white text-sm font-semibold no-underline"
              >
                + New Fee Rule
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white border border-black/10 rounded-xl p-5">
          <div className="font-display font-semibold text-sm mb-3">Fee Components</div>
          <div className="flex flex-wrap gap-2">
            {components.map((c) => (
              <span
                key={c.id}
                className="px-3 py-1.5 rounded-full bg-black/5 text-[13px] font-medium flex items-center gap-2"
              >
                {c.name} — {c.calculationType.replace('_', ' ').toLowerCase()}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await deleteFeeComponent(c.id);
                        refetch();
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }}
                    className="text-[#B3261E] bg-transparent border-none cursor-pointer text-xs font-bold"
                    aria-label={`Delete ${c.name}`}
                  >
                    ✕
                  </button>
                )}
              </span>
            ))}
          </div>
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
                <th className="px-6 py-3"></th>
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
                  <td className="px-6 py-3 text-right">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm(`Delete this ${rule.feeComponent.name} rule?`)) return;
                          try {
                            await deleteFeeRule(rule.id);
                            refetch();
                          } catch (err: any) {
                            alert(err.message);
                          }
                        }}
                        className="text-[#B3261E] text-[13px] font-semibold bg-transparent border-none cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  </td>
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