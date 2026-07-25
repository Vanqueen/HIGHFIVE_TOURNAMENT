import { useState } from 'react';
import { Eye, EyeOff, KeyRound, Loader2, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Logo } from '../components/Logo';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

const GOLD = '#C6963B';

const LIGHT = {
  bg: '#fdf4e7',
  card: '#fffaf1',
  border: 'rgba(90,63,120,0.16)',
  textPrimary: '#2e2436',
  textSecondary: '#6f5f78',
  textTertiary: '#8d7b92',
  inputBg: '#fffaf1',
  inputBorder: 'rgba(90,63,120,0.16)',
  inputFocus: '#7b4ce6',
  successBorder: '#86efac',
  successBg: '#f0fdf4',
  successText: '#15803d',
  errorBorder: '#fca5a5',
  errorBg: '#fef2f2',
  errorText: '#b91c1c',
  btnBg: '#111114',
};

const DARK = {
  bg: '#0e0a1a',
  card: 'rgba(29,21,49,0.96)',
  border: 'rgba(214,199,245,0.14)',
  textPrimary: '#f8efe7',
  textSecondary: '#cbb9d8',
  textTertiary: '#8a7aa6',
  inputBg: 'rgba(29,21,49,0.96)',
  inputBorder: 'rgba(214,199,245,0.14)',
  inputFocus: '#9d7cff',
  successBorder: 'rgba(94,234,212,0.35)',
  successBg: 'rgba(94,234,212,0.08)',
  successText: '#5eead4',
  errorBorder: 'rgba(252,165,165,0.35)',
  errorBg: 'rgba(239,68,68,0.1)',
  errorText: '#fca5a5',
  btnBg: '#f8efe7',
};

export function ChangePasswordPage({ onDone }: { onDone: () => void }) {
  const { user, refresh } = useAuth();
  const isDark = window.localStorage.getItem('theme') === 'dark';
  const c = isDark ? DARK : LIGHT;

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
    <div
      className="flex min-h-screen items-center justify-center px-5"
      style={{ background: c.bg }}
    >
      <div className="w-full max-w-sm">
        <Logo className="mb-8 h-14 w-auto" onDark={isDark} />

        {/* Bandeau info mdp temporaire */}
        <div
          className="mb-6 flex items-center gap-3 rounded-2xl border p-4"
          style={{ borderColor: `${GOLD}44`, backgroundColor: `${GOLD}12` }}
        >
          <KeyRound className="h-5 w-5 shrink-0" style={{ color: GOLD }} />
          <div>
            <p className="text-sm font-bold" style={{ color: c.textPrimary }}>
              Bienvenue, {user?.full_name?.split(' ')[0]} !
            </p>
            <p className="mt-0.5 text-xs" style={{ color: c.textSecondary }}>
              Vous vous êtes connecté avec un mot de passe temporaire. Choisissez un nouveau mot de passe pour continuer.
            </p>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: c.textPrimary }}>
          Nouveau mot de passe
        </h1>

        {success ? (
          <div
            className="mt-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm"
            style={{ borderColor: c.successBorder, backgroundColor: c.successBg, color: c.successText }}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Mot de passe mis à jour ! Redirection…
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {/* Champ nouveau mdp */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: c.textSecondary }}>
                Nouveau mot de passe
              </span>
              <span className="relative block">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: c.textTertiary }}>
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={show ? 'text' : 'password'}
                  value={form.new_password}
                  onChange={set('new_password')}
                  placeholder="8 caractères minimum"
                  autoComplete="new-password"
                  style={{
                    background: c.inputBg,
                    borderColor: c.inputBorder,
                    color: c.textPrimary,
                  }}
                  className="w-full rounded-xl border py-3 pl-11 pr-11 text-sm outline-none transition-all placeholder:opacity-50"
                  onFocus={e => { e.currentTarget.style.borderColor = c.inputFocus; e.currentTarget.style.boxShadow = `0 0 0 2px ${c.inputFocus}33`; }}
                  onBlur={e => { e.currentTarget.style.borderColor = c.inputBorder; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  style={{ color: c.textTertiary }}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            {/* Champ confirmation */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: c.textSecondary }}>
                Confirmer le mot de passe
              </span>
              <span className="relative block">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: c.textTertiary }}>
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={show ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="Répétez le mot de passe"
                  autoComplete="new-password"
                  style={{
                    background: c.inputBg,
                    borderColor: c.inputBorder,
                    color: c.textPrimary,
                  }}
                  className="w-full rounded-xl border py-3 pl-11 pr-11 text-sm outline-none transition-all placeholder:opacity-50"
                  onFocus={e => { e.currentTarget.style.borderColor = c.inputFocus; e.currentTarget.style.boxShadow = `0 0 0 2px ${c.inputFocus}33`; }}
                  onBlur={e => { e.currentTarget.style.borderColor = c.inputBorder; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </span>
            </label>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm"
                style={{ borderColor: c.errorBorder, backgroundColor: c.errorBg, color: c.errorText }}
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold tracking-wide transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                backgroundColor: c.btnBg,
                color: isDark ? '#111114' : '#ffffff',
              }}
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
