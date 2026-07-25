import { useState } from 'react';
import { Eye, EyeOff, KeyRound, Loader2, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Logo } from '../components/Logo';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

const GOLD = '#C6963B';
const INK = '#111114';

export function ChangePasswordPage({ onDone }: { onDone: () => void }) {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ new_password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.new_password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (form.new_password !== form.confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      // On passe une chaîne vide comme mot de passe actuel : le backend
      // accepte le changement sans vérification quand temp_password_used est false.
      await api.auth.changePassword('', form.new_password);
      setSuccess(true);
      await refresh();
      setTimeout(onDone, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <Logo className="mb-8 h-14 w-auto" />

        <div
          className="mb-6 flex items-center gap-3 rounded-2xl border p-4"
          style={{ borderColor: `${GOLD}44`, backgroundColor: `${GOLD}0D` }}
        >
          <KeyRound className="h-5 w-5 shrink-0" style={{ color: GOLD }} />
          <div>
            <p className="text-sm font-bold text-[color:var(--text-primary)]">
              Bienvenue, {user?.full_name?.split(' ')[0]} !
            </p>
            <p className="mt-0.5 text-xs text-[color:var(--text-secondary)]">
              Vous vous êtes connecté avec un mot de passe temporaire. Choisissez un nouveau mot de passe pour continuer.
            </p>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-[color:var(--text-primary)]">
          Nouveau mot de passe
        </h1>

        {success ? (
          <div
            className="mt-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm"
            style={{ borderColor: '#86EFAC', backgroundColor: '#F0FDF4', color: '#15803D' }}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Mot de passe mis à jour ! Redirection…
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">
                Nouveau mot de passe
              </span>
              <span className="relative block">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={show ? 'text' : 'password'}
                  value={form.new_password}
                  onChange={set('new_password')}
                  placeholder="8 caractères minimum"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[color:var(--border)] py-3 pl-11 pr-11 text-sm outline-none transition-all placeholder:text-[color:var(--text-tertiary)] focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)]"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">
                Confirmer le mot de passe
              </span>
              <span className="relative block">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={show ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="Répétez le mot de passe"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[color:var(--border)] py-3 pl-11 pr-11 text-sm outline-none transition-all placeholder:text-[color:var(--text-tertiary)] focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]"
                />
              </span>
            </label>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm"
                style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', color: '#B91C1C' }}
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: INK }}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'MISE À JOUR…' : 'ENREGISTRER'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
