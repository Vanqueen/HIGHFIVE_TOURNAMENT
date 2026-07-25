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
import pageBackgroundImage from '../assets/image8.jpg';
import kingCutout from '../assets/image14.png';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background de la page avec image */}
      <div className="absolute inset-0">
        <img
          src={pageBackgroundImage}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      {/* Modal centré avec deux colonnes */}
      <div className="relative w-full max-w-6xl min-h-[600px] h-[80vh] overflow-hidden rounded-3xl shadow-2xl">
        <div className="flex h-full flex-col md:flex-row">
          {/* Colonne gauche - partie visuelle */}
          <div className="relative hidden h-full w-2/5 overflow-hidden md:block" style={{ backgroundColor: INK }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={kingCutout}
                alt=""
                className="h-[90%] w-auto object-contain"
                style={{
                  transform: 'perspective(2000px) rotateY(-19deg) rotateX(15deg)',
                  filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.84))'
                }}
              />
            </div>
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(160deg, ${INK}D9 0%, ${INK}A6 45%, ${INK}F2 100%)` }}
            />

            <div className="relative flex h-full flex-col justify-end p-8 text-white">
              <div className="flex justify-center pt-65">
                <Logo className="h-25 w-auto" onDark />
              </div>

              {/* <div className="mt-auto mb-8">
                <h2 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-center">
                  LÀ OÙ LA STRATÉGIE
                  <br />
                  <span style={{ color: GOLD }}>CRÉE LA LÉGENDE</span>
                </h2>
                <p className="mt-4 text-base leading-relaxed text-center text-white/80">
                  Rejoignez la plateforme dédiée aux passionnés d'échecs.
                </p>

                <ul className="mt-8 space-y-3">
                  {[
                    'Inscription en ligne aux tournois',
                    'Appariements automatisés',
                    'Classements en temps réel',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-white/90">
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
              </div> */}

              <p className="text-xs text-white/50 text-center">© 2026 VIPP Digital Services.</p>
            </div>
          </div>

          {/* Colonne droite - formulaire */}
          <div className="relative flex h-full flex-1 flex-col items-center justify-center p-8 md:p-12 backdrop-blur-xl">
            {/* Bouton fermer */}
            <button
              onClick={onBack}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--surface-card-strong)] text-[color:var(--text-secondary)] transition-colors hover:bg-[color:var(--border)] hover:text-[color:var(--text-primary)]"
              aria-label="Fermer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {/* Logo mobile */}
            <div className="mb-6 md:hidden">
              <Logo className="h-20 w-auto" />
            </div>

            {/* En-tête */}
            <div className="w-full max-w-md text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                {mode === 'login' ? 'Content de vous revoir' : 'Créer un compte'}
              </h1>
              <p className="mt-3 text-base text-white/80">
                {mode === 'login'
                  ? 'Connectez-vous pour accéder à votre espace'
                  : 'Créez votre compte joueur en moins d\'une minute'}
              </p>
            </div>

            {/* Contenu du formulaire */}
            <div className="w-full max-w-md">
              {/* Bascule connexion / inscription */}
              <div className="flex rounded-full bg-white/20 p-1">
                {(['login', 'register'] as Mode[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => switchMode(value)}
                    className="flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all"
                    style={
                      mode === value
                        ? { backgroundColor: '#fff', color: INK, boxShadow: '0 1px 3px rgba(17,17,20,0.12)' }
                        : { color: 'white' }
                    }
                  >
                    {value === 'login' ? 'Connexion' : 'Inscription'}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="mt-8 space-y-5">
                {mode === 'register' && (
                  <>
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
                      className="text-[color:var(--text-tertiary)] transition-colors hover:text-[color:var(--text-primary)]"
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
                    className="flex items-start gap-2 rounded-xl border px-4 py-3 text-sm"
                    style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', color: '#B91C1C' }}
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-bold tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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

              <p className="mt-6 text-center text-sm text-white/80">
                {mode === 'login' ? 'Pas encore de compte ? ' : 'Vous avez déjà un compte ? '}
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  className="font-bold underline-offset-4 hover:underline text-white"
                >
                  {mode === 'login' ? 'Inscrivez-vous' : 'Connectez-vous'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
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
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/90">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/60">{icon}</span>
        <input
          {...inputProps}
          className="w-full rounded-xl border border-white/30 bg-white/10 py-3 pl-11 pr-11 text-sm outline-none transition-all placeholder:text-white/50 text-white focus:border-white/50 focus:ring-2 focus:ring-white/20"
        />
        {trailing && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60">{trailing}</span>}
      </span>
    </label>
  );
}
