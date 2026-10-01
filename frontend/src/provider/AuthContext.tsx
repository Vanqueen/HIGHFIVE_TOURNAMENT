import { useCallback, useEffect, useMemo, useState } from "react";
import { User } from "../types";
import {  api, type RegisterPayload } from "../lib/api";
import type { ReactNode } from 'react';
import { AuthContext } from "../hooks/useAuth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.auth.me();
      setUser(user);
    } catch {
      /* API injoignable ou session invalide : on reste simplement
         déconnecté, la vitrine publique doit continuer à fonctionner. */
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setInitializing(false));
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await api.auth.login(email, password);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { user } = await api.auth.register(payload);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      /* Même si l'appel échoue, on purge l'état local : l'utilisateur
         a demandé à sortir. */
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, initializing, login, register, logout, refresh, setUser }),
    [user, initializing, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
