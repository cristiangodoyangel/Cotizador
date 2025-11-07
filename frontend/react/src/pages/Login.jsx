// src/pages/Login.jsx

import React, { useState, useEffect } from "react";
// 1. Importa el hook de autenticación que acabamos de crear
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api"; // Tu API sigue igual
import "./Login.css";
// import logo from "../assets/img/logo.png"; // (Descomenta si tienes logo)

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2. Obtenemos la función 'login' del contexto
  // Ya no necesitamos 'useNavigate' aquí
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 3. Llamamos a la API
      const data = await loginUser(username, password);

      // 4. ¡Usamos la función 'login' del contexto!
      // Esta simple línea hace todo:
      // - Guarda tokens en localStorage
      // - Actualiza el estado global
      // - Redirige a "/"
      login(data.access, data.refresh);
    } catch (err) {
      setError(err.message || "Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        {/* <img src={logo} alt="Logo" className="login-logo" /> */}
        <h2>Iniciar Sesión</h2>
        <div className="form-group">
          <label htmlFor="username">Usuario</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
};

export default Login;
