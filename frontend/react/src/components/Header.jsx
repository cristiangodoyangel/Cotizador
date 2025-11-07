import React from "react";
import { Link, useNavigate } from "react-router-dom"; // Importar Link y useNavigate
import { useAuth } from "../context/AuthContext"; // Importar el contexto
import "./Header.css";
import logo from "../assets/img/logo.png";

function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="container">
        <img src={logo} alt="Logo" className="logo" />
      </div>

      <nav>
        <ul>
          <li>
            <Link className="nav-link" to="/crear-cotizacion">
              Crear Cotización
            </Link>
          </li>
          <li>
            <Link className="nav-link" to="/cotizaciones">
              Ver Cotizaciones
            </Link>
          </li>
          <li>
            <Link className="nav-link" to="/clientes">
              Clientes
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
