import React from "react";
import "./CotizacionA4.css";
import logo from "../assets/img/logo.png"; // Asumiendo que la ruta es correcta

// --- CAMBIO (1/4): Acepta la nueva prop 'onDelete' ---
const CotizacionA4 = ({
  cotizacion,
  onBack,
  onDelete, // <-- Prop nueva
  showPrintButton = true,
}) => {
  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `COTIZACIÓN N° ${cotizacion.numero}`;
    window.print();
    document.title = originalTitle;
  };

  if (!cotizacion) {
    return (
      <div className="cotizacion-a4">
        <p>Cargando datos de la cotización...</p>
      </div>
    );
  }

  // Desestructuramos los datos
  const {
    cliente,
    empresa,
    items,
    numero,
    fecha,
    subtotal,
    iva,
    total,
    tiempo_entrega,
    observaciones,
  } = cotizacion;

  // --- Funciones seguras para formatear ---
  const formatCliente = (field) => cliente?.[field] || "N/A";
  const formatEmpresa = (field) => empresa?.[field] || "N/A";

  // (Tu función 'formatCurrency' ya estaba correcta para no mostrar decimales)
  const formatCurrency = (value) => {
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
      return "$0";
    }
    return parsedValue.toLocaleString("es-CL", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  };

  return (
    <div className="cotizacion-a4">
      <div className="cotizacion-content">
        {/* --- ENCABEZADO (Sin cambios) --- */}
        <div className="cotizacion-header">
          <img
            src={logo}
            alt="Logo Yajasa"
            className="cotizacion-logo-yasaja"
          />
          <div className="cotizacion-company-info">
            <h2>{formatEmpresa("nombre")}</h2>
            <p>RUT: {formatEmpresa("rut")}</p>
            <p>{formatEmpresa("direccion")}</p>
            <p>Teléfono: {formatEmpresa("telefono")}</p>
            <p>Email: {formatEmpresa("email")}</p>
          </div>
        </div>

        {/* --- TÍTULO Y FECHA (Sin cambios) --- */}
        <div>
          <div style={{ textAlign: "right" }}>
            <p className="cotizacion-date">
              <strong>Fecha:</strong>{" "}
              {new Date(fecha).toLocaleDateString("es-CL")}
            </p>
          </div>
          <div className="titulos">
            <h2 className="titulo">COTIZACIÓN</h2>
            <p className="cotizacion-number">
              <strong>N°:</strong> {numero}
            </p>
          </div>
        </div>

        {/* --- DATOS DEL CLIENTE (Sin cambios) --- */}
        <div className="cotizacion-cliente">
          <p>
            <strong>Señores:</strong> {formatCliente("empresa")}
          </p>
          <p>
            <strong>Atención:</strong> {formatCliente("nombre_contacto")}
          </p>
          <p>
            <strong>Email:</strong> {formatCliente("email")}
          </p>
          <p>
            <strong>Teléfono:</strong> {formatCliente("telefono")}
          </p>
        </div>

        {/* --- CAMBIO (2/4): WRAPPER PARA TABLA RESPONSIVA --- */}
        <div className="cotizacion-table-responsive-wrapper">
          <table className="cotizacion-table">
            <thead>
              <tr>
                <th style={{ width: "10%" }}>Item</th>
                <th style={{ width: "10%" }}>Cantidad</th>
                <th>Detalle</th>
                <th style={{ width: "20%" }} className="text-right">
                  P. Unitario
                </th>
                <th style={{ width: "20%" }} className="text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {items && items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{index + 1}</td>
                    <td>{item.cantidad}</td>
                    <td>{item.descripcion}</td>
                    <td className="text-right">
                      ${formatCurrency(item.precio_unitario)}
                    </td>
                    <td className="text-right">
                      ${formatCurrency(item.total)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    No se han agregado artículos a esta cotización.
                  </td>
                </tr>
              )}
            </tbody>

            {/* --- TOTALES (Sin cambios) --- */}
            <tfoot>
              <tr>
                <td colSpan="3" className="summary-empty"></td>
                <td className="summary-label">Subtotal:</td>
                <td className="summary-value">${formatCurrency(subtotal)}</td>
              </tr>
              <tr>
                <td colSpan="3" className="summary-empty"></td>
                <td className="summary-label">IVA (19%):</td>
                <td className="summary-value">${formatCurrency(iva)}</td>
              </tr>
              <tr className="total-row-final">
                <td colSpan="3" className="summary-empty"></td>
                <td className="summary-label">TOTAL</td>
                <td className="summary-value">${formatCurrency(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        {/* --- FIN DEL WRAPPER --- */}

        {/* --- PIE DE PÁGINA (Sin cambios) --- */}
        <div className="cotizacion-footer-text">
          <p>Tiempo de Entrega: {tiempo_entrega}</p>
          {observaciones && (
            <p className="cotizacion-nota">Observaciones: {observaciones}</p>
          )}
        </div>
      </div>

      {/* --- BOTONES DE ACCIÓN --- */}
      <div className="cotizacion-actions">
        <button onClick={onBack} className="action-button secondary">
          Cerrar
        </button>

        {/* --- CAMBIO (4/4): OCULTAR "IMPRIMIR" EN MÓVIL --- */}
        {showPrintButton && (
          <button onClick={handlePrint} className="action-button">
            Imprimir
          </button>
        )}

        {/* --- CAMBIO (3/4): BOTÓN DE ELIMINAR NUEVO --- */}
        {/* Solo se muestra si la prop 'onDelete' existe */}
        {onDelete && (
          <button
            onClick={onDelete}
            // Clases nuevas para el estilo y para mostrarlo solo en móvil
            className="action-button danger show-on-mobile-flex"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
};

export default CotizacionA4;
