import React from "react";
import logo from "../assets/img/logo.png";
// ELIMINADO: Ya no se importan 'topImage' ni 'botImage'
import "./CotizacionA4.css";

const CotizacionA4 = ({ cotizacion, onBack, showPrintButton = false }) => {
  if (!cotizacion) return null;
  const { cliente, items } = cotizacion;

  const [isAlreadyPrinted, setIsAlreadyPrinted] = React.useState(false);

  // useEffect para manejar la restauración del título después de imprimir.
  // Esto evita que se agreguen múltiples listeners si el componente se renderiza varias veces.
  React.useEffect(() => {
    const originalTitle = document.title;

    const restoreTitle = () => {
      document.title = originalTitle;
    };

    window.addEventListener("afterprint", restoreTitle);

    // Función de limpieza: se ejecuta cuando el componente se desmonta.
    return () => {
      window.removeEventListener("afterprint", restoreTitle);
      console.log("useEffect cleanup");
    };
  }, []); // El array vacío asegura que esto se ejecute solo una vez (al montar).

  const handlePrint = () => {
    // Cambiamos el título justo antes de imprimir.
    if (isAlreadyPrinted) {
      return;
    }
    // El useEffect se encargará de restaurarlo.
    const cotizacionId = cotizacion.id || cotizacion.numero || "nuevo";
    const newTitle = `cotizacion-${cotizacionId}`;
    document.title = newTitle;

    window.print();
  };

  return (
    <div className="cotizacion-a4">
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

        <h2>COTIZACIÓN N° {cotizacion.numero}</h2>

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
