import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CrearCotizacion from "./pages/CrearCotizacion";
import ListadoCotizaciones from "./pages/ListadoCotizaciones";
import ListadoClientes from "./pages/ListadoClientes";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ListadoCotizaciones />} />
            <Route path="/crear-cotizacion" element={<CrearCotizacion />} />
            <Route path="/cotizaciones" element={<ListadoCotizaciones />} />
            <Route path="/clientes" element={<ListadoClientes />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
