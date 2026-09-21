import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFeeComponent } from './api';

const CALC_TYPES = [
  { value: 'GRADE_BASED', label: 'Grade-based', desc: "Same amount for every student in a grade — e.g. Tuition, Exam" },
  { value: 'DISTANCE_BASED', label: 'Distance-based', desc: "Calculated from a rate per km × student's distance — e.g. Transport" },
  { value: 'FLAT', label: 'Flat', desc: 'One fixed amount for every student who opts in — e.g. Hostel' },
];

function FeeComponentForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [calculationType, setCalculationType] = useState('GRADE_BASED');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createFeeComponent({ name, calculationType });
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
        className="w-[460px] bg-white rounded-2xl p-8 flex flex-col gap-5 shadow-xl"
      >
        <div>
          <h2 className="font-display font-semibold text-xl m-0 mb-1">New Fee Component</h2>
          <div className="text-[13px] text-[#73726C]">A fee type schools charge for, e.g. Tuition, Transport, Hostel</div>
        </div>

        {error && (
          <div className="bg-[#B3261E]/10 text-[#B3261E] text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="cname" className="text-[13px] font-medium text-[#5E5D59]">Name</label>
          <input
            id="cname"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Transport"
            required
            className="px-3 py-2.5 rounded-lg border border-black/15 text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-[#5E5D59]">Calculation Type</span>
          {CALC_TYPES.map((t) => (
            <label
              key={t.value}
              className="flex gap-2.5 p-3 border border-black/15 rounded-lg cursor-pointer"
            >
              <input
                type="radio"
                name="calcType"
                checked={calculationType === t.value}
                onChange={() => setCalculationType(t.value)}
                className="mt-0.5"
              />
              <span>
                <span className="block font-semibold text-sm">{t.label}</span>
                <span className="block text-xs text-[#73726C]">{t.desc}</span>
              </span>
            </label>
          ))}
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
            {submitting ? 'Creating...' : 'Create Component'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FeeComponentForm;