import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LandingHeader } from './landing/LandingHeader';
import type { NavItem } from './landing/tokens';

const INK = '#111114';
const GOLD = '#C6963B';
const PURPLE = '#5B3E96';

/* Coquille commune aux espaces connectés : même en-tête que la vitrine,
   plus l'identité et le rôle de l'utilisateur. */
export function AppShell({
  children,
  onHome,
  onNav,
  onDashboard,
  actions,
  wide = false,
  fill = false,
  theme,
  onToggleTheme,
}: {
  children: ReactNode;
  onHome: () => void;
  onNav?: (item: NavItem) => void;
  /* Où renvoie « Mon espace » depuis l'en-tête connecté. À défaut, on
     retombe sur l'accueil — mais on veut normalement rester dans l'espace. */
  onDashboard?: () => void;
  actions?: ReactNode;
  wide?: boolean;
  fill?: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}) {
  const { user, logout } = useAuth();

  return (
    <div className={`border-black/5 bg-white/95 dark:bg-gradient-to-t dark:from-gray-600 dark:to-gray-800 ${fill ? 'flex h-[100dvh] flex-col overflow-hidden' : 'min-h-screen'}`}>
      <div className="header-scale flex-none">
        <LandingHeader
          user={user}
          onLogin={onHome}
          onDashboard={onDashboard ?? onHome}
          onLogout={logout}
          activeNav={null}
          onNav={(item) => { onNav ? onNav(item) : onHome(); }}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />
      </div>
      <main className={`px-4 sm:px-6 lg:px-8 ${wide ? 'max-w-none' : 'mx-auto max-w-7xl'} ${fill ? 'flex min-h-0 flex-1 flex-col py-5' : 'py-8'}`}>
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
