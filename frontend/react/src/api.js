let API_BASE =
  import.meta.env.VITE_API_URL || "https://cotizador.htgrafica.cl/api";

// Aseguramos que siempre se use HTTPS
if (API_BASE.startsWith("http:")) {
  API_BASE = API_BASE.replace("http:", "https:");
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    // Si no hay token, la API lo rechazará (lo cual es correcto).
    return {
      "Content-Type": "application/json",
    };
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Usuario o contraseña incorrectos");
  }
  return await res.json(); // Retorna { access, refresh }
}

export async function listarCotizaciones() {
  const res = await fetch(`${API_BASE}/cotizaciones/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al listar cotizaciones");
  return await res.json();
}

export async function crearCotizacion(data) {
  const res = await fetch(`${API_BASE}/cotizaciones/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear cotización");
  return await res.json();
}

export async function obtenerCotizacion(pk) {
  const res = await fetch(`${API_BASE}/cotizaciones/${pk}/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener cotización");
  return await res.json();
}

export async function actualizarCotizacion(pk, data) {
  const res = await fetch(`${API_BASE}/cotizaciones/${pk}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar cotización");
  return await res.json();
}

export async function eliminarCotizacion(pk) {
  const res = await fetch(`${API_BASE}/cotizaciones/${pk}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Error al eliminar cotización");
  return true;
}

export async function obtenerSiguienteNumero() {
  const res = await fetch(`${API_BASE}/siguiente-numero/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener siguiente número");
  return await res.json();
}

// Tu código corregido (¡Pega esto en tu api.js!)
export async function crearCotizacionCompleta(data) {
  const res = await fetch(`${API_BASE}/crear-completa/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
  if (!res.ok) {
    // Si la respuesta no es OK (ej. 400), intentamos leer el JSON del error
    const errorData = await res.json();

    // Mostramos el error de Django en la consola del navegador
    console.error("Error de validación del backend:", errorData);

    // Lanzamos un error más descriptivo
    // (ej: "Error: cliente: Este campo es obligatorio.")
    throw new Error(`Error al crear: ${JSON.stringify(errorData)}`);
  }
  // --- FIN DE LA CORRECCIÓN ---

  return await res.json();
}

export async function generarPDF(cotizacionId) {
  const headers = { ...getAuthHeaders() };
  delete headers["Content-Type"];

  const res = await fetch(`${API_BASE}/cotizaciones/${cotizacionId}/pdf/`, {
    headers: headers,
  });
  if (!res.ok) throw new Error("Error al generar PDF");
  return await res.blob();
}

export async function obtenerEstadisticas() {
  const res = await fetch(`${API_BASE}/estadisticas/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener estadísticas");
  return await res.json();
}

export async function getClientes() {
  const res = await fetch(`${API_BASE}/clientes/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener clientes");
  return await res.json();
}
