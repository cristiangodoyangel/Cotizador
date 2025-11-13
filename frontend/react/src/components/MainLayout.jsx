// src/components/MainLayout.jsx
// ¡Esto es básicamente el código que me acabas de dar!

import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const MainLayout = () => {
  return (
    <div className="App">
      {" "}
      <Header />
      <main className="main-content">
        {" "}
        {/* <Outlet> es el "agujero" donde irán las páginas
            (ListadoCotizaciones, CrearCotizacion, etc.) */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
