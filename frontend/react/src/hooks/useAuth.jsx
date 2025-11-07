// src/hooks/useAuth.js
import { useState, useEffect } from "react";

export const useAuth = () => {
  // Comprobamos el token una sola vez al cargar
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem("accessToken");
    return !!token; // !! convierte el string (o null) a un booleano
  });

  // (Opcional) Puedes añadir lógica para escuchar cambios
  // si tu app maneja 'logout' sin recargar la página.

  return { isLoggedIn };
};
