import { Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { Logo } from '../Logo';
import { INK, GOLD, PURPLE, NAV_ITEMS } from './tokens';
import type { NavItem } from './tokens';
import type { User as AuthUser } from '../../types';

export function LandingHeader({
  user,
  onLogin,
  onDashboard,
  activeNav,
  onNav,
}: {
  user: AuthUser | null;
  onLogin: () => void;
  onDashboard: () => void;
  activeNav: NavItem;
  onNav: (item: NavItem) => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (item: NavItem) => {
    onNav(item);
    setMobileMenuOpen(false);
  };

  return (
    <header className="relative z-40 flex-none border-b border-black/5 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[8.8em] max-w-[192em] items-center justify-between px-[2.6em] lg:px-[3.2em]">
        <button onClick={() => handleNav('Accueil')}>
          <Logo className="h-[7em] w-auto shrink-0" />
        </button>

        <nav className="hidden items-center gap-[2.6em] lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = item === activeNav;
            return (
              <button
                key={item}
                onClick={() => handleNav(item)}
                className="relative pb-[0.7em] text-[1.4em] font-medium transition-colors hover:text-black"
                style={{ color: active ? GOLD : '#4B5563' }}
              >
                {item}
                {active && (
                  <span
                    className="absolute -bottom-[0.1em] left-0 right-0 h-[0.15em] rounded-full"
                    style={{ backgroundColor: GOLD }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="hidden items-center gap-[1.1em] lg:flex">
          {user ? (
            <button
              onClick={onDashboard}
              className="flex items-center gap-[0.8em] rounded-full py-[0.55em] pl-[0.55em] pr-[1.8em] text-[1.35em] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: INK }}
            >
              <span
                className="flex h-[2em] w-[2em] items-center justify-center rounded-full text-[0.85em] font-bold"
                style={{ backgroundColor: user.role === 'organizer' ? GOLD : PURPLE }}
              >
                {user.full_name.slice(0, 1).toUpperCase()}
              </span>
              Mon espace
            </button>
          ) : (
            <>
              <button
                onClick={onLogin}
                className="rounded-full border border-gray-300 px-[2.2em] py-[1.15em] text-[1.35em] font-semibold text-gray-800 transition-colors hover:border-gray-400"
              >
                Se connecter
              </button>
              <button
                onClick={onLogin}
                className="flex items-center gap-[0.7em] rounded-full px-[2.2em] py-[1.15em] text-[1.35em] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: INK }}
              >
                <User className="h-[1.35em] w-[1.35em]" />
                S&apos;inscrire
              </button>
            </>
          )}
        </div>

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-[0.8em] text-gray-700 lg:hidden">
          {mobileMenuOpen ? <X className="h-[2.4em] w-[2.4em]" /> : <Menu className="h-[2.4em] w-[2.4em]" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white lg:hidden">
          <div className="space-y-[1.2em] px-[2em] py-[1.6em]">
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => handleNav(item)}
                className="block w-full text-left text-[1.5em] font-medium"
                style={{ color: item === activeNav ? GOLD : '#374151' }}
              >
                {item}
              </button>
            ))}
            <div className="flex gap-[1.2em] border-t border-gray-100 pt-[1.6em]">
              {user ? (
                <button
                  onClick={onDashboard}
                  className="flex-1 rounded-full px-[1.6em] py-[1em] text-[1.4em] font-semibold text-white"
                  style={{ backgroundColor: INK }}
                >
                  Mon espace
                </button>
              ) : (
                <>
                  <button
                    onClick={onLogin}
                    className="flex-1 rounded-full border border-gray-300 px-[1.6em] py-[1em] text-[1.4em] font-semibold text-gray-700"
                  >
                    Se connecter
                  </button>
                  <button
                    onClick={onLogin}
                    className="flex-1 rounded-full px-[1.6em] py-[1em] text-[1.4em] font-semibold text-white"
                    style={{ backgroundColor: INK }}
                  >
                    S&apos;inscrire
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
