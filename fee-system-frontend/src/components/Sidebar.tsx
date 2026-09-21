import { Link, useNavigate } from 'react-router-dom';
import { clearToken } from '../lib/auth';
import { getRole } from '../lib/auth';

type ActivePage = 'dashboard' | 'fee-rules' | 'no-dues' | 'withdrawn';

const activeClass = 'px-3 py-2.5 rounded-lg text-sm font-medium bg-[#2A78D6]/10 text-[#2A78D6]';
const inactiveClass = 'px-3 py-2.5 rounded-lg text-sm font-medium text-[#5E5D59] no-underline';

function Sidebar({
  active,
  activeAsLink = false,
  fillHeight = false,
}: {
  active: ActivePage;
  activeAsLink?: boolean;
  fillHeight?: boolean;
}) {
  const navigate = useNavigate();

  function handleLogout() {
    clearToken();
    navigate('/login');
  }

  function item(page: ActivePage, to: string, label: string) {
    if (active !== page) {
      return <Link to={to} className={inactiveClass}>{label}</Link>;
    }
    if (activeAsLink) {
      return <Link to={to} className={`${activeClass} no-underline`}>{label}</Link>;
    }
    return <div className={activeClass}>{label}</div>;
  }
  const isAdmin = getRole() === 'ADMIN';


  return (
    <aside className="w-60 shrink-0 bg-white border-r border-black/10 p-6 flex flex-col gap-8">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#2A78D6]" />
        <div className="font-display font-semibold text-[15px]">Meridian School</div>
      </div>
      <nav className={`flex flex-col gap-1${fillHeight ? ' flex-1' : ''}`}>
        {item('dashboard', '/', 'Dashboard')}
        {item('fee-rules', '/fee-rules', 'Fee Rules')}
        {item('no-dues', '/no-dues', 'No-Dues Check')}
        {isAdmin && (
        <Link
          to="/students/withdrawn"
          className={`px-3 py-2.5 rounded-lg text-sm font-medium no-underline ${
            active === 'withdrawn' ? 'bg-[#2A78D6]/10 text-[#2A78D6]' : 'text-[#5E5D59]'
          }`}
        >
          Withdrawn Students
        </Link>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto px-3 py-2.5 rounded-lg text-sm font-medium text-[#B3261E] text-left bg-transparent border-none cursor-pointer"
        >
          Log Out
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
