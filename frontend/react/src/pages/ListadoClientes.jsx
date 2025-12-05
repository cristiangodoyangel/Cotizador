import React, { useState, useEffect } from "react";
import { getClientes, eliminarCliente } from "../api";
import "./Listado.css";
import logo from "../assets/img/logo2.webp";

const ListadoClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await getClientes();
        setClientes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = clientes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(clientes.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openDeleteConfirmModal = (cliente) => {
    setClientToDelete(cliente);
    setIsDeleteModalOpen(true);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setClientToDelete(null);
    setDeleteError(null);
    setIsDeleting(false);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await eliminarCliente(clientToDelete.id);
      setClientes(clientes.filter((c) => c.id !== clientToDelete.id));
      closeDeleteModal();
    } catch (err) {
      setDeleteError("Error al eliminar el cliente: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-titulo">Listado de Clientes</h1>
      </div>

      {loading ? (
        <p className="cargando">Cargando clientes...</p>
      ) : error ? (
        <p className="error-cargando">Error: {error}</p>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Contacto</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.empresa || "N/A"}</td>
                    <td>{cliente.nombre_contacto}</td>
                    <td>{cliente.email}</td>
                    <td>{cliente.telefono}</td>
                    <td>
                      <button
                        onClick={() => openDeleteConfirmModal(cliente)}
                        className="btn-action2"
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
      )}

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
              ¿Estás seguro de que deseas eliminar al cliente{" "}
              <strong>
                {clientToDelete?.empresa || clientToDelete?.nombre_contacto}
              </strong>
              ?
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
    </div>
  );
};

export default ListadoClientes;
