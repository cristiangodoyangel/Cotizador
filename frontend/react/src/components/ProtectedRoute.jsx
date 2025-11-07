// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
// 1. Importa el NUEVO hook useAuth
import { useAuth } from "../context/AuthContext"; // Ajusta la ruta

const ProtectedRoute = () => {
  // 2. Obtiene el estado del contexto
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    // Si no está logueado, redirige
    return <Navigate to="/login" replace />;
  }

  // Si está logueado, muestra el componente hijo (ej. ListadoCotizaciones)
  return <Outlet />;
};

export default ProtectedRoute;
