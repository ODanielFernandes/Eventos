import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import * as authService from '../api/authService.js';
import { clearAuthToken, setAuthToken } from '../auth/tokenMemory.js';
import { getUserIdFromToken } from '../auth/jwtUser.js';

const AuthContext = createContext(null);

function extractJwtFromLoginResponse(data) {
  if (typeof data === 'string') {
    const t = data.trim();
    return t.length > 0 ? t : null;
  }
  if (!data || typeof data !== 'object') return null;
  return (
    data.token ??
    data.Token ??
    data.accessToken ??
    data.AccessToken ??
    data.access_token ??
    data.jwt ??
    data.Jwt ??
    null
  );
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password });
    const jwt = extractJwtFromLoginResponse(data);
    if (!jwt) {
      throw new Error(
        'Resposta de login sem token JWT reconhecido. Verifique o contrato da API.',
      );
    }
    setAuthToken(jwt);
    setToken(jwt);
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setToken(null);
  }, []);

  const signup = useCallback(async (email, password) => {
    await authService.signup({ email, password });
  }, []);

  const currentUserId = useMemo(() => getUserIdFromToken(token), [token]);

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      currentUserId,
      login,
      logout,
      signup,
    }),
    [token, currentUserId, login, logout, signup],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }
  return ctx;
}
