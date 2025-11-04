import React from "react";
import "./Header.css";

function Header() {
  return (
    <header className="app-header">
      <div className="container">
        <img src="src/assets/img/logo.png" alt="Logo" className="logo" />
      </div>

      <nav>
        <ul>
          <li>
            <a className="nav-link" href="/crear-cotizacion">
              Crear Cotización
            </a>
          </li>
          <li>
            <a className="nav-link" href="/cotizaciones">
              Ver Cotizaciones
            </a>
          </li>
          <li>
            <a className="nav-link" href="/clientes">
              Clientes
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
