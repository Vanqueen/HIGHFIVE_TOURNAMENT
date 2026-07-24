import { useCallback, useEffect, useState } from 'react';
import {
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Mail,
  Lock,
  User as UserIcon,
  Building2,
  Trash2,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { SectionHead, squareTint, INK, GOLD, RULE } from './Scoreboard';
import type { User } from '../types';

/* Cooptation des organisateurs : il n'existe aucune inscription publique
   vers ce rôle, tout nouvel accès passe par ce panneau. Conçu pour tenir
   dans la colonne latérale de la console, donc en une seule colonne. */
export function OrganizerTeam() {
  const { user } = useAuth();
  const [organizers, setOrganizers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', organization: '' });

  const load = useCallback(async () => {
    try {
      setOrganizers(await api.organizers.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreated(null);

    if (form.full_name.trim().length < 2) return setError('Indiquez le nom complet.');
    if (!form.email.trim()) return setError('Indiquez une adresse e-mail.');
    if (form.password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.');

    setSaving(true);
    try {
      const { user: newOrganizer } = await api.organizers.create({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        organization: form.organization.trim() || undefined,
      });
      setCreated(newOrganizer.email);
      setForm({ full_name: '', email: '', password: '', organization: '' });
      setFormOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création impossible.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setRemovingId(id);
    setError(null);
    try {
      await api.organizers.delete(id);
      setConfirmingId(null);
      await load();
    } catch (err) {
      /* Le serveur refuse de retirer le dernier organisateur, ou un
         organisateur qui gère encore des tournois : on relaie son message. */
      setError(err instanceof Error ? err.message : 'Suppression impossible.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <section>
      <SectionHead
        title="Équipe"
        count={organizers.length}
        action={
          <button
            onClick={() => {
              setFormOpen((v) => !v);
              setError(null);
              setCreated(null);
            }}
            className="focus-ring flex items-center gap-2 rounded-full border bg-white dark:bg-gray-700 px-3.5 py-2 font-display text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-gray-400"
            style={{ borderColor: RULE }}
          >
            {formOpen ? <X className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
            {formOpen ? 'Annuler' : 'Ajouter'}
          </button>
        }
      />

      <p className="mb-4 text-sm text-gray-500">
        Le rôle organisateur ne s’obtient pas à l’inscription : seuls les membres de cette liste peuvent en
        créer de nouveaux.
      </p>

      {created && (
        <div
          className="mb-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: '#86EFAC', backgroundColor: '#F0FDF4', color: '#15803D' }}
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Compte créé pour <strong>{created}</strong>. Communiquez-lui son mot de passe : il pourra se
            connecter immédiatement.
          </span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', color: '#B91C1C' }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {formOpen && (
        <form
          onSubmit={submit}
          className="mb-5 space-y-4 rounded-2xl border bg-white dark:bg-gray-700 p-5"
          style={{ borderColor: RULE }}
        >
          <Field
            label="Nom complet"
            icon={<UserIcon className="h-4 w-4" />}
            value={form.full_name}
            onChange={set('full_name')}
            placeholder="Marie Dupont"
          />
          <Field
            label="Adresse e-mail"
            icon={<Mail className="h-4 w-4" />}
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="marie@club.com"
          />
          <Field
            label="Mot de passe initial"
            icon={<Lock className="h-4 w-4" />}
            type="text"
            value={form.password}
            onChange={set('password')}
            placeholder="8 caractères minimum"
          />
          <Field
            label="Organisation (facultatif)"
            icon={<Building2 className="h-4 w-4" />}
            value={form.organization}
            onChange={set('organization')}
            placeholder="Club d’échecs de Lyon"
          />

          <button
            type="submit"
            disabled={saving}
            className="focus-ring flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 font-display text-sm font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-85 disabled:opacity-60"
            style={{ backgroundColor: INK }}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Création…' : 'Créer le compte'}
          </button>
          <p className="text-[11px] text-gray-400">
            Le mot de passe reste affiché en clair pour que vous puissiez le transmettre. Le nouvel
            organisateur pourra le changer depuis son espace.
          </p>
        </form>
      )}

      {loading ? (
        <div className="skeleton h-24 rounded-2xl" />
      ) : (
        <ul className="overflow-hidden rounded-2xl border" style={{ borderColor: RULE }}>
          {organizers.map((organizer, i) => {
            const isSelf = organizer.id === user?.id;
            const confirming = confirmingId === organizer.id;

            return (
              <li
                key={organizer.id}
                className={i === 0 ? '' : 'border-t'}
                style={{ borderColor: RULE, backgroundColor: squareTint(i) }}
              >
                {confirming ? (
                  <div className="p-4">
                    <p className="text-sm font-semibold">Retirer {organizer.full_name} ?</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Le compte perd immédiatement l’accès à la plateforme.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="focus-ring flex-1 rounded-full border bg-white dark:bg-gray-700 px-3 py-2 font-display text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-gray-400"
                        style={{ borderColor: RULE }}
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => remove(organizer.id)}
                        disabled={removingId === organizer.id}
                        className="focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 font-display text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-85 disabled:opacity-60"
                        style={{ backgroundColor: '#B91C1C' }}
                      >
                        {removingId === organizer.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Retirer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-[color:var(--surface-card)]">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-base font-bold text-white"
                      style={{ backgroundColor: GOLD }}
                    >
                      {organizer.full_name.slice(0, 1).toUpperCase()}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">
                        {organizer.full_name}
                        {isSelf && (
                          <span className="ml-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                            vous
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-gray-500">{organizer.email}</p>
                      {organizer.organization && (
                        <p className="mt-0.5 truncate text-[11px] text-gray-400">{organizer.organization}</p>
                      )}
                    </div>

                    {/* On ne propose pas de se retirer soi-même : le serveur
                        refuse, autant ne pas offrir le geste. */}
                    {!isSelf && (
                      <button
                        onClick={() => {
                          setConfirmingId(organizer.id);
                          setError(null);
                        }}
                        className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-white dark:bg-gray-700 text-gray-400 transition-colors hover:border-red-300 hover:text-red-600"
                        style={{ borderColor: RULE }}
                        aria-label={`Retirer ${organizer.full_name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Field({
  label,
  icon,
  ...inputProps
}: { label: string; icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
        {label}
      </span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <input
          {...inputProps}
          className="w-full rounded-xl border border-gray-200 bg-white dark:bg-gray-700 py-2.5 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
        />
      </span>
    </label>
  );
}
