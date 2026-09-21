import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFeeComponents, createFeeRule } from '../lib/api';

function FeeRuleForm() {
  const navigate = useNavigate();
  const [components, setComponents] = useState<any[]>([]);
  const [feeComponentId, setFeeComponentId] = useState('');
  const [grade, setGrade] = useState('');
  const [academicYear, setAcademicYear] = useState('2026');
  const [amount, setAmount] = useState('');
  const [ratePerKm, setRatePerKm] = useState('');
  const [lateFeePercent, setLateFeePercent] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getFeeComponents()
      .then((data) => {
        setComponents(data);
        if (data.length > 0) setFeeComponentId(data[0].id);
      })
      .catch((err) => setError(err.message));
  }, []);

  const selectedComponent = components.find((c) => c.id === feeComponentId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createFeeRule({
        feeComponentId,
        grade: grade || undefined,
        academicYear,
        amount: Number(amount) || 0,
        ratePerKm: ratePerKm ? Number(ratePerKm) : undefined,
        lateFeePercent: Number(lateFeePercent),
      });
      navigate('/fee-rules');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#141413]/45 flex items-center justify-center font-sans">
      <form
        onSubmit={handleSubmit}
        className="w-[480px] bg-white rounded-2xl p-8 flex flex-col gap-5 shadow-xl"
      >
        <h2 className="font-display font-semibold text-xl m-0">New Fee Rule</h2>

        {error && (
          <div className="bg-[#B3261E]/10 text-[#B3261E] text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="component" className="text-[13px] font-medium text-[#5E5D59]">Fee Component</label>
          <select
            id="component"
            value={feeComponentId}
            onChange={(e) => setFeeComponentId(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-black/15 text-sm bg-white"
          >
            {components.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.calculationType.replace('_', ' ').toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fgrade" className="text-[13px] font-medium text-[#5E5D59]">Grade</label>
            <input
              id="fgrade"
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g. 8"
              disabled={selectedComponent?.calculationType !== 'GRADE_BASED'}
              className="px-3 py-2.5 rounded-lg border border-black/15 text-sm disabled:bg-black/5 disabled:text-[#9C9A92]"
            />
            <div className="text-[11px] text-[#9C9A92]">Leave blank if this fee isn't grade-specific</div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fyear" className="text-[13px] font-medium text-[#5E5D59]">Academic Year</label>
            <input
              id="fyear"
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-black/15 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="famount" className="text-[13px] font-medium text-[#5E5D59]">Amount (₹)</label>
            <input
              id="famount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 30000"
              disabled={selectedComponent?.calculationType === 'DISTANCE_BASED'}
              className="px-3 py-2.5 rounded-lg border border-black/15 text-sm font-mono disabled:bg-black/5 disabled:text-[#9C9A92]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="frate" className="text-[13px] font-medium text-[#5E5D59]">Rate per km (₹)</label>
            <input
              id="frate"
              type="number"
              value={ratePerKm}
              onChange={(e) => setRatePerKm(e.target.value)}
              placeholder="e.g. 150"
              disabled={selectedComponent?.calculationType !== 'DISTANCE_BASED'}
              className="px-3 py-2.5 rounded-lg border border-black/15 text-sm font-mono disabled:bg-black/5 disabled:text-[#9C9A92]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="flate" className="text-[13px] font-medium text-[#5E5D59]">Late Fee (%)</label>
          <input
            id="flate"
            type="number"
            value={lateFeePercent}
            onChange={(e) => setLateFeePercent(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-black/15 text-sm font-mono w-28"
          />
        </div>

        <div className="flex justify-end gap-3 mt-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4.5 py-2.5 rounded-lg border border-black/15 text-sm font-semibold bg-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4.5 py-2.5 rounded-lg border-none bg-[#2A78D6] text-white text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Fee Rule'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FeeRuleForm;