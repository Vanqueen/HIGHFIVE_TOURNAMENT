import { useState } from 'react';
import { Trophy, Lock, Mail, ArrowLeft } from 'lucide-react';
import { BackButton, Field, inputCls } from '../components/ui';

export function LoginPage({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Simulation d'authentification - à remplacer par vrai système
    setTimeout(() => {
      if (form.email === 'admin@vipp.com' && form.password === 'admin123') {
        onLogin();
      } else {
        setError('Email ou mot de passe incorrect.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Connexion Admin</h2>
            <p className="mt-2 text-sm text-gray-600">Accédez à la gestion des tournois</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <Field label="Email">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="admin@vipp.com"
                  className={`${inputCls} pl-12`}
                />
              </div>
            </Field>

            <Field label="Mot de passe">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  className={`${inputCls} pl-12`}
                />
              </div>
            </Field>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Compte de démonstration : admin@vipp.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
