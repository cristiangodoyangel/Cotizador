import React from "react";
import logo from "../assets/img/logo.png";
// ELIMINADO: Ya no se importan 'topImage' ni 'botImage'
import "./CotizacionA4.css";

const CotizacionA4 = ({ cotizacion, onBack, showPrintButton = false }) => {
  // Si no hay datos de cotización, no renderizamos nada.
  if (!cotizacion) {
    return (
      <div className="cotizacion-a4">
        <p>Cargando datos de la cotización...</p>
      </div>
    );
  }

  const {
    cliente,
    items,
    numero,
    fecha,
    subtotal,
    iva,
    total,
    tiempo_entrega,
    observaciones,
  } = cotizacion;

  return (
    <div className="cotizacion-a4">
      <div className="cotizacion-content">
        {/* --- ENCABEZADO --- */}
        <div className="cotizacion-header">
          <img
            src={logo}
            alt="Logo Yajasa"
            className="cotizacion-logo-yasaja"
          />
          <div className="cotizacion-company-info">
            <h2>Yajasa Technology</h2>
            <p>RUT: 77.182.974-0</p>
            <p>Uribe 636 Of 707, Centro Negocios, Antofagasta</p>
            <p>Teléfono: +56-9-42920058</p>
            <p>Email: yajasa.technology@gmail.com</p>
          </div>
        </div>

        {/* --- TÍTULO Y FECHA --- */}
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

        {/* --- DATOS DEL CLIENTE --- */}
        <div className="cotizacion-cliente">
          <p>
            <strong>Señores:</strong> {cliente.empresa}
          </p>
          <p>
            <strong>Atención:</strong> {cliente.nombre}
          </p>
          <p>
            <strong>Email:</strong> {cliente.email}
          </p>
          <p>
            <strong>Teléfono:</strong> {cliente.telefono}
          </p>
        </div>

        {/* --- TABLA DE ARTÍCULOS Y TOTALES (FUSIONADAS) --- */}
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
            {items.map((item, index) => (
              <tr key={item.id || index}>
                <td>{index + 1}</td>
                <td>{item.cantidad}</td>
                <td>{item.caracteristica}</td>
                <td className="text-right">
                  $
                  {(parseFloat(item.valor_unitario) || 0).toLocaleString(
                    "es-CL"
                  )}
                </td>
                <td className="text-right">
                  $
                  {(item.cantidad * item.valor_unitario).toLocaleString(
                    "es-CL"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          {/* --- TOTALES MOVIDOS AL TFOOT DE LA TABLA PRINCIPAL --- */}
          {/* --- TOTALES MOVIDOS AL TFOOT DE LA TABLA PRINCIPAL --- */}
          <tfoot>
            <tr>
              <td colSpan="3" className="summary-empty"></td>
              <td className="summary-label">Subtotal:</td>
              <td className="summary-value">
                ${(parseFloat(subtotal) || 0).toLocaleString("es-CL")}
              </td>
            </tr>
            <tr>
              <td colSpan="3" className="summary-empty"></td>
              <td className="summary-label">IVA (19%):</td>
              <td className="summary-value">
                ${(parseFloat(iva) || 0).toLocaleString("es-CL")}
              </td>
            </tr>
            <tr className="total-row-final">
              <td colSpan="3" className="summary-empty"></td>
              <td className="summary-label">TOTAL</td>
              <td className="summary-value">
                ${(parseFloat(total) || 0).toLocaleString("es-CL")}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* --- TOTALES (DIV ANTIGUO ELIMINADO) --- */}
        {/* Ya no necesitas el <div className="cotizacion-summary-wrapper">...</div> */}

        {/* --- PIE DE PÁGINA --- */}
        <div className="cotizacion-footer-text">
          <p>Tiempo de Entrega: {tiempo_entrega}</p>
          {observaciones && (
            <p className="cotizacion-nota">Observaciones: {observaciones}</p>
          )}
        </div>
      </div>

      {/* --- BOTONES DE ACCIÓN (SIN IMPRIMIR) --- */}
      <div className="cotizacion-actions">
        <button onClick={onBack} className="action-button secondary">
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default CotizacionA4;
