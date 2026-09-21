import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/api';
import { saveToken } from '../lib/auth';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login(email, password);
      saveToken(result.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center font-sans">
      <form
        onSubmit={handleSubmit}
        className="w-[420px] bg-white border border-black/10 rounded-2xl p-10 flex flex-col gap-5"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-[10px] bg-[#2A78D6]" />
          <div className="font-display font-semibold text-base">Meridian School</div>
        </div>

        <div className="text-center">
          <h1 className="font-display font-semibold text-xl m-0 mb-1.5">Staff Sign In</h1>
          <div className="text-[13px] text-[#73726C]">Enter your credentials to access the fee dashboard</div>
        </div>

        {error && (
          <div className="bg-[#B3261E]/10 text-[#B3261E] text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[13px] font-medium text-[#5E5D59]">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-3 py-2.5 rounded-lg border border-black/15 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[13px] font-medium text-[#5E5D59]">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-3 py-2.5 rounded-lg border border-black/15 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="py-3 rounded-lg border-none bg-[#2A78D6] text-white text-sm font-semibold disabled:opacity-50"
        >
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export default Login;