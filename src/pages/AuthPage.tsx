import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User as UserIcon,
  Users,
  AlertCircle,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types';
import chessHeroImage from '../assets/image.png';

const INK = '#111114';
const GOLD = '#C6963B';
const PURPLE = '#5B3E96';

type Mode = 'login' | 'register';

export function AuthPage({
  initialMode = 'login',
  onBack,
  onAuthenticated,
}: {
  initialMode?: Mode;
  onBack: () => void;
  onAuthenticated: (user: User) => void;
}) {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    club: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    /* Validation côté client : confort d'usage seulement — le serveur
       revalide tout, c'est lui qui fait autorité. */
    if (!form.email.trim() || !form.password) {
      setError('Renseignez votre e-mail et votre mot de passe.');
      return;
    }
    if (mode === 'register') {
      if (form.full_name.trim().length < 2) {
        setError('Indiquez votre nom complet.');
        return;
      }
      if (form.password.length < 8) {
        setError('Le mot de passe doit contenir au moins 8 caractères.');
        return;
      }
    }

    setLoading(true);
    try {
      const user =
        mode === 'login'
          ? await login(form.email.trim(), form.password)
          : await register({
              email: form.email.trim(),
              password: form.password,
              full_name: form.full_name.trim(),
              club: form.club.trim(),
            });
      onAuthenticated(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Réessayez.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white" style={{ color: INK }}>
      {/* ---------------------- Colonne visuelle ---------------------- */}
      <aside className="relative hidden w-[42%] shrink-0 overflow-hidden lg:block" style={{ backgroundColor: INK }}>
        <img
          src={chessHeroImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(160deg, ${INK}D9 0%, ${INK}A6 45%, ${INK}F2 100%)` }}
        />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          {/* Une partie du lettrage du logo est sombre : sur ce panneau
              encre, il lui faut une pastille claire. */}
          <Logo className="h-16 w-auto" onDark />

          <div>
            <h2 className="max-w-sm text-4xl font-extrabold leading-[1.1] tracking-tight">
              LÀ OÙ LA STRATÉGIE
              <br />
              <span style={{ color: GOLD }}>CRÉE LA LÉGENDE</span>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
              Rejoignez la plateforme dédiée aux passionnés d’échecs : inscrivez-vous aux tournois ou organisez
              vos propres compétitions.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                'Inscription en ligne aux tournois',
                'Appariements et rondes automatisés',
                'Classements en temps réel',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${GOLD}33`, color: GOLD }}
                  >
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/40">© 2026 VIPP Digital Services. Tous droits réservés.</p>
        </div>
      </aside>

      {/* ---------------------- Colonne formulaire ---------------------- */}
      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[26rem]">
          <button
            onClick={onBack}
            className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Retour à l’accueil
          </button>

          {/* Le panneau visuel disparaît sous 1024px : le logo doit alors
              apparaître ici, sinon la page n'est plus identifiée. */}
          <Logo className="mb-7 h-14 w-auto lg:hidden" />

          <h1 className="text-3xl font-extrabold tracking-tight">
            {mode === 'login' ? 'Content de vous revoir' : 'Créer un compte'}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {mode === 'login'
              ? 'Connectez-vous pour accéder à votre espace, joueur ou organisateur.'
              : 'Créez votre compte joueur en moins d’une minute.'}
          </p>

          {/* Bascule connexion / inscription */}
          <div className="mt-7 flex rounded-full bg-gray-100 p-1">
            {(['login', 'register'] as Mode[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => switchMode(value)}
                className="flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all"
                style={
                  mode === value
                    ? { backgroundColor: '#fff', color: INK, boxShadow: '0 1px 3px rgba(17,17,20,0.12)' }
                    : { color: '#6B7280' }
                }
              >
                {value === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === 'register' && (
              <>
                {/* La plateforme n'ouvre à l'inscription que le compte joueur :
                    les accès organisateur sont délivrés par l'organisation. */}
                <div
                  className="flex items-start gap-3 rounded-2xl border p-3.5"
                  style={{ borderColor: `${PURPLE}33`, backgroundColor: `${PURPLE}0A` }}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: PURPLE }}
                  >
                    <Users className="h-4 w-4 text-white" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">Compte joueur</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
                      Inscrivez-vous aux tournois et suivez votre classement. Les accès organisateur sont
                      créés par l’organisation, pas à l’inscription.
                    </p>
                  </div>
                </div>

                <TextField
                  label="Nom complet"
                  icon={<UserIcon className="h-4 w-4" />}
                  value={form.full_name}
                  onChange={set('full_name')}
                  placeholder="Jean Dupont"
                  autoComplete="name"
                />
              </>
            )}

            <TextField
              label="Adresse e-mail"
              icon={<Mail className="h-4 w-4" />}
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="vous@exemple.com"
              autoComplete="email"
            />

            <TextField
              label="Mot de passe"
              icon={<Lock className="h-4 w-4" />}
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              placeholder={mode === 'register' ? '8 caractères minimum' : '••••••••'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-400 transition-colors hover:text-gray-700"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            {mode === 'register' && (
              <TextField
                label="Club (facultatif)"
                icon={<Users className="h-4 w-4" />}
                value={form.club}
                onChange={set('club')}
                placeholder="Échiquier de Lyon"
              />
            )}

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
              {loading
                ? mode === 'login'
                  ? 'CONNEXION…'
                  : 'CRÉATION DU COMPTE…'
                : mode === 'login'
                  ? 'SE CONNECTER'
                  : 'CRÉER MON COMPTE'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {mode === 'login' ? 'Pas encore de compte ? ' : 'Vous avez déjà un compte ? '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="font-bold underline-offset-4 hover:underline"
              style={{ color: GOLD }}
            >
              {mode === 'login' ? 'Inscrivez-vous' : 'Connectez-vous'}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

function TextField({
  label,
  icon,
  trailing,
  ...inputProps
}: {
  label: string;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <input
          {...inputProps}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-11 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
        />
        {trailing && <span className="absolute right-4 top-1/2 -translate-y-1/2">{trailing}</span>}
      </span>
    </label>
  );
}
