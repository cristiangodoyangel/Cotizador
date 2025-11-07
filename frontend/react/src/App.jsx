// src/App.jsx
// ESTE ES EL CÓDIGO FINAL Y CORREGIDO

import React from "react";
import { Routes, Route } from "react-router-dom"; // Sin BrowserRouter aquí

// Tus Páginas
import Login from "./pages/Login";
import ListadoCotizaciones from "./pages/ListadoCotizaciones";
import CrearCotizacion from "./pages/CrearCotizacion";
import ListadoClientes from "./pages/ListadoClientes"; // (Lo vi en tu código original)

// Tus Componentes de Estructura
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout"; // ¡El "molde" que acabamos de hacer!

function App() {
  return (
    <Routes>
      {/* Ruta 1: PÚBLICA (Sin Header/Footer) */}
      <Route path="/login" element={<Login />} />

      {/* Ruta 2: PRIVADA (Con Header/Footer) */}
      <Route element={<ProtectedRoute />}>
        {" "}
        {/* 1. Revisa si hay sesión */}
        <Route element={<MainLayout />}>
          {" "}
          {/* 2. Si sí, aplica el molde (Header/Footer) */}
          {/* 3. Renderiza estas páginas DENTRO del molde */}
          <Route path="/" element={<ListadoCotizaciones />} />
          <Route path="/crear-cotizacion" element={<CrearCotizacion />} />
          <Route path="/cotizaciones" element={<ListadoCotizaciones />} />
          <Route path="/clientes" element={<ListadoClientes />} />
        </Route>
      </Route>

      {/* Ruta 3: 404 */}
      <Route path="*" element={<p>Página no encontrada (404)</p>} />
    </Routes>
  );
}

export default App;
