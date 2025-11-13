import React, { useState, useEffect } from "react";
import { getClientes } from "../api";
import "./Listado.css";

const ListadoClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        // La API 'getClientes' ahora devuelve la lista correcta
        // desde la tabla 'Cliente' de la base de datos.
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

  // Lógica de paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = clientes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(clientes.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- CORRECCIÓN 1: Mover la lógica de carga y error DENTRO del layout ---
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
                </tr>
              </thead>
              <tbody>
                {currentItems.map((cliente) => (
                  // --- CORRECCIÓN 2: Usar 'cliente.id' como key ---
                  <tr key={cliente.id}>
                    {/* --- CORRECCIÓN 3: Usar los nombres de campo correctos --- */}
                    <td>{cliente.empresa || "N/A"}</td>
                    <td>{cliente.nombre_contacto}</td>
                    <td>{cliente.email}</td>
                    <td>{cliente.telefono}</td>
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
    </div>
  );
};

export default ListadoClientes;
