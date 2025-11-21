import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { crearCotizacionCompleta, getClientes } from "../api";
import "./CrearCotizacion.css";

const CrearCotizacion = ({ onCotizacionCreada }) => {
  const navigate = useNavigate();

  const [clienteEmpresa, setClienteEmpresa] = useState("");
  const [clienteContacto, setClienteContacto] = useState("");
  const [clienteDireccion, setClienteDireccion] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");

  const [tiempoEntrega, setTiempoEntrega] = useState("");
  const [asunto, setAsunto] = useState("");

  // --- CAMBIO 1: Usar los nombres de campo correctos del modelo ItemCotizacion ---
  const [items, setItems] = useState([
    { id: 1, cantidad: 1, descripcion: "", precio_unitario: 0 },
  ]);

  const [notas, setNotas] = useState("");

  // Estados para la búsqueda de clientes
  const [clientes, setClientes] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Función para resetear el formulario
  const resetFormulario = () => {
    setClienteEmpresa("");
    setClienteContacto("");
    setClienteDireccion("");
    setClienteEmail("");
    setClienteTelefono("");
    setAsunto("");
    setTiempoEntrega("1 Día, Esperando que la oferta sea de su aceptación");
    // --- CAMBIO 2: Usar los nombres de campo correctos ---
    setItems([{ id: 1, cantidad: 1, descripcion: "", precio_unitario: 0 }]);
    setNotas("");
  };

  // Cargar clientes al montar el componente
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const data = await getClientes();
        setClientes(data); // getClientes ahora devuelve clientes únicos desde la API
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      }
    };
    cargarClientes();
  }, []);

  const handleItemChange = (id, field, value) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddItem = () => {
    const newId =
      items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    // --- CAMBIO 3: Usar los nombres de campo correctos ---
    setItems([
      ...items,
      { id: newId, cantidad: 1, descripcion: "", precio_unitario: 0 },
    ]);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const { subtotal, impuestos, total } = useMemo(() => {
    // --- CAMBIO 4: Usar 'precio_unitario' (snake_case) para el cálculo ---
    const sub = items.reduce(
      (sum, item) => sum + Number(item.cantidad) * Number(item.precio_unitario),
      0
    );
    const imp = sub * 0.19;
    const tot = sub + imp;
    return { subtotal: sub, impuestos: imp, total: tot };
  }, [items]);

  // Estandarizamos el formato de moneda a es-CL (peso chileno)
  const formatCurrency = (value) => {
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
      return "$0";
    }
    return parsedValue.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0, // Opcional: para no mostrar decimales ($105.910)
    });
  };

  const handleBusquedaChange = (e) => {
    const query = e.target.value;
    setBusquedaCliente(query);
    if (query.length > 1) {
      // --- CAMBIO 5: Usar los nuevos campos del modelo Cliente ('empresa', 'nombre_contacto') ---
      const filtrados = clientes.filter(
        (c) =>
          (c.empresa &&
            c.empresa.toLowerCase().includes(query.toLowerCase())) ||
          (c.nombre_contacto &&
            c.nombre_contacto.toLowerCase().includes(query.toLowerCase()))
      );
      setResultadosBusqueda(filtrados);
      setMostrarResultados(true);
    } else {
      setResultadosBusqueda([]);
      setMostrarResultados(false);
    }
  };

  const handleSelectCliente = (cliente) => {
    // --- CAMBIO 6: Usar los nuevos campos del modelo Cliente ---
    setClienteEmpresa(cliente.empresa || "");
    setClienteContacto(cliente.nombre_contacto || "");
    setClienteEmail(cliente.email || "");
    setClienteTelefono(cliente.telefono || "");
    setClienteDireccion(cliente.direccion || "");
    setMostrarResultados(false);
    setBusquedaCliente("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      // Campos del cliente (el backend espera 'cliente_nombre', etc. como definimos en la view)
      cliente_nombre: clienteContacto,
      cliente_empresa: clienteEmpresa,
      cliente_email: clienteEmail,
      cliente_telefono: clienteTelefono,
      cliente_direccion: clienteDireccion,

      // Detalles de la cotización
      asunto: asunto,
      tiempo_entrega: tiempoEntrega,
      observaciones: notas,

      // Totales (se recalcularán en el backend, pero los enviamos)
      subtotal: subtotal,
      iva: impuestos,
      total: total,

      // --- CAMBIO 7: Enviar los nombres de campo correctos al backend ---
      items: items.map((item) => ({
        cantidad: item.cantidad,
        descripcion: item.descripcion, // 'caracteristica' -> 'descripcion'
        precio_unitario: item.precio_unitario, // 'precioUnitario' -> 'precio_unitario'
      })),
    };

    try {
      const nuevaCotizacion = await crearCotizacionCompleta(payload);
      navigate("/cotizaciones", {
        state: { newCotizacionId: nuevaCotizacion.id },
      });
    } catch (error) {
      console.error("Error al crear la cotización:", error);
      alert(`Error al crear la cotización: ${error.message}`);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-titulo">Crear Nueva Cotización</h1>
      </div>

      <form onSubmit={handleSubmit} className="cotizacion-form">
        {/* ... (El formulario de cliente se queda igual, los estados están bien) ... */}

        <div className="card">
          <h2>Información del Cliente</h2>
          {/* (Tu JSX para el cliente está bien) */}
          {/* ... */}
          <div className="form-row">
            <div className="form-group">
              <label>Nombre del Cliente / Empresa</label>
              <input
                type="text"
                value={clienteEmpresa}
                onChange={(e) => setClienteEmpresa(e.target.value)}
                placeholder="Ej. Empresa S.A."
              />
            </div>
            <div className="form-group">
              <label>Contacto</label>
              <input
                type="text"
                value={clienteContacto}
                onChange={(e) => setClienteContacto(e.target.value)}
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={clienteEmail}
                onChange={(e) => setClienteEmail(e.target.value)}
                placeholder="Ej. juan@ejemplo.com"
              />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                value={clienteTelefono}
                onChange={(e) => setClienteTelefono(e.target.value)}
                placeholder="Ej. +56912345678"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input
              type="text"
              value={clienteDireccion}
              onChange={(e) => setClienteDireccion(e.target.value)}
              placeholder="Ej. Av. Antofagasta #123, Antofagasta"
            />
          </div>
        </div>

        {/* ... (Detalles de la cotización se queda igual) ... */}
        <div className="card">
          <h2>Detalles de la Cotización</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Asunto</label>
              <input
                type="text"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                placeholder="Ej. Accesorios para minería"
              />
            </div>
            <div className="form-group">
              <label>Tiempo de Entrega</label>
              <input
                type="text"
                value={tiempoEntrega}
                onChange={(e) => setTiempoEntrega(e.target.value)}
                placeholder="Ej. 5 días hábiles"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Artículos Cotizados</h2>
          <div className="items-table">
            <div className="items-header">
              {/* (Las cabeceras de escritorio se mantienen, se ocultarán en móvil) */}
              <span>Cantidad</span>
              <span>Descripción</span>
              <span>Precio Unitario</span>
              <span>Importe</span>
              <span></span>
            </div>
            {items.map((item) => (
              <div key={item.id} className="item-row">
                {/* --- 1. CANTIDAD (con Label y Placeholder) --- */}
                <div className="form-group-item item-cantidad">
                  <label htmlFor={`cantidad-${item.id}`}>Cantidad</label>
                  <input
                    id={`cantidad-${item.id}`}
                    type="number"
                    min="1"
                    value={item.cantidad}
                    placeholder="1"
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "cantidad",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>

                {/* --- 2. DESCRIPCIÓN (con Label y Placeholder) --- */}
                <div className="form-group-item item-descripcion">
                  <label htmlFor={`descripcion-${item.id}`}>Descripción</label>
                  <input
                    id={`descripcion-${item.id}`}
                    type="text"
                    value={item.descripcion}
                    placeholder="Ej. Servicio de instalación"
                    onChange={(e) =>
                      handleItemChange(item.id, "descripcion", e.target.value)
                    }
                  />
                </div>

                {/* --- 3. PRECIO UNITARIO (con Label y Placeholder) --- */}
                <div className="form-group-item item-precio">
                  <label htmlFor={`precio_unitario-${item.id}`}>
                    P. Unitario
                  </label>
                  <input
                    id={`precio_unitario-${item.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.precio_unitario}
                    placeholder="50000"
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "precio_unitario",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>

                {/* --- 4. IMPORTE (con Label) --- */}
                <div className="form-group-item item-total">
                  <label htmlFor={`importe-${item.id}`}>Importe</label>
                  <input
                    id={`importe-${item.id}`}
                    type="text"
                    value={formatCurrency(
                      Number(item.cantidad * item.precio_unitario) || 0
                    )}
                    readOnly
                    placeholder="$0"
                  />
                </div>

                {/* --- 5. BOTÓN DE ELIMINAR (con wrapper) --- */}
                <div className="form-group-item item-row-button">
                  {items.length > 1 ? (
                    <button
                      type="button"
                      className="delete-item-btn"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      🗑️
                    </button>
                  ) : (
                    <span></span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="add-item-btn"
            onClick={handleAddItem}
          >
            + Agregar Artículo
          </button>
        </div>

        <div className="summary-section">
          <div className="card notes-card">
            <label>Notas / Términos y Condiciones</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej. Pago del 50% por adelantado..."
            ></textarea>
          </div>
          <div className="card totals-card">
            <div className="total-row">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>{" "}
            </div>
            <div className="total-row">
              <span>Impuestos (IVA 19%)</span>
              <span>{formatCurrency(impuestos)}</span>{" "}
            </div>
            <div className="total-row total">
              <strong>Total</strong>
              <strong>{formatCurrency(total)}</strong>{" "}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Guardar Cotización
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearCotizacion;
