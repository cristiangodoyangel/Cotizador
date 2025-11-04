import React, { useState } from 'react';
import { crearCotizacion } from '../api';
import './Home.css';

const Home = ({ onCreateCotizacion }) => {
  const [cliente, setCliente] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: ''
  });
  const [items, setItems] = useState([]);
  const [detalle, setDetalle] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState(0); // New state

  const handleClienteChange = e => {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  };

  const handleAddItem = () => {
    if (detalle.trim() !== '' && cantidad > 0 && precioUnitario >= 0) { // Added validation
      const precioTotal = cantidad * precioUnitario; // Calculate precioTotal
      setItems([...items, { id: items.length + 1, cantidad, detalle, precioUnitario, precioTotal }]); // Add new fields
      setDetalle('');
      setCantidad(1);
      setPrecioUnitario(0); // Reset precioUnitario
    }
  };


  const handleSubmit = async e => {
    e.preventDefault();
    if (cliente.nombre && cliente.empresa && cliente.email && cliente.telefono && items.length > 0) {
      try {
        // Calculate totals based on actual items
        const subtotal = items.reduce((sum, item) => sum + item.precioTotal, 0);
        const iva = subtotal * 0.19; // Assuming 19% IVA
        const total = subtotal + iva;

        // Usar el primer ítem como detalle principal
        const detallePrincipal = items.length > 0 ? items[0].detalle : '';

        const payload = {
          empresa: 1, // id de la empresa
          cliente_nombre: cliente.nombre,
          cliente_empresa: cliente.empresa,
          cliente_email: cliente.email,
          cliente_telefono: cliente.telefono,
          detalle: detallePrincipal,
          observaciones: items.map(item => `${item.id} - ${item.cantidad} - ${item.detalle} - ${item.precioUnitario.toLocaleString()} - ${item.precioTotal.toLocaleString()}`).join('\n'),
          tiempo_entrega: '1 Día, Esperando que la oferta sea de su aceptación',
          subtotal,
          iva,
          total,
          activa: true
        };
        const cotizacion = await crearCotizacion(payload);
        onCreateCotizacion({ cliente, items, subtotal, iva, total, backend: cotizacion }); // Pass totals to parent
      } catch (err) {
        alert('Error al crear cotización: ' + err.message);
      }
    }
  };

  return (
    <div className="home-form">
      <h2>Crear Cotización</h2>
      <form onSubmit={handleSubmit}>
        <h3>Datos del Cliente</h3>
        <input name="nombre" placeholder="Nombre" value={cliente.nombre} onChange={handleClienteChange} required />
        <input name="empresa" placeholder="Empresa" value={cliente.empresa} onChange={handleClienteChange} required />
        <input name="email" placeholder="Email" value={cliente.email} onChange={handleClienteChange} required />
        <input name="telefono" placeholder="Teléfono" value={cliente.telefono} onChange={handleClienteChange} required />
        <h3>Ítems de Cotización</h3>
        <div className="item-form">
          <input type="number" min={1} value={cantidad} onChange={e => setCantidad(Number(e.target.value))} placeholder="Cantidad" />
          <input value={detalle} onChange={e => setDetalle(e.target.value)} placeholder="Detalle" />
          <input type="number" min={0} value={precioUnitario} onChange={e => setPrecioUnitario(Number(e.target.value))} placeholder="Precio Unitario" /> {/* New input */}
          <button type="button" onClick={handleAddItem}>Agregar Ítem</button>
        </div>
        <ul>
          {items.map(item => (
            <li key={item.id}>{item.id} - {item.cantidad} - {item.detalle} - ${item.precioUnitario.toLocaleString()} - ${item.precioTotal.toLocaleString()}</li>
          ))}
        </ul>
        <button type="submit">Generar Cotización</button>
      </form>
    </div>
  );
};

export default Home;
