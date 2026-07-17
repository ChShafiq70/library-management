import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { setAccessToken, setOnAuthFailure } from "../api/axios";

const AuthContext = createContext(null);
const PROFILE_CACHE_KEY = "library_user_profile";

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const setUser = useCallback((userObj) => {
    setUserState(userObj);
    if (userObj) {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(userObj));
    } else {
      localStorage.removeItem(PROFILE_CACHE_KEY);
    }
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, [setUser]);

  useEffect(() => {
    setOnAuthFailure(clearSession);
  }, [clearSession]);

  useEffect(() => {
    const bootstrap = async () => {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) {
        try {
          setUserState(JSON.parse(cached));
        } catch {
          localStorage.removeItem(PROFILE_CACHE_KEY);
        }
      }

      try {
        const { data } = await api.post("/auth/refresh-token");
        setAccessToken(data.data.accessToken);
      } catch {
        clearSession();
      } finally {
        setInitializing(false);
      }
    };
    bootstrap();
  }, [clearSession]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (name, email, password) => {
    await api.post("/auth/register", { name, email, password });
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearSession();
    }
  };

  const value = {
    user,
    role: user?.role?.name || null,
    isAuthenticated: !!user,
    initializing,
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};