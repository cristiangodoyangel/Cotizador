// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 1. Crear el Contexto
const AuthContext = createContext(null);

// 2. Crear el Proveedor (Provider)
export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const navigate = useNavigate();

  // 3. Efecto para cargar el token desde localStorage al iniciar
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setUserToken(token);
    }
  }, []);

  // 4. Función de Login
  const login = (access, refresh) => {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    setUserToken(access);
    navigate("/"); // Redirige al home DESPUÉS de establecer el estado
  };

  // 5. Función de Logout
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUserToken(null);
    navigate("/login"); // Redirige al login
  };

  // 6. El valor que compartiremos con toda la app
  const value = {
    isLoggedIn: !!userToken, // Convertimos el token (o null) a un booleano
    token: userToken,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 7. Crear el Hook "useAuth" (ahora usará este contexto)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
