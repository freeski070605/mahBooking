import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/lib/api";
import {
  clearStoredAuthToken,
  setStoredAuthToken,
} from "@/lib/authToken";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    authApi
      .me()
      .then((data) => {
        if (active) {
          setUser(data.user);
        }
      })
      .catch((error) => {
        if (active) {
          setUser(null);
          if (error?.response?.status === 401) {
            clearStoredAuthToken();
          }
        }
      })
      .finally(() => {
        if (active) {
          setIsReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isReady,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      async login(payload) {
        const data = await authApi.login(payload);
        setStoredAuthToken(data.token);
        setUser(data.user);
        return data.user;
      },
      async register(payload) {
        const data = await authApi.register(payload);
        setStoredAuthToken(data.token);
        setUser(data.user);
        return data.user;
      },
      async logout() {
        try {
          await authApi.logout();
        } finally {
          clearStoredAuthToken();
        }
        setUser(null);
      },
    }),
    [user, isReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
