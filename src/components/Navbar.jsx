import { Layers } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/features', label: 'Features' },
  { to: '/templates', label: 'Templates' },
  { to: '/pricing', label: 'Pricing' },
];

export default function Navbar() {
  const handleSignIn = () => {
    alert('Coming soon');
  };

  return (
    <nav className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary p-2 text-white shadow-md shadow-emerald-900/10">
            <Layers size={22} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-slate-950">
            CarouselAI
          </span>
        </Link>

        <div className="order-3 flex w-full items-center gap-2 overflow-x-auto text-sm font-medium text-slate-600 sm:order-none sm:w-auto sm:justify-center">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `rounded-2xl px-3 py-2 transition ${
                  isActive
                    ? 'bg-slate-950 text-white'
                    : 'hover:bg-slate-100 hover:text-slate-950'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <button
          onClick={handleSignIn}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-95"
        >
          Sign In
        </button>
      </div>
    </nav>
  );
}
