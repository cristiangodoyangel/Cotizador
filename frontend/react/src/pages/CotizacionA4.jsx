import React, { useRef, useEffect } from "react"; // <-- CAMBIO 1: Importar useEffect
import "./CotizacionA4.css";
import logo from "../assets/img/logo.png"; // Asumiendo que la ruta es correcta

// --- ¡NUEVAS IMPORTACIONES! ---
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const CotizacionA4 = ({
  cotizacion,
  onBack,
  onDelete,
  showPrintButton = true,
}) => {
  const printRef = useRef();

  // --- CAMBIO 2: Añadimos useEffect para aplicar el "truco" ---
  useEffect(() => {
    // Esta es la "lógica que ya funciona" que descubriste.
    // La aplicamos en cuanto se carga el modal para que
    // los botones se vean bien desde el inicio.
    if (printRef.current) {
      const actions = printRef.current.querySelector(".cotizacion-actions");
      if (actions) {
        // Esto anula cualquier CSS conflictivo y fuerza la fila
        actions.style.display = "flex";
      }
    }
  }, []); // El array vacío [] asegura que se ejecute solo una vez

  // --- Tu función handlePrint se queda igual ---
  const handlePrint = () => {
    const input = printRef.current;
    if (!input) return;

    const actions = input.querySelector(".cotizacion-actions");

    const originalWidth = input.style.width;
    const originalMinHeight = input.style.minHeight;
    if (actions) {
      actions.style.display = "none";
    }

    input.style.width = "210mm";
    input.style.minHeight = "297mm";

    html2canvas(input, {
      scale: 2,
      useCORS: true,
      windowWidth: input.scrollWidth,
      windowHeight: input.scrollHeight,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();

      const ratio = pdfWidth / canvas.width;
      const imgHeight = canvas.height * ratio;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);

      // Aquí es donde el estilo se volvía a aplicar "accidentalmente"
      if (actions) {
        actions.style.display = "flex";
      }
      input.style.width = originalWidth;
      input.style.minHeight = originalMinHeight;

      pdf.save(`COTIZACIÓN N° ${cotizacion.numero}.pdf`);
    });
  };

  if (!cotizacion) {
    return (
      <div className="cotizacion-a4">
        <p>Cargando datos de la cotización...</p>
      </div>
    );
  }

  // (El resto de tu código de desestructuración y formatCurrency se mantiene igual)
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

  const formatCliente = (field) => cliente?.[field] || "N/A";
  const formatEmpresa = (field) => empresa?.[field] || "N/A";

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
    <div className="cotizacion-a4" ref={printRef}>
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

        {/* --- WRAPPER DE TABLA (Sin cambios) --- */}
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

        {/* --- PIE DE PÁGINA (Sin cambios) --- */}
        <div className="cotizacion-footer-text">
          <p>Tiempo de Entrega: {tiempo_entrega}</p>
          {observaciones && (
            <p className="cotizacion-nota">Observaciones: {observaciones}</p>
          )}
        </div>
      </div>

      {/* --- BOTONES DE ACCIÓN (Corregidos) --- */}
      {/* (Este es el código de tu mensaje anterior, que restaura ambos botones) */}
      <div className="cotizacion-actions">
        <button onClick={onBack} className="action-button secondary">
          Cerrar
        </button>

        {onDelete && (
          <button
            onClick={onDelete}
            className="action-button danger show-on-mobile-flex"
          >
            Eliminar
          </button>
        )}

        {showPrintButton && (
          <button
            onClick={handlePrint}
            className="action-button hide-on-mobile"
          >
            Descargar PDF
          </button>
        )}

        {showPrintButton && (
          <button
            onClick={handlePrint}
            className="action-button show-on-mobile-flex"
          >
            Descargar PDF
          </button>
        )}
      </div>
    </div>
  );
};

export default CotizacionA4;
