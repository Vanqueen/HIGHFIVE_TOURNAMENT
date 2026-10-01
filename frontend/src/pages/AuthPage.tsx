import { useState } from 'react';
import {
  ArrowLeft,
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
import { api } from '../lib/api';
import type { User } from '../types';
import pageBackgroundImage from '../assets/image8.jpg';
import kingCutout from '../assets/image14.png';

const INK = '#111114';

type Mode = 'login' | 'register' | 'change-password' | 'forgot-password';

export function AuthPage({
  initialMode = 'login',
  onBack,
  onAuthenticated,
  onPasswordChanged,
}: {
  initialMode?: Mode;
  onBack: () => void;
  onAuthenticated: (user: User) => void;
  onPasswordChanged?: () => void;
}) {
  const { user, login, register } = useAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    code: '',
    password: '',
    confirm: '',
    club: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resetStep, setResetStep] = useState<'email' | 'code' | 'password'>('email');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const isDark = window.localStorage.getItem('theme') === 'dark';

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
    setResetStep('email');
    setResetToken(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    /* Validation côté client : confort d'usage seulement — le serveur
       revalide tout, c'est lui qui fait autorité. */
    if (mode === 'change-password' || (mode === 'forgot-password' && resetStep === 'password')) {
      if (form.password.length < 8) {
        setError('Le mot de passe doit contenir au moins 8 caractères.');
        return;
      }
      if (form.password !== form.confirm) {
        setError('Les deux mots de passe ne correspondent pas.');
        return;
      }
    } else if (mode === 'forgot-password') {
      if (!form.email.trim()) {
        setError('Renseignez votre adresse e-mail.');
        return;
      }
      if (resetStep === 'code' && !/^\d{6}$/.test(form.code)) {
        setError('Saisissez le code à 6 chiffres reçu par e-mail.');
        return;
      }
    } else if (!form.email.trim() || !form.password) {
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
      if (mode === 'change-password') {
        await api.auth.changePassword('', form.password);
        setLoading(false);
        onPasswordChanged?.();
        return;
      }
      if (mode === 'forgot-password') {
        if (resetStep === 'email') {
          const response = await api.auth.requestPasswordReset(form.email.trim());
          setNotice(response.message);
          setResetStep('code');
        } else if (resetStep === 'code') {
          const response = await api.auth.verifyPasswordResetCode(form.email.trim(), form.code);
          setResetToken(response.reset_token);
          setResetStep('password');
          setNotice(null);
        } else {
          if (!resetToken) throw new Error('La vérification a expiré. Recommencez la procédure.');
          await api.auth.resetPassword(resetToken, form.password);
          setMode('login');
          setResetStep('email');
          setResetToken(null);
          setForm((current) => ({ ...current, code: '', password: '', confirm: '' }));
          setNotice('Votre mot de passe a été modifié. Vous pouvez vous connecter.');
        }
        setLoading(false);
        return;
      }
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
                <Logo className="h-25 w-auto rounded-lg" onDark={isDark} />
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
            {mode !== 'change-password' && <button
              onClick={onBack}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--surface-card-strong)] text-[color:var(--text-secondary)] transition-colors hover:bg-[color:var(--border)] hover:text-[color:var(--text-primary)]"
              aria-label="Fermer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>}

            {/* Logo mobile */}
            <div className="mb-6 md:hidden">
              <Logo className="h-20 w-auto" />
            </div>

            {/* En-tête */}
            <div className="w-full max-w-md text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                {mode === 'change-password'
                  ? `Bienvenue, ${user?.full_name.split(' ')[0] ?? ''} !`
                  : mode === 'forgot-password'
                    ? resetStep === 'email' ? 'Mot de passe oublié' : resetStep === 'code' ? 'Vérifiez votre e-mail' : 'Nouveau mot de passe'
                    : mode === 'login' ? 'Content de vous revoir' : 'Créer un compte'}
              </h1>
              <p className="mt-3 text-base text-white/80">
                {mode === 'change-password'
                  ? 'Vous vous êtes connecté avec un mot de passe temporaire. Choisissez un nouveau mot de passe pour continuer.'
                  : mode === 'forgot-password'
                    ? resetStep === 'email'
                      ? 'Nous vous enverrons un code de vérification à l’adresse associée à votre compte.'
                      : resetStep === 'code'
                        ? 'Saisissez le code à 6 chiffres envoyé à votre adresse e-mail.'
                        : 'Choisissez un nouveau mot de passe pour votre compte.'
                  : mode === 'login'
                  ? 'Connectez-vous pour accéder à votre espace'
                  : 'Créez votre compte joueur en moins d\'une minute'}
              </p>
            </div>

            {/* Contenu du formulaire */}
            <div className="w-full max-w-md">
              {/* Bascule connexion / inscription */}
              {(mode === 'login' || mode === 'register') && <div className="flex rounded-full bg-white/20 p-1">
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
              </div>}

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

                {mode !== 'change-password' && <TextField
                  label="Adresse e-mail"
                  icon={<Mail className="h-4 w-4" />}
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                  readOnly={mode === 'forgot-password' && resetStep !== 'email'}
                />}

                {mode === 'forgot-password' && resetStep === 'code' && <TextField
                  label="Code de vérification"
                  icon={<Lock className="h-4 w-4" />}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={form.code}
                  onChange={set('code')}
                  placeholder="123456"
                />}

                {(mode !== 'forgot-password' || resetStep === 'password') && <TextField
                  label={mode === 'change-password' || (mode === 'forgot-password' && resetStep === 'password') ? 'Nouveau mot de passe' : 'Mot de passe'}
                  icon={<Lock className="h-4 w-4" />}
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder={mode === 'login' ? '••••••••' : '8 caractères minimum'}
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
                />}

                {(mode === 'change-password' || (mode === 'forgot-password' && resetStep === 'password')) && <TextField
                  label="Confirmer le mot de passe"
                  icon={<Lock className="h-4 w-4" />}
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="Confirmez le nouveau mot de passe"
                  autoComplete="new-password"
                />}

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

                {notice && <p role="status" className="text-sm text-white/90">{notice}</p>}

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
                      : mode === 'register'
                        ? 'CRÉATION DU COMPTE…'
                        : mode === 'forgot-password' && resetStep !== 'password' ? 'VÉRIFICATION…' : 'MISE À JOUR…'
                    : mode === 'login'
                      ? 'SE CONNECTER'
                      : mode === 'register'
                        ? 'CRÉER MON COMPTE'
                        : mode === 'forgot-password'
                          ? resetStep === 'email' ? 'ENVOYER LE CODE' : resetStep === 'code' ? 'VÉRIFIER LE CODE' : 'MODIFIER LE MOT DE PASSE'
                          : 'ENREGISTRER'}
                </button>
              </form>

              {mode === 'login' && <p className="mt-4 text-center text-sm">
                <button
                  type="button"
                  onClick={() => switchMode('forgot-password')}
                  className="font-bold text-white underline-offset-4 hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </p>}

              {mode === 'forgot-password' && <div className="mt-5 flex justify-center gap-5 text-sm text-white/80">
                {resetStep !== 'email' && <button
                  type="button"
                  onClick={() => { setResetStep('email'); setResetToken(null); setNotice(null); setError(null); }}
                  className="underline-offset-4 hover:underline"
                >
                  Modifier l’adresse e-mail
                </button>}
                <button type="button" onClick={() => switchMode('login')} className="underline-offset-4 hover:underline">
                  Retour à la connexion
                </button>
              </div>}

              {(mode === 'login' || mode === 'register') && <p className="mt-6 text-center text-sm text-white/80">
                {mode === 'login' ? 'Pas encore de compte ? ' : 'Vous avez déjà un compte ? '}
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  className="font-bold underline-offset-4 hover:underline text-white"
                >
                  {mode === 'login' ? 'Inscrivez-vous' : 'Connectez-vous'}
                </button>
              </p>}
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
