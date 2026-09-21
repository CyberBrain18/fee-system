import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { request } from '../lib/api';

function rowsFromSheet(data: any[][]) {
  const [header, ...rows] = data;
  const colIndex = (name: string) =>
    header.findIndex((h: string) => String(h).trim().toLowerCase() === name);

  const iName = colIndex('name');
  const iGrade = colIndex('grade');
  const iSection = colIndex('section');
  const iDistance = colIndex('distancekm');
  const iBoarder = colIndex('isboarder');

  return rows
    .filter((r) => r[iName])
    .map((r) => ({
      name: String(r[iName]).trim(),
      grade: String(r[iGrade]).trim(),
      section: String(r[iSection]).trim(),
      distanceKm: r[iDistance] !== undefined && r[iDistance] !== '' ? Number(r[iDistance]) : undefined,
      isBoarder: String(r[iBoarder]).trim().toLowerCase() === 'true',
    }));
}

function BulkCreateStudents() {
  
  const [preview, setPreview] = useState<any[]>([]);
  const [academicYear, setAcademicYear] = useState('2026');
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResults(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target?.result, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        setPreview(rowsFromSheet(data));
      } catch (err: any) {
        setError('Could not read that file. Make sure it\'s a valid .xlsx or .csv file.');
      }
    };
    reader.readAsBinaryString(file);
  }

  async function handleImport() {
    setError(null);
    setSubmitting(true);
    try {
      const data = await request('/students/bulk', {
        method: 'POST',
        body: JSON.stringify({ students: preview, academicYear }),
      });
      setResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center font-sans p-10">
      <div className="w-[680px] bg-white border border-black/10 rounded-2xl p-8 flex flex-col gap-5">
        <div>
          <h2 className="font-display font-semibold text-xl m-0 mb-1">Bulk Import Students</h2>
          <div className="text-[13px] text-[#73726C]">
            Upload an Excel or CSV file. Columns: name, grade, section, distanceKm, isBoarder.
            Applicable fee rules are assigned automatically per student.
          </div>
        </div>

        {error && <div className="bg-[#B3261E]/10 text-[#B3261E] text-sm rounded-lg px-4 py-3">{error}</div>}

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[#5E5D59]">Academic Year</label>
          <input
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-black/15 text-sm w-32"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[#5E5D59]">File</label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFile}
            className="text-sm"
          />
        </div>

        {preview.length > 0 && (
          <div className="border border-black/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[13px] text-[#73726C] bg-black/[0.02]">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Grade</th>
                  <th className="px-3 py-2">Section</th>
                  <th className="px-3 py-2">Distance</th>
                  <th className="px-3 py-2">Boarder</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r, i) => (
                  <tr key={i} className="border-t border-black/5">
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2">{r.grade}</td>
                    <td className="px-3 py-2">{r.section}</td>
                    <td className="px-3 py-2">{r.distanceKm ?? '—'}</td>
                    <td className="px-3 py-2">{r.isBoarder ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link to="/" className="px-4.5 py-2.5 rounded-lg border border-black/15 text-sm font-semibold bg-white no-underline">
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleImport}
            disabled={submitting || preview.length === 0}
            className="px-4.5 py-2.5 rounded-lg border-none bg-[#2A78D6] text-white text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? 'Importing...' : `Import ${preview.length || ''} Students`}
          </button>
        </div>

        {results && (
          <div className="border-t border-black/10 pt-4 flex flex-col gap-2">
            {results.map((r, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{r.row}</span>
                {r.status === 'created' ? (
                  <span className="text-[#558A42]">
                    Created — {r.assignedFees.length ? r.assignedFees.join(', ') : 'no fees matched'}
                  </span>
                ) : (
                  <span className="text-[#B3261E]">Failed: {r.error}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BulkCreateStudents;