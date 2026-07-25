import type { ReactNode } from 'react';
import { ArrowLeft, Moon, Swords, Sun } from 'lucide-react';

export const inputCls = [
  'w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all duration-200 theme-input',
].join(' ');

export function Header({ theme, onToggleTheme }: { theme: 'dark' | 'light'; onToggleTheme: () => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--surface-card)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--accent-2)] shadow-lg shadow-[color:var(--accent)]/20">
            <Swords className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight text-[color:var(--text-primary)]">Échiquier</span>
            <span className="ml-2 hidden sm:inline-block rounded-full border border-[color:var(--border-strong)] bg-[color:var(--accent-soft)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--accent)]">
              Tournois
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleTheme}
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-card-strong)] px-3 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition-all hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? 'Clair' : 'Sombre'}
        </button>
      </div>
    </header>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--text-primary)]"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      Retour
    </button>
  );
}

export function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-[color:var(--text-secondary)]">
        {label}{required && <span className="ml-0.5 text-[color:var(--accent)]">*</span>}
      </span>
      {children}
    </label>
  );
}

export function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
        active ? 'text-[color:var(--text-primary)]' : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
      }`}
    >
      {icon}
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-2)]" />
      )}
    </button>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-52 rounded-2xl skeleton" />
      ))}
    </div>
  );
}

export function Badge({ status }: { status: 'registration' | 'in_progress' | 'completed' }) {
  const config = {
    registration: { label: 'Inscriptions ouvertes', cls: 'border-[color:var(--border)] bg-[color:var(--accent-soft-2)] text-[color:var(--accent-2)]' },
    in_progress: { label: 'En cours', cls: 'border-[color:var(--border)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]' },
    completed: { label: 'Terminé', cls: 'border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--text-secondary)]' },
  };
  const { label, cls } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'in_progress' ? 'bg-[color:var(--accent)] animate-pulse' : status === 'registration' ? 'bg-[color:var(--accent-2)]' : 'bg-[color:var(--text-tertiary)]'}`} />
      {label}
    </span>
  );
}

export function PageWrapper({ children }: { children: ReactNode }) {
  return <div className="animate-fade-up">{children}</div>;
}
