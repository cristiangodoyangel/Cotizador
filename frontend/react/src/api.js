const API_BASE = '/api';

// Función para obtener el token CSRF de las cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export async function listarCotizaciones() {
  const res = await fetch(`${API_BASE}/cotizaciones/`);
  if (!res.ok) throw new Error('Error al listar cotizaciones');
  return await res.json();
}

export async function crearCotizacion(data) {
  const csrftoken = getCookie('csrftoken');
  const res = await fetch(`${API_BASE}/cotizaciones/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear cotización');
  return await res.json();
}

export async function obtenerCotizacion(pk) {
  const res = await fetch(`${API_BASE}/cotizaciones/${pk}/`);
  if (!res.ok) throw new Error('Error al obtener cotización');
  return await res.json();
}

export async function actualizarCotizacion(pk, data) {
  const csrftoken = getCookie('csrftoken');
  const res = await fetch(`${API_BASE}/cotizaciones/${pk}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar cotización');
  return await res.json();
}

export async function eliminarCotizacion(pk) {
  const csrftoken = getCookie('csrftoken');
  const res = await fetch(`${API_BASE}/cotizaciones/${pk}/`, {
    method: 'DELETE',
    headers: {
      'X-CSRFToken': csrftoken,
    }, });
  if (!res.ok) throw new Error('Error al eliminar cotización');
  return true;
}

export async function obtenerSiguienteNumero() {
  const res = await fetch(`${API_BASE}/siguiente-numero/`);
  if (!res.ok) throw new Error('Error al obtener siguiente número');
  return await res.json();
}

export async function crearCotizacionCompleta(data) {
  const csrftoken = getCookie('csrftoken');
  const res = await fetch(`${API_BASE}/crear-completa/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear cotización completa');
  return await res.json();
}

export async function generarPDF(cotizacionId) {
  const res = await fetch(`${API_BASE}/cotizaciones/${cotizacionId}/pdf/`);
  if (!res.ok) throw new Error('Error al generar PDF');
  return await res.blob();
}

export async function obtenerEstadisticas() {
  const res = await fetch(`${API_BASE}/estadisticas/`);
  if (!res.ok) throw new Error('Error al obtener estadísticas');
  return await res.json();
}

export async function getClientes() {
  const res = await fetch(`${API_BASE}/clientes/`);
  if (!res.ok) throw new Error('Error al obtener clientes');
  return await res.json();
}
