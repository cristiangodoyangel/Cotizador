import React, { useRef } from "react";
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
  // --- 1. AÑADIMOS UNA REFERENCIA AL DIV A4 ---
  const printRef = useRef();

  // --- 2. REEMPLAZAMOS EL 'handlePrint' ---
  const handlePrint = () => {
    const input = printRef.current; // Este es el <div className="cotizacion-a4">
    if (!input) return;

    // Ocultamos los botones ANTES de tomar la "foto"
    const actions = input.querySelector(".cotizacion-actions");
    if (actions) {
      actions.style.display = "none";
    }

    html2canvas(input, {
      scale: 2, // Mayor escala para mejor calidad de imagen
      useCORS: true,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      // Creamos el PDF en formato A4 (210mm x 297mm)
      const pdf = new jsPDF("p", "mm", "a4"); // 'p' = portrait (vertical)
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculamos la proporción para que la "foto" quepa en la hoja A4
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      // Centramos la imagen en la hoja A4
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0; // Empezamos desde arriba

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      // Volvemos a mostrar los botones después de tomar la "foto"
      if (actions) {
        actions.style.display = "flex"; // (O el display que tuviera antes)
      }

      // --- 3. ¡LA SOLUCIÓN! ---
      // Forzamos la descarga del archivo con el nombre correcto.
      pdf.save(`COTIZACIÓN N° ${cotizacion.numero}.pdf`);
    });
  };
  // --- FIN DE LA NUEVA FUNCIÓN ---

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
    // --- 4. AÑADIMOS LA 'ref' AL DIV PRINCIPAL ---
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

      {/* --- BOTONES DE ACCIÓN (CORREGIDOS) --- */}
      <div className="cotizacion-actions">
        {/* 1. Botón Cerrar (Siempre visible) */}
        <button onClick={onBack} className="action-button secondary">
          Cerrar
        </button>

        {/* 2. Botón Eliminar (Solo en móvil) */}
        {onDelete && (
          <button
            onClick={onDelete}
            className="action-button danger show-on-mobile-flex"
          >
            Eliminar
          </button>
        )}

        {/* 3. Botón Descargar (Solo en escritorio) */}
        {showPrintButton && (
          <button
            onClick={handlePrint}
            className="action-button hide-on-mobile"
          >
            Descargar PDF
          </button>
        )}

        {/* 4. BOTÓN DESCARGAR (SOLO EN MÓVIL) --- ¡ESTE ES EL QUE RESTAURAMOS! --- */}
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
