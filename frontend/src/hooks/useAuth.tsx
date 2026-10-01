import { createContext, useContext } from 'react';
import { type RegisterPayload } from '../lib/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  /* true tant qu'on n'a pas encore interrogé /auth/me au démarrage :
     permet d'éviter d'afficher « déconnecté » pendant la restauration. */
  initializing: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: User) => void;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l\'intérieur de <AuthProvider>.');
  return ctx;
}
