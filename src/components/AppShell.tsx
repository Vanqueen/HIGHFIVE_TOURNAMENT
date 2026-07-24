import { useState } from 'react';
import type { ReactNode } from 'react';
import { LogOut, ChevronDown, Trophy, Users, Sun, Moon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Logo } from './Logo';

const INK = '#111114';
const GOLD = '#C6963B';
const PURPLE = '#5B3E96';

/* Coquille commune aux espaces connectés : même en-tête que la vitrine,
   plus l'identité et le rôle de l'utilisateur. */
export function AppShell({
  children,
  onHome,
  actions,
  /* Les consoles de gestion occupent toute la largeur : centrer une
     colonne de 1280px y gaspille l'écran. Les écrans de lecture gardent
     la largeur mesurée. */
  wide = false,
  /* Mode console : la page occupe exactement la hauteur de l'écran et ne
     défile pas. C'est au contenu de gérer son propre débordement. */
  fill = false,
  theme, 
  onToggleTheme,
}: {
  children: ReactNode;
  onHome: () => void;
  actions?: ReactNode;
  wide?: boolean;
  fill?: boolean;
  theme: 'dark' | 'light'; 
  onToggleTheme: () => void
}) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isOrganizer = user?.role === 'organizer';
  const roleColor = isOrganizer ? GOLD : PURPLE;
  const RoleIcon = isOrganizer ? Trophy : Users;

  return (
    <div
      className={` border-black/5 bg-white/95 dark:bg-gradient-to-t dark:from-gray-600 dark:to-gray-800 ${fill ? 'flex h-[100dvh] flex-col overflow-hidden' : 'min-h-screen'}`}
    >
      <header
        className={`z-40 border-b border-[color:var(--border)] bg-[color:var(--surface-card)]/95 backdrop-blur-sm ${
          fill ? 'flex-none' : 'sticky top-0'
        }`}
      >
        <div
          className={`mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 ${
            wide ? 'max-w-none' : 'max-w-7xl'
          }`}
        >
          <button onClick={onHome} className="focus-ring flex items-center" aria-label="Accueil">
            <Logo className="h-12 w-auto" />
          </button>

          <div className="flex items-center gap-3">
            {actions}
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-card-strong)] px-3 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition-all hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === 'dark' ? 'Clair' : 'Sombre'}
            </button>
            {user && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2.5 rounded-full border border-gray-200 py-1.5 pl-1.5 pr-3 transition-colors hover:border-gray-300"
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white dark:text-slate-700"
                    style={{ backgroundColor: roleColor }}
                  >
                    {user.full_name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden text-sm font-semibold sm:block">{user.full_name}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>

                {menuOpen && (
                  <>
                    {/* Capteur de clic extérieur */}
                    <button
                      className="fixed inset-0 z-10 cursor-default"
                      aria-hidden="true"
                      tabIndex={-1}
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-card)] shadow-xl">
                      <div className="border-b border-[color:var(--border)] px-4 py-3">
                        <p className="truncate text-sm font-bold">{user.full_name}</p>
                        <p className="truncate text-xs text-[color:var(--text-secondary)]">{user.email}</p>
                        <span
                          className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide text-white dark:text-slate-700"
                          style={{ backgroundColor: roleColor }}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {isOrganizer ? 'ORGANISATEUR' : 'JOUEUR'}
                        </span>
                      </div>
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-[color:var(--text-primary)] transition-colors hover:bg-[color:var(--surface-card-strong)]"
                      >
                        <LogOut className="h-4 w-4" />
                        Se déconnecter
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main
        className={`px-4 sm:px-6 lg:px-8 ${wide ? 'max-w-none' : 'mx-auto max-w-7xl'} ${
          fill ? 'flex min-h-0 flex-1 flex-col py-5' : 'py-8'
        }`}
      >
        {children}
      </main>
    </div>
  );
}

/* Tuile de statistique réutilisée par les deux tableaux de bord. */
export function StatTile({
  icon,
  value,
  label,
  accent = INK,
}: {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-card)] p-5 shadow-sm">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}14`, color: accent }}
      >
        {icon}
      </span>
      <div>
        <div className="text-2xl font-extrabold leading-none">{value}</div>
        <div className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</div>
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: 'registration' | 'in_progress' | 'completed' }) {
  const config = {
    registration: { label: 'INSCRIPTIONS OUVERTES', color: '#3E9B4F' },
    in_progress: { label: 'EN COURS', color: '#A87A2C' },
    completed: { label: 'TERMINÉ', color: '#6B7280' },
  }[status];

  return (
    <span
      className="inline-block rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide text-white dark:text-slate-700"
      style={{ backgroundColor: config.color }}
    >
      {config.label}
    </span>
  );
}
