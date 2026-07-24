import { useState } from 'react';
import { X, Trophy, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { inputCls, Field } from './ui';
import type { Tournament } from '../types';
import { GOLD, INK } from './landing/tokens';

type Step = 'form' | 'success' | 'exists';

export function TournamentRegisterModal({
  tournament,
  onClose,
  onLogin,
}: {
  tournament: Tournament;
  onClose: () => void;
  onLogin: () => void;
}) {
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ full_name: '', email: '', club: '', rating: '' });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.auth.registerAndJoin(tournament.id, {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        club: form.club.trim() || undefined,
        rating: form.rating ? Number(form.rating) : undefined,
      });
      setStep('success');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setStep('exists');
      } else {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#1e1535] shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/10 px-6 py-4">
          <Trophy className="h-5 w-5 shrink-0" style={{ color: GOLD }} />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Inscription au tournoi</p>
            <p className="truncate font-bold text-gray-800 dark:text-white">{tournament.name}</p>
          </div>
          <button onClick={onClose} className="ml-auto shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          {step === 'form' && (
            <>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Vous n'êtes pas connecté(e). Renseignez vos informations pour vous inscrire à ce tournoi.
                Un compte vous sera créé automatiquement et un mot de passe temporaire vous sera envoyé par email.
              </p>
              <form onSubmit={submit} className="space-y-4">
                <Field label="Nom complet" required>
                  <input
                    className={inputCls}
                    placeholder="Prénom Nom"
                    value={form.full_name}
                    onChange={set('full_name')}
                    required
                    minLength={2}
                  />
                </Field>
                <Field label="Adresse email" required>
                  <input
                    className={inputCls}
                    type="email"
                    placeholder="vous@exemple.com"
                    value={form.email}
                    onChange={set('email')}
                    required
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Club">
                    <input
                      className={inputCls}
                      placeholder="Nom du club"
                      value={form.club}
                      onChange={set('club')}
                    />
                  </Field>
                  <Field label="Classement Elo">
                    <input
                      className={inputCls}
                      type="number"
                      placeholder="ex: 1500"
                      min={0}
                      max={3500}
                      value={form.rating}
                      onChange={set('rating')}
                    />
                  </Field>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: INK }}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "S'inscrire au tournoi"}
                </button>
              </form>
            </>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="h-12 w-12" style={{ color: GOLD }} />
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Inscription confirmée !</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Un email vous a été envoyé avec votre mot de passe temporaire.
              </p>
              <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700/40 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                ⚠️ Ce mot de passe est <strong>à usage unique</strong>. Vous devrez le modifier dès votre première connexion, il ne sera plus valide ensuite.
              </div>
              <button
                onClick={onLogin}
                className="mt-2 w-full rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: INK }}
              >
                Se connecter maintenant
              </button>
            </div>
          )}

          {step === 'exists' && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <AlertCircle className="h-12 w-12 text-amber-500" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Compte existant</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Un compte existe déjà avec cette adresse email. Connectez-vous pour vous inscrire au tournoi.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Mot de passe oublié ? Modifiez-le depuis votre espace personnel après connexion.
              </p>
              <button
                onClick={onLogin}
                className="mt-2 w-full rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: INK }}
              >
                Se connecter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
