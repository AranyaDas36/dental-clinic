import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ChangePasswordInput, LoginInput } from '@dental/shared';
import {
  changePassword as apiChangePassword,
  fetchMe,
  loginAdmin,
  logoutAdmin,
  type AdminUserSafe,
} from '@/api/admin';

interface AuthContextValue {
  user: AdminUserSafe | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<AdminUserSafe>;
  logout: () => Promise<void>;
  updatePassword: (input: ChangePasswordInput) => Promise<AdminUserSafe>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUserSafe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function checkAuth() {
    try {
      const { admin } = await fetchMe();
      setUser(admin);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  async function login(input: LoginInput): Promise<AdminUserSafe> {
    const { admin } = await loginAdmin(input);
    setUser(admin);
    return admin;
  }

  async function logout(): Promise<void> {
    try {
      await logoutAdmin();
    } finally {
      setUser(null);
    }
  }

  async function updatePassword(input: ChangePasswordInput): Promise<AdminUserSafe> {
    const { admin } = await apiChangePassword(input);
    setUser(admin);
    return admin;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updatePassword,
        refresh: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
