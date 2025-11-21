// src/App.jsx
// ESTE ES EL CÓDIGO FINAL Y CORREGIDO

import React from "react";
import { Routes, Route } from "react-router-dom"; // Sin BrowserRouter aquí

// Tus Páginas
import Login from "./pages/Login";
import ListadoCotizaciones from "./pages/ListadoCotizaciones";
import CrearCotizacion from "./pages/CrearCotizacion";
import ListadoClientes from "./pages/ListadoClientes";

// Tus Componentes de Estructura
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
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
