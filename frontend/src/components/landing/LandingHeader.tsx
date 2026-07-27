import { Menu, X, User, Sun, Moon, LogOut, ChevronDown, Trophy, Users } from 'lucide-react';
import { useState } from 'react';
import { Logo } from '../Logo';
import { INK, GOLD, PURPLE, NAV_ITEMS } from './tokens';
import type { NavItem } from './tokens';
import type { User as AuthUser } from '../../types';

export function LandingHeader({
  user,
  onLogin,
  onDashboard,
  onLogout,
  activeNav,
  onNav,
  theme, 
  onToggleTheme,
}: {
  user: AuthUser | null;
  onLogin: () => void;
  onDashboard: () => void;
  onLogout?: () => void;
  activeNav: NavItem;
  onNav: (item: NavItem) => void;
  theme: 'dark' | 'light'; 
  onToggleTheme: () => void
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isOrganizer = user?.role === 'organizer';
  const roleColor = isOrganizer ? GOLD : PURPLE;
  const RoleIcon = isOrganizer ? Trophy : Users;

  const handleNav = (item: NavItem) => {
    onNav(item);
    setMobileMenuOpen(false);
  };

  return (
    <header className="relative z-40 flex-none border-b border-black/5 bg-white/95 dark:bg-gradient-to-t dark:from-[#342752] dark:to-[#251C3A] backdrop-blur-sm">
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
            <div className="flex items-center gap-[1.1em]">
              <button
                type="button"
                onClick={onToggleTheme}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-card-strong)] px-3 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition-all hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === 'dark' ? 'Clair' : 'Sombre'}
              </button>
              {/* Dropdown utilisateur */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-[0.8em] rounded-full py-[0.55em] pl-[0.55em] pr-[1.4em] text-[1.35em] font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: INK }}
                >
                  <span
                    className="flex h-[2em] w-[2em] items-center justify-center rounded-full text-[0.85em] font-bold"
                    style={{ backgroundColor: roleColor }}
                  >
                    {user.full_name.slice(0, 1).toUpperCase()}
                  </span>
                  Mon espace
                  <ChevronDown className="h-[1em] w-[1em] opacity-70" />
                </button>

                {userMenuOpen && (
                  <>
                    <button className="fixed inset-0 z-10 cursor-default" aria-hidden tabIndex={-1} onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-[22em] overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-card)] shadow-xl">
                      <div className="border-b border-[color:var(--border)] px-4 py-3">
                        <p className="truncate text-[1.2em] font-bold dark:text-white" style={{ color: INK }}>{user.full_name}</p>
                        <p className="truncate text-[1.05em] text-gray-400">{user.email}</p>
                        <span
                          className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.9em] font-bold tracking-wide text-white"
                          style={{ backgroundColor: roleColor }}
                        >
                          <RoleIcon className="h-[1em] w-[1em]" />
                          {isOrganizer ? 'Organisateur' : 'Joueur'}
                        </span>
                      </div>
                      <button
                        onClick={() => { setUserMenuOpen(false); onDashboard(); }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-[1.2em] font-medium transition-colors hover:bg-[color:var(--surface-card-strong)] dark:text-gray-200"
                      >
                        <RoleIcon className="h-[1.1em] w-[1.1em]" style={{ color: roleColor }} />
                        Mon espace
                      </button>
                      {onLogout && (
                        <button
                          onClick={() => { setUserMenuOpen(false); onLogout(); }}
                          className="flex w-full items-center gap-2 border-t border-[color:var(--border)] px-4 py-3 text-[1.2em] font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <LogOut className="h-[1.1em] w-[1.1em]" />
                          Se déconnecter
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={onToggleTheme}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-card-strong)] px-3 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition-all hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === 'dark' ? 'Clair' : 'Sombre'}
              </button>
              <button
                onClick={onLogin}
                className="rounded-full border border-[color:var(--border)] px-[2.2em] py-[1.15em] text-[1.35em] font-semibold text-[color:var(--text-primary)] transition-colors hover:border-[color:var(--accent)]"
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

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-[0.8em] text-[color:var(--text-secondary)] lg:hidden">
          {mobileMenuOpen ? <X className="h-[2.4em] w-[2.4em]" /> : <Menu className="h-[2.4em] w-[2.4em]" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[color:var(--border)] bg-[color:var(--surface-card)] lg:hidden">
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
            <div className="flex gap-[1.2em] border-t border-[color:var(--border)] pt-[1.6em]">
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
