import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // 1. Importar hooks
import {
  listarCotizaciones,
  eliminarCotizacion,
  obtenerCotizacion,
} from "../api";
import "./Listado.css";
import CotizacionA4 from "./CotizacionA4"; // Importamos el componente A4

const ListadoCotizaciones = () => {
  const location = useLocation(); // 2. Obtener la ubicación para acceder al estado
  const navigate = useNavigate(); // Para limpiar el estado después de usarlo

  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Estados para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCotizacion, setSelectedCotizacion] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCotizaciones = async () => {
      try {
        const data = await listarCotizaciones();
        setCotizaciones(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCotizaciones();

    // 3. Comprobar si se pasó un ID de nueva cotización
    const newCotizacionId = location.state?.newCotizacionId;
    if (newCotizacionId) {
      handleVerPdf(newCotizacionId);

      // 4. Limpiar el estado de la ubicación para que el modal no se abra de nuevo si se recarga la página
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]); // Añadir dependencias al useEffect

  const formatCurrency = (value) => {
    return parseFloat(value).toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
    });
  };

  // Lógica de paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = cotizaciones.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(cotizaciones.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEliminar = async (cotizacionId) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar esta cotización?")
    ) {
      try {
        await eliminarCotizacion(cotizacionId);
        // Actualizar el estado para remover la cotización de la lista
        setCotizaciones(cotizaciones.filter((cot) => cot.id !== cotizacionId));
      } catch (err) {
        alert("Error al eliminar la cotización: " + err.message);
      }
    }
  };

  const handleVerPdf = async (cotizacionId) => {
    setModalVisible(true);
    setLoadingModal(true);
    setSelectedCotizacion(null);

    try {
      const cotizacionData = await obtenerCotizacion(cotizacionId);

      // Transformamos la respuesta para que coincida con la estructura que espera CotizacionA4
      const cotizacionParaVista = {
        ...cotizacionData,
        cliente: {
          nombre: cotizacionData.cliente_nombre,
          empresa: cotizacionData.cliente_empresa,
          email: cotizacionData.cliente_email,
          telefono: cotizacionData.cliente_telefono,
        },
      };

      setSelectedCotizacion(cotizacionParaVista);
    } catch (err) {
      alert("Error al cargar la cotización: " + err.message);
      setModalVisible(false);
    } finally {
      setLoadingModal(false);
    }
  };

  const closeModal = () => setModalVisible(false);

  if (loading) return <p>Cargando cotizaciones...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Listado de Cotizaciones</h1>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Asunto</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((cot) => (
                <tr key={cot.numero}>
                  <td>#{cot.numero}</td>
                  <td>{new Date(cot.fecha).toLocaleDateString("es-CL")}</td>
                  <td>{cot.cliente_empresa || cot.cliente_nombre}</td>
                  <td>{cot.asunto}</td>
                  <td>{formatCurrency(cot.total)}</td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleVerPdf(cot.id)}
                      className="btn-action"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => handleEliminar(cot.id)}
                      className="btn-action btn-danger"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={currentPage === number ? "active" : ""}
                >
                  {number}
                </button>
              )
            )}
          </div>
        )}
      </div>

      {modalVisible && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className="modal-close-btn">
              &times;
            </button>
            {loadingModal ? (
              <p>Cargando cotización...</p>
            ) : (
              selectedCotizacion && (
                <CotizacionA4
                  cotizacion={selectedCotizacion}
                  onBack={closeModal}
                  showPrintButton={true}
                />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListadoCotizaciones;
