import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  listarCotizaciones,
  eliminarCotizacion,
  obtenerCotizacion,
} from "../api";
import "./Listado.css";
import CotizacionA4 from "./CotizacionA4";

const ListadoCotizaciones = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCotizacion, setSelectedCotizacion] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);

  // --- ¡¡AQUÍ ESTABA EL ERROR!! ---
  // Estas líneas las borré por accidente. Ahora están de vuelta.
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "numero",
    direction: "descending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // --- FIN DEL ERROR ---

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
    const newCotizacionId = location.state?.newCotizacionId;
    if (newCotizacionId) {
      handleVerPdf(newCotizacionId);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // --- CÓDIGO DE SOLUCIÓN DE IMPRESIÓN ---
  // Este efecto agrega/quita una clase del <body>
  useEffect(() => {
    if (modalVisible) {
      document.body.classList.add("modal-is-open-for-print");
    } else {
      document.body.classList.remove("modal-is-open-for-print");
    }
    return () => {
      document.body.classList.remove("modal-is-open-for-print");
    };
  }, [modalVisible]);
  // --- FIN DEL CÓDIGO DE SOLUCIÓN ---

  const formatCurrency = (value) => {
    return parseFloat(value).toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
    });
  };

  // Hook useMemo para procesar los datos (filtrar y ordenar)
  const processedItems = useMemo(() => {
    let filteredItems = [...cotizaciones];

    // Filtrado (Ahora 'searchTerm' existe)
    if (searchTerm) {
      filteredItems = filteredItems.filter(
        (item) =>
          item.numero
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.cliente_empresa
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.cliente_nombre
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.asunto?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenamiento (Ahora 'sortConfig' existe)
    if (sortConfig.key) {
      filteredItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredItems;
  }, [cotizaciones, searchTerm, sortConfig]);

  // Efecto para resetear la paginación
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  // Hook useMemo para la paginación
  const paginatedItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return processedItems.slice(indexOfFirstItem, indexOfLastItem);
  }, [processedItems, currentPage, itemsPerPage]);

  const currentItems = paginatedItems;
  const totalPages = Math.ceil(processedItems.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleEliminar = async (cotizacionId) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar esta cotización?")
    ) {
      try {
        await eliminarCotizacion(cotizacionId);
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
      <div className="controls-container">
        <input
          type="text"
          placeholder="Buscar por N°, cliente, asunto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => requestSort("numero")}>
                  Número{" "}
                  {sortConfig.key === "numero" &&
                    (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </th>
                <th onClick={() => requestSort("fecha")}>
                  Fecha{" "}
                  {sortConfig.key === "fecha" &&
                    (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </th>
                <th onClick={() => requestSort("cliente_empresa")}>
                  Cliente{" "}
                  {sortConfig.key === "cliente_empresa" &&
                    (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </th>
                <th>Asunto</th>
                <th onClick={() => requestSort("total")}>
                  Total{" "}
                  {sortConfig.key === "total" &&
                    (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((cot) => (
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
                        className="btn-action2"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No se encontraron resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &laquo; Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`page-number ${
                    currentPage === number ? "active" : ""
                  }`}
                >
                  {number}
                </button>
              )
            )}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente &raquo;
            </button>
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
