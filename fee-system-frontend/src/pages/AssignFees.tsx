import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStudent, getFeeRules, assignFee } from '../lib/api';

function ruleLabel(rule: any) {
  const parts = [rule.feeComponent.name];
  if (rule.grade) parts.push(`Grade ${rule.grade}`);
  parts.push(rule.academicYear);
  const price = rule.feeComponent.calculationType === 'DISTANCE_BASED'
    ? `₹${rule.ratePerKm}/km`
    : `₹${rule.amount.toLocaleString()}`;
  return `${parts.join(' — ')} (${price})`;
}

function AssignFee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [rules, setRules] = useState<any[]>([]);
  const [feeRuleId, setFeeRuleId] = useState('');
  const [split, setSplit] = useState(false);
  const [installmentCount, setInstallmentCount] = useState('3');
  const [firstDueDate, setFirstDueDate] = useState('');
  const [monthsBetween, setMonthsBetween] = useState('3');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getStudent(id), getFeeRules()])
      .then(([s, allRules]) => {
        setStudent(s);
        const assignedRuleIds = new Set(s.assignments.map((a: any) => a.feeRuleId));
        const applicable = allRules.filter(
          (r: any) => (r.grade == null || r.grade === s.grade) && !assignedRuleIds.has(r.id)
        );
        setRules(applicable);
        if (applicable.length > 0) setFeeRuleId(applicable[0].id);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const selectedRule = rules.find((r) => r.id === feeRuleId);

  let previewAmount: number | null = null;
  if (selectedRule && student) {
    if (selectedRule.feeComponent.calculationType === 'DISTANCE_BASED') {
      previewAmount = student.distanceKm != null ? selectedRule.ratePerKm * student.distanceKm : null;
    } else {
      previewAmount = selectedRule.amount;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !selectedRule) return;
    setError(null);
    setSubmitting(true);
    try {
      await assignFee({
        studentId: id,
        feeRuleId,
        academicYear: selectedRule.academicYear,
        installmentCount: split ? Number(installmentCount) : undefined,
        firstDueDate: split ? firstDueDate : undefined,
        monthsBetween: split ? Number(monthsBetween) : undefined,
      });
      navigate(`/students/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!student && !error) return <div className="p-8 font-sans">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#141413]/45 flex items-center justify-center font-sans">
      <form onSubmit={handleSubmit} className="w-[480px] bg-white rounded-2xl p-8 flex flex-col gap-5 shadow-xl">
        <div>
          <h2 className="font-display font-semibold text-xl m-0 mb-1">Assign Fee</h2>
          {student && (
            <div className="text-[13px] text-[#73726C]">
              {student.name} — Grade {student.grade}{student.section}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-[#B3261E]/10 text-[#B3261E] text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        {rules.length === 0 ? (
          <div className="text-sm text-[#73726C]">
            No unassigned fee rules match this student's grade. Create one on the Fee Rules page first.
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rule" className="text-[13px] font-medium text-[#5E5D59]">Fee</label>
              <select
                id="rule"
                value={feeRuleId}
                onChange={(e) => setFeeRuleId(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-black/15 text-sm bg-white"
              >
                {rules.map((r) => (
                  <option key={r.id} value={r.id}>{ruleLabel(r)}</option>
                ))}
              </select>
            </div>

            <div className="bg-[#F5F4ED] rounded-lg px-4 py-3 flex justify-between items-center text-sm">
              <span className="text-[#73726C]">This student will owe</span>
              <span className="font-mono font-semibold">
                {previewAmount != null ? `₹${previewAmount.toLocaleString()}` : 'Distance not set'}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="split" checked={!split} onChange={() => setSplit(false)} />
                Pay in full
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="split" checked={split} onChange={() => setSplit(true)} />
                Split into installments
              </label>
            </div>

            {split && (
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="count" className="text-[13px] font-medium text-[#5E5D59]">Installments</label>
                  <input
                    id="count"
                    type="number"
                    min={2}
                    value={installmentCount}
                    onChange={(e) => setInstallmentCount(e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-black/15 text-sm font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="first" className="text-[13px] font-medium text-[#5E5D59]">First due</label>
                  <input
                    id="first"
                    type="date"
                    value={firstDueDate}
                    onChange={(e) => setFirstDueDate(e.target.value)}
                    required={split}
                    className="px-3 py-2.5 rounded-lg border border-black/15 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="gap" className="text-[13px] font-medium text-[#5E5D59]">Months apart</label>
                  <input
                    id="gap"
                    type="number"
                    min={1}
                    value={monthsBetween}
                    onChange={(e) => setMonthsBetween(e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-black/15 text-sm font-mono"
                  />
                </div>
              </div>
            )}
          </>
        )}

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
            disabled={submitting || rules.length === 0}
            className="px-4.5 py-2.5 rounded-lg border-none bg-[#2A78D6] text-white text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? 'Assigning...' : 'Assign Fee'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AssignFee;