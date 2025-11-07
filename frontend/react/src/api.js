// ====================================================================
// CONFIGURACIÓN
// ====================================================================

// Lee la URL base de la API desde las variables de entorno (.env)
// En local, será 'http://localhost:8000/api'
// En Vercel (producción), será 'https://api.yajasatechnology.cl'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ====================================================================
// HELPERS DE AUTENTICACIÓN
// ====================================================================

/**
 * Obtiene el token de acceso de localStorage y prepara la cabecera
 * de autenticación.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    // Si no hay token, la API lo rechazará (lo cual es correcto).
    return {
      'Content-Type': 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// ====================================================================
// ENDPOINTS DE AUTENTICACIÓN (NUEVO)
// ====================================================================

/**
 * Realiza el login contra el endpoint /token/ de simple-jwt.
 * No usa getAuthHeaders() porque es una ruta pública.
 */
export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || 'Usuario o contraseña incorrectos');
  }
  return await res.json(); // Retorna { access, refresh }
}

// (Opcional) Aquí podrías añadir una función para refrescar el token
// export async function refreshToken(refresh) { ... }

// ====================================================================
// ENDPOINTS DE LA API (CORREGIDOS)
// ====================================================================

export async function listarCotizaciones() {
  const res = await fetch(`${API_BASE}/cotizaciones/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al listar cotizaciones');
  return await res.json();
}

/**
 * Nota: Tu función 'crearCotizacion' no se usa en tus componentes
 * (usas 'crearCotizacionCompleta'). La he actualizado por si acaso.
 */
export async function crearCotizacion(data) {
  const res = await fetch(`${API_BASE}/cotizaciones/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear cotización');
  return await res.json();
}

export async function obtenerCotizacion(pk) {
  const res = await fetch(`${API_BASE}/cotizaciones/${pk}/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al obtener cotización');
  return await res.json();
}

export async function actualizarCotizacion(pk, data) {
  const res = await fetch(`${API_BASE}/cotizaciones/${pk}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar cotización');
  return await res.json();
}

export async function eliminarCotizacion(pk) {
  const res = await fetch(`${API_BASE}/cotizaciones/${pk}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  // DELETE no devuelve contenido (status 204), por eso no hacemos res.json()
  if (!res.ok) throw new Error('Error al eliminar cotización');
  return true;
}

export async function obtenerSiguienteNumero() {
  const res = await fetch(`${API_BASE}/siguiente-numero/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al obtener siguiente número');
  return await res.json();
}

export async function crearCotizacionCompleta(data) {
  const res = await fetch(`${API_BASE}/crear-completa/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear cotización completa');
  return await res.json();
}

export async function generarPDF(cotizacionId) {
  // Para PDFs, no queremos 'Content-Type': 'application/json'
  const headers = { ...getAuthHeaders() };
  delete headers['Content-Type']; // El servidor debe devolver 'application/pdf'

  const res = await fetch(`${API_BASE}/cotizaciones/${cotizacionId}/pdf/`, {
    headers: headers,
  });
  if (!res.ok) throw new Error('Error al generar PDF');
  return await res.blob(); // Devolvemos un Blob para el PDF
}

export async function obtenerEstadisticas() {
  const res = await fetch(`${API_BASE}/estadisticas/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al obtener estadísticas');
  return await res.json();
}

export async function getClientes() {
  const res = await fetch(`${API_BASE}/clientes/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al obtener clientes');
  return await res.json();
}