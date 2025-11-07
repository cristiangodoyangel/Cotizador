// src/components/MainLayout.jsx
// ¡Esto es básicamente el código que me acabas de dar!

import React from "react";
import { Outlet } from "react-router-dom"; // Importa Outlet
import Header from "./Header"; // Tuyo
import Footer from "./Footer"; // Tuyo

const MainLayout = () => {
  return (
    <div className="App">
      {" "}
      {/* Tu clase CSS original */}
      <Header />
      <main className="main-content">
        {" "}
        {/* Tu clase CSS original */}
        {/* <Outlet> es el "agujero" donde irán las páginas
            (ListadoCotizaciones, CrearCotizacion, etc.) */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
