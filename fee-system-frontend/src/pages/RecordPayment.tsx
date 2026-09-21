import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { recordPayment } from '../lib/api';


function RecordPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const feeAssignmentId = searchParams.get('assignmentId') ?? '';
  const installmentId = searchParams.get('installmentId') ?? undefined;

  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await recordPayment({
        feeAssignmentId,
        installmentId,
        amount: Number(amount),
      });
      navigate(-1);
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
        <div className="flex justify-between items-start">
          <h2 className="font-display font-semibold text-xl m-0">Record Payment</h2>
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Close"
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#73726C] text-base bg-transparent border-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-[#B3261E]/10 text-[#B3261E] text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="amount" className="text-[13px] font-medium text-[#5E5D59]">
            Amount (₹)
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="px-3 py-2.5 rounded-lg border border-black/15 text-[15px] font-mono"
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
            {submitting ? 'Recording...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RecordPayment;