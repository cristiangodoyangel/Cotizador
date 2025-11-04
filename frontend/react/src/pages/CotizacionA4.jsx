import React from "react";
import logo from "../assets/img/logo.png";
// ELIMINADO: Ya no se importan 'topImage' ni 'botImage'
import "./CotizacionA4.css";

const CotizacionA4 = ({ cotizacion, onBack, showPrintButton = false }) => {
  if (!cotizacion) return null;
  const { cliente, items } = cotizacion;

  // Función de impresión que cambia el nombre del archivo PDF
  const handlePrint = () => {
    // 1. Guardar el título original
    const originalTitle = document.title;

    // 2. Crear el nuevo título
    const cotizacionId = cotizacion.id || cotizacion.numero || "nuevo";
    const newTitle = `cotizacion-${cotizacionId}`;
    document.title = newTitle;

    // 3. Llamar a la función de impresión
    window.print();

    // 4. Restaurar el título original
    const restoreTitle = () => {
      document.title = originalTitle;
      window.removeEventListener("afterprint", restoreTitle);
    };
    window.addEventListener("afterprint", restoreTitle);

    setTimeout(() => {
      if (document.title === newTitle) {
        document.title = originalTitle;
      }
    }, 2000);
  };

  return (
    <div className="cotizacion-a4">
      {/* ELIMINADO: <img src={topImage} ... /> */}

      <div className="cotizacion-content">
        <div className="cotizacion-header">
          <img src={logo} alt="Logo" className="cotizacion-logo-yasaja" />
          <div className="cotizacion-company-info">
            <div>
              <b>Fecha:</b> {new Date().toLocaleDateString()}
            </div>
            <div>
              <b>Empresa:</b> Yajasa Technology
            </div>
            <div>
              <b>RUT:</b> 77.182.974-0
            </div>
            <div>
              <b>Dirección:</b> Uribe 636 Of 707, Centro Negocios, Antofagasta
            </div>
            <div>
              <b>Teléfono:</b> +56-9-42920058
            </div>
            <div>
              <b>Email:</b> yajasa.technology@gmail.com
            </div>
          </div>
        </div>

        <h2>COTIZACIÓN</h2>

        <div className="cotizacion-cliente">
          <div>
            <b>Señores:</b> {cliente.empresa}
          </div>
          <div>
            <b>Atención:</b> {cliente.nombre}
          </div>
          <div>
            <b>Email:</b> {cliente.email}
          </div>
          <div>
            <b>Teléfono:</b> {cliente.telefono}
          </div>
        </div>

        <table className="cotizacion-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Cantidad</th>
              <th>Detalle</th>
              <th>Precio Unitario</th>
              <th>Precio Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index}>
                <td>{index + 1}</td>
                <td>{item.cantidad}</td>
                <td>{item.caracteristica}</td>
                <td>
                  ${(parseFloat(item.valor_unitario) || 0).toLocaleString()}
                </td>
                <td>${(parseFloat(item.total) || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="cotizacion-summary-wrapper">
          <table className="cotizacion-summary-table">
            <tbody>
              <tr>
                <td>Subtotal:</td>
                <td>
                  ${(parseFloat(cotizacion.subtotal) || 0).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td>IVA (19%):</td>
                <td>${(parseFloat(cotizacion.iva) || 0).toLocaleString()}</td>
              </tr>
              <tr className="summary-total-row">
                <td>
                  <strong>Total:</strong>
                </td>
                <td>
                  <strong>
                    ${(parseFloat(cotizacion.total) || 0).toLocaleString()}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="cotizacion-footer-text">
          <p>Tiempo de Entrega de Servicio: {cotizacion.tiempo_entrega}</p>
          <p>
            <b>Yajasa Technology</b>
            <br />
            77.182.974-0
          </p>
          <p className="cotizacion-nota">{cotizacion.observaciones}</p>
        </div>
      </div>

      <div className="cotizacion-actions no-print">
        {showPrintButton && (
          <button onClick={handlePrint} className="action-button">
            Guardar PDF
          </button>
        )}
        <button onClick={onBack} className="action-button secondary">
          {showPrintButton ? "Cerrar" : "Crear Otra Cotización"}
        </button>
      </div>

      {/* ELIMINADO: <img src={botImage} ... /> */}
    </div>
  );
};

export default CotizacionA4;
