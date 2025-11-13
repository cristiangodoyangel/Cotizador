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

  // Estados para el modal PDF
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCotizacion, setSelectedCotizacion] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);

  // --- NUEVO: Estados para el modal de eliminación ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  // --- FIN NUEVO ---

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "numero",
    direction: "descending",
  });
  const [currentPage, setCurrentPage] = useState(1);
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
    const newCotizacionId = location.state?.newCotizacionId;
    if (newCotizacionId) {
      handleVerPdf(newCotizacionId);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

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

  const formatCurrency = (value) => {
    // Verificamos si 'value' es un número válido antes de formatear
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
      return "$0"; // O '$NaN' si prefieres, pero $0 es más limpio
    }
    return parsedValue.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
    });
  };

  const processedItems = useMemo(() => {
    let filteredItems = [...cotizaciones];
    if (searchTerm) {
      filteredItems = filteredItems.filter(
        (item) =>
          item.numero
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          /* --- MODIFICADO (1/4): Leer del objeto anidado 'cliente' --- */
          item.cliente?.empresa
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.cliente?.nombre_contacto
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          /* --- FIN MODIFICADO --- */

          item.asunto?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig.key) {
      // --- NOTA: El sortConfig necesitará un ajuste más profundo
      // --- para ordenar por campos anidados. Por ahora, lo dejamos así.
      filteredItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // --- MODIFICADO (Opcional): Lógica básica para ordenar por cliente ---
        if (sortConfig.key === "cliente_empresa") {
          aValue = a.cliente?.empresa || a.cliente?.nombre_contacto;
          bValue = b.cliente?.empresa || b.cliente?.nombre_contacto;
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredItems;
  }, [cotizaciones, searchTerm, sortConfig]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

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

  // ... (lógica de eliminación sin cambios) ...
  const openDeleteConfirmModal = (cotizacionId) => {
    const quote = cotizaciones.find((c) => c.id === cotizacionId);
    setQuoteToDelete(quote);
    setIsDeleteModalOpen(true);
    setDeleteError(null);
  };
  const closeDeleteModal = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setQuoteToDelete(null);
    setDeleteError(null);
    setIsDeleting(false);
  };
  const confirmDelete = async () => {
    if (!quoteToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await eliminarCotizacion(quoteToDelete.id);
      setCotizaciones(
        cotizaciones.filter((cot) => cot.id !== quoteToDelete.id)
      );
      closeDeleteModal();
    } catch (err) {
      setDeleteError("Error al eliminar la cotización: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  /* --- MODIFICADO (2/4): 'handleVerPdf' ahora es mucho más simple --- */
  const handleVerPdf = async (cotizacionId) => {
    setModalVisible(true);
    setLoadingModal(true);
    setSelectedCotizacion(null);
    try {
      // La 'cotizacionData' que recibimos de la API
      // ya tiene la estructura anidada correcta (cliente: {}, items: [])
      // gracias a nuestros nuevos Serializers de Django.
      const cotizacionData = await obtenerCotizacion(cotizacionId);

      // Ya no necesitamos construir 'cotizacionParaVista'.
      // Simplemente usamos la data tal como viene.
      setSelectedCotizacion(cotizacionData);
    } catch (err) {
      alert("Error al cargar la cotización: " + err.message);
      setModalVisible(false);
    } finally {
      setLoadingModal(false);
    }
  };
  /* --- FIN MODIFICADO --- */

  const closeModal = () => setModalVisible(false);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-titulo">Listado de Cotizaciones</h1>
      </div>

      {loading ? (
        <p className="cargando">Cargando cotizaciones...</p>
      ) : error ? (
        <p className="error-cargando">Error al cargar cotizaciones: {error}</p>
      ) : (
        <>
          <div className="mb-3 controls-container">
            <div className="search-input-wrapper">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.25"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="icon-tabler icon-tabler-search"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                <path d="M21 21l-6 -6" />
              </svg>

              <input
                type="text"
                placeholder="Buscar por N°, cliente, asunto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control search-input"
              />
            </div>
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
                    {/* Hacemos clic en 'cliente_empresa' para ordenar */}
                    <th onClick={() => requestSort("cliente_empresa")}>
                      Cliente{" "}
                      {sortConfig.key === "cliente_empresa" &&
                        (sortConfig.direction === "ascending" ? "↑" : "↓")}
                    </th>
                    <th className="hide-on-mobile">Asunto</th>
                    <th
                      className="hide-on-mobile"
                      onClick={() => requestSort("total")}
                    >
                      Total{" "}
                      {sortConfig.key === "total" &&
                        (sortConfig.direction === "ascending" ? "↑" : "↓")}
                    </th>
                    <th className="hide-on-mobile"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((cot) => (
                      <tr key={cot.numero}>
                        <td
                          onClick={() => handleVerPdf(cot.id)}
                          className="clickable-id"
                        >
                          #{cot.numero}
                        </td>
                        <td>
                          {new Date(cot.fecha).toLocaleDateString("es-CL")}
                        </td>

                        {/* --- MODIFICADO (3/4): Leer del objeto anidado 'cliente' --- */}
                        <td>
                          {cot.cliente?.empresa ||
                            cot.cliente?.nombre_contacto ||
                            "Cliente no disponible"}
                        </td>

                        <td className="hide-on-mobile">{cot.asunto}</td>
                        <td className="hide-on-mobile">
                          {formatCurrency(cot.total)}
                        </td>
                        <td className="hide-on-mobile">
                          <button
                            onClick={() => handleVerPdf(cot.id)}
                            className="btn-action"
                          >
                            PDF
                          </button>
                          <button
                            onClick={() => openDeleteConfirmModal(cot.id)}
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
            {/* ... (tu paginación) ... */}
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
        </>
      )}

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
      {/* --- NUEVO: Modal de Confirmación de Eliminación --- */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div
            className="modal-content delete-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeDeleteModal} className="modal-close-btn">
              &times;
            </button>
            <h3>Confirmar Eliminación</h3>
            <p>
              ¿Estás seguro de que deseas eliminar la cotización{" "}
              <strong>#{quoteToDelete?.numero}</strong> (Cliente:{" "}
              {/* --- MODIFICADO (4/4): Leer del objeto anidado 'cliente' --- */}
              <strong>
                {quoteToDelete?.cliente?.empresa ||
                  quoteToDelete?.cliente?.nombre_contacto}
              </strong>
              )?
            </p>
            <p>Esta acción no se puede deshacer.</p>

            {deleteError && <p className="modal-error">{deleteError}</p>}

            <div className="modal-actions">
              <button
                className="modal-btn modal-btn-cancel"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                className="modal-btn modal-btn-confirm"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- FIN NUEVO --- */}
    </div>
  );
};

export default ListadoCotizaciones;
