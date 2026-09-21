import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStudent } from '../lib/api';

function CreateStudent() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('8');
  const [section, setSection] = useState('A');
  const [distanceKm, setDistanceKm] = useState('');
  const [isBoarder, setIsBoarder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createStudent({
        name,
        grade,
        section,
        distanceKm: distanceKm ? Number(distanceKm) : undefined,
        isBoarder,
      });
      navigate('/');
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
          <h2 className="font-display font-semibold text-xl m-0">New Student</h2>
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
          <div className="bg-[#B3261E]/10 text-[#B3261E] text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-[13px] font-medium text-[#5E5D59]">Full Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="px-3 py-2.5 rounded-lg border border-black/15 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="grade" className="text-[13px] font-medium text-[#5E5D59]">Grade</label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-black/15 text-sm bg-white"
            >
              <option>5</option>
              <option>6</option>
              <option>7</option>
              <option>8</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="section" className="text-[13px] font-medium text-[#5E5D59]">Section</label>
            <select
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-black/15 text-sm bg-white"
            >
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="distance" className="text-[13px] font-medium text-[#5E5D59]">
            Distance from school (km)
          </label>
          <input
            id="distance"
            type="number"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            placeholder="e.g. 12"
            className="px-3 py-2.5 rounded-lg border border-black/15 text-sm font-mono"
          />
          <div className="text-xs text-[#9C9A92]">Used to calculate transport fees, if applicable</div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isBoarder}
            onChange={(e) => setIsBoarder(e.target.checked)}
          />
          Boarding student (hostel)
        </label>

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
            {submitting ? 'Creating...' : 'Create Student'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateStudent;