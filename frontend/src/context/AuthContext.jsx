import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/api.js";
import { authTokenKey } from "../constants/storage.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const token = localStorage.getItem(authTokenKey);

      if (!token) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const response = await authService.me();

        if (isMounted) {
          setUser(response.user);
        }
      } catch (_error) {
        localStorage.removeItem(authTokenKey);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistSession = (payload) => {
    localStorage.setItem(authTokenKey, payload.token);
    setUser(payload.user);
  };

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    persistSession(response);
    return response;
  };

  const register = async (payload) => {
    const response = await authService.register(payload);
    persistSession(response);
    return response;
  };

  const logout = () => {
    localStorage.removeItem(authTokenKey);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
