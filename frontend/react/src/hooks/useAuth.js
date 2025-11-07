import { useState, useCallback } from 'react';

// Este hook gestiona el estado de autenticación
export const useAuth = () => {
  // Inicializamos el estado leyendo el token de localStorage
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));

  const login = useCallback((accessToken, refreshToken) => {
    setToken(accessToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  const isAuthenticated = useCallback(() => {
    // El usuario está autenticado si hay un token en el estado
    return !!token;
  }, [token]);

  // Devuelve solo la lógica
  return { token, login, logout, isAuthenticated };
};