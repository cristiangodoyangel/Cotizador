import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Importaremos un CSS simple para los estilos

const Login = () => {
  // --- 1. Estado del Formulario ---
  // Guardamos lo que el usuario escribe en el estado de React
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // --- 2. Estado de Carga y Errores ---
  // Para mostrar mensajes al usuario
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- 3. Hook de Navegación ---
  // 'navigate' es la función que usamos para redirigir al usuario
  const navigate = useNavigate();

  // --- 4. URL de la API ---
  // Lee la URL de la API desde las variables de entorno (.env)
  // Si no la encuentra, usa la de localhost por defecto.
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // --- 5. Manejador del Formulario ---
  const handleSubmit = async (e) => {
    // Previene que la página se recargue al enviar el formulario
    e.preventDefault();

    // Resetea los estados antes de empezar
    setLoading(true);
    setError(null);

    try {
      // --- 6. Llamada a la API (El "Login") ---
      // Hacemos el POST a la ruta de tokens que creamos en Django
      const response = await fetch(`${API_URL}/api/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Enviamos el usuario y contraseña en formato JSON
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      // --- 7. Manejo de Errores (ej. 401 Credenciales Inválidas) ---
      if (!response.ok) {
        const errorData = await response.json();
        // 'detail' es la clave de error que usa simple-jwt
        setError(
          errorData.detail || "Credenciales incorrectas. Inténtelo de nuevo."
        );
        throw new Error("Error de autenticación");
      }

      // --- 8. Éxito (¡Login Correcto!) ---
      const data = await response.json();

      // Guardamos los tokens en el localStorage del navegador
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);

      // Redirigimos al usuario a la página principal del cotizador
      // (Asumiendo que la ruta principal de tu app es '/')
      navigate("/");
    } catch (err) {
      // Maneja errores de red (ej. servidor caído)
      console.error("Error de login:", err);
      if (!error) {
        // Si no pusimos un error antes (ej. 401), es un error de red
        setError("No se pudo conectar al servidor. Inténtelo más tarde.");
      }
    } finally {
      // Pase lo que pase, dejamos de "cargar"
      setLoading(false);
    }
  };

  // --- 9. El Formulario (JSX) ---
  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Iniciar Sesión</h2>

        {/* Muestra un mensaje de error si existe */}
        {error && <p className="login-error">{error}</p>}

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

        <button
          type="submit"
          className="login-button"
          disabled={loading} // Deshabilita el botón mientras carga
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
};

export default Login;
