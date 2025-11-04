import React, { useState, useMemo, useEffect } from "react";
import { crearCotizacionCompleta, getClientes } from "../api"; // Importamos getClientes
import CotizacionA4 from "./CotizacionA4"; // Importamos el componente A4
import "./CrearCotizacion.css";

const CrearCotizacion = ({ onCotizacionCreada }) => {
  const [clienteNombre, setClienteNombre] = useState("");
  // Cambiamos el nombre para evitar confusión con el nombre del contacto
  const [clienteEmpresa, setClienteEmpresa] = useState("");
  const [clienteContacto, setClienteContacto] = useState("");
  // El campo clienteDireccion no se usa en el payload, pero lo mantenemos por si se necesita
  const [clienteDireccion, setClienteDireccion] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");

  const [tiempoEntrega, setTiempoEntrega] = useState("");
  const [asunto, setAsunto] = useState("");

  const [items, setItems] = useState([
    { id: 1, cantidad: 1, caracteristica: "", precioUnitario: 0 },
  ]);

  const [notas, setNotas] = useState("");
  const [cotizacionCreada, setCotizacionCreada] = useState(null); // Nuevo estado para la cotización creada

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
    setItems([{ id: 1, cantidad: 1, caracteristica: "", precioUnitario: 0 }]);
    setNotas("");
    setCotizacionCreada(null); // Volvemos a la vista del formulario
  };

  // Cargar clientes al montar el componente
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const data = await getClientes();
        // Filtramos para evitar duplicados exactos si la API los devolviera
        const clientesUnicos = Array.from(
          new Set(data.map(JSON.stringify))
        ).map(JSON.parse);
        setClientes(clientesUnicos);
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
    setItems([
      ...items,
      { id: newId, cantidad: 1, caracteristica: "", precioUnitario: 0 },
    ]);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const { subtotal, impuestos, total } = useMemo(() => {
    const sub = items.reduce(
      (sum, item) => sum + item.cantidad * item.precioUnitario,
      0
    );
    const imp = sub * 0.19; // Asumiendo 19% de IVA como en el backend original
    const tot = sub + imp;
    return { subtotal: sub, impuestos: imp, total: tot };
  }, [items]);

  const formatCurrency = (value) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  const handleBusquedaChange = (e) => {
    const query = e.target.value;
    setBusquedaCliente(query);
    if (query.length > 1) {
      const filtrados = clientes.filter(
        (c) =>
          (c.cliente_empresa &&
            c.cliente_empresa.toLowerCase().includes(query.toLowerCase())) ||
          (c.cliente_nombre &&
            c.cliente_nombre.toLowerCase().includes(query.toLowerCase()))
      );
      setResultadosBusqueda(filtrados);
      setMostrarResultados(true);
    } else {
      setResultadosBusqueda([]);
      setMostrarResultados(false);
    }
  };

  const handleSelectCliente = (cliente) => {
    setClienteEmpresa(cliente.cliente_empresa || "");
    setClienteContacto(cliente.cliente_nombre || "");
    setClienteEmail(cliente.cliente_email || "");
    setClienteTelefono(cliente.cliente_telefono || "");
    setClienteDireccion(cliente.cliente_direccion || "");
    setMostrarResultados(false);
    setBusquedaCliente("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      // La empresa se asigna por defecto en el backend (ID=1)
      cliente_nombre: clienteContacto,
      cliente_empresa: clienteEmpresa,
      cliente_email: clienteEmail,
      cliente_telefono: clienteTelefono,
      cliente_direccion: clienteDireccion,
      asunto: asunto,
      tiempo_entrega: tiempoEntrega,
      observaciones: notas,
      // El backend recalcula los totales, pero los enviamos como referencia si es necesario
      subtotal: subtotal,
      iva: impuestos,
      total: total,
      items: items.map((item) => ({
        cantidad: item.cantidad,
        caracteristica: item.caracteristica,
        valor_unitario: item.precioUnitario,
      })),
    };

    try {
      const nuevaCotizacion = await crearCotizacionCompleta(payload);

      // Transformamos la respuesta de la API a la estructura que CotizacionA4 espera
      const cotizacionParaVista = {
        ...nuevaCotizacion, // Mantenemos todos los campos como subtotal, iva, total, etc.
        cliente: {
          nombre: nuevaCotizacion.cliente_nombre,
          empresa: nuevaCotizacion.cliente_empresa,
          email: nuevaCotizacion.cliente_email,
          telefono: nuevaCotizacion.cliente_telefono,
        },
        // Los items ya vienen en la propiedad 'items' del serializer, así que no es necesario remapearlos aquí.
      };

      // Mostramos la vista A4 con los datos transformados
      setCotizacionCreada(cotizacionParaVista);
    } catch (error) {
      console.error("Error al crear la cotización:", error);
      alert(`Error al crear la cotización: ${error.message}`);
    }
  };

  return (
    // Renderizado condicional: si hay una cotización creada, muestra la vista A4. Si no, muestra el formulario.
    cotizacionCreada ? (
      <CotizacionA4 cotizacion={cotizacionCreada} onBack={resetFormulario} />
    ) : (
      <div className="page-container">
        <div className="page-header">
          <h1>Crear Nueva Cotización</h1>
        </div>

        <form onSubmit={handleSubmit} className="cotizacion-form">
          {/* Información del Cliente */}
          <div className="card">
            <h2>Información del Cliente</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Nombre del Cliente / Empresa</label>
                <input
                  type="text"
                  value={clienteEmpresa}
                  onChange={(e) => setClienteEmpresa(e.target.value)}
                  placeholder="Ej. Acme Inc."
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
                placeholder="Ej. Av. Siempre Viva 123"
              />
            </div>
          </div>

          {/* Detalles de la Cotización */}
          <div className="card">
            <h2>Detalles de la Cotización</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Asunto</label>
                <input
                  type="text"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  placeholder="Ej. Implementación en minería"
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

          {/* Artículos Cotizados */}
          <div className="card">
            <h2>Artículos Cotizados</h2>
            <div className="items-table">
              <div className="items-header">
                <span>Cantidad</span>
                <span>Descripción</span>
                <span>Precio Unitario</span>
                <span>Importe</span>
                <span></span>
              </div>
              {items.map((item) => (
                <div key={item.id} className="item-row">
                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "cantidad",
                        Number(e.target.value)
                      )
                    }
                  />
                  <input
                    type="text"
                    value={item.caracteristica}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "caracteristica",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.precioUnitario}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "precioUnitario",
                        Number(e.target.value)
                      )
                    }
                  />
                  <input
                    type="text"
                    value={formatCurrency(item.cantidad * item.precioUnitario)}
                    readOnly
                  />
                  {/* Solo mostrar el botón de eliminar si hay más de un item */}
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

          {/* Notas y Totales */}
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
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="total-row">
                <span>Impuestos (IVA 19%)</span>
                <span>{formatCurrency(impuestos)}</span>
              </div>
              <div className="total-row total">
                <strong>Total</strong>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Guardar Cotización
            </button>
          </div>
        </form>
      </div>
    )
  );
};

export default CrearCotizacion;
