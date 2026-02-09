import React, { useState } from 'react';

// Mock de proveedores
const proveedoresMock = [
  'Proveedora Andina S.R.L.',
  'Ferretería Industrial',
  'ElectroSum',
  'Suministros Eléctricos SRL',
  'Proveedor del Valle',
];

// Mock de productos
const productosMock = [
  { codigo: 'P001', nombre: 'Aceite Hidráulico', um: 'L', precio: 15.5 },
  { codigo: 'P002', nombre: 'Tornillos M6x40', um: 'unid', precio: 0.12 },
  { codigo: 'P003', nombre: 'Cables de Cobre 2mm', um: 'm', precio: 1.4 },
  {
    codigo: 'P004',
    nombre: 'Interruptores Industriales',
    um: 'unid',
    precio: 23,
  },
  { codigo: 'P005', nombre: 'Guantes de Seguridad', um: 'par', precio: 5 },
  { codigo: 'P006', nombre: 'Lubricante WD-40', um: 'L', precio: 20 },
  { codigo: 'P007', nombre: 'Fusibles 10A', um: 'unid', precio: 2.5 },
  { codigo: 'P008', nombre: 'Motor Eléctrico 2HP', um: 'unid', precio: 450 },
  { codigo: 'P009', nombre: 'Cinta Aislante', um: 'rollo', precio: 3 },
  { codigo: 'P010', nombre: 'Llave Inglesa 12"', um: 'unid', precio: 25 },
];

// Estilo reutilizable para inputs
const inputStyle = {
  padding: '0.5rem',
  border: '1px solid #ccc',
  borderRadius: 6,
  width: '100%',
};

export default function CompraInventarioPage() {
  const [proveedor, setProveedor] = useState('');
  const [productos, setProductos] = useState([
    { codigo: '', nombre: '', um: '', cantidad: 0, precio: 0, descP: 0 },
  ]);

  // Autocomplete de productos
  const getSuggestions = (value, field) => {
    if (!value) return [];
    const lower = value.toLowerCase();
    return productosMock.filter((p) => p[field].toLowerCase().includes(lower));
  };

  const handleChangeProducto = (index, field, value) => {
    const newProductos = [...productos];

    if (field === 'codigo') {
      newProductos[index].codigo = value;
      const match = productosMock.find((p) => p.codigo === value);
      if (match) {
        newProductos[index] = {
          ...newProductos[index],
          nombre: match.nombre,
          um: match.um,
          precio: match.precio,
        };
      }
    } else if (field === 'nombre') {
      newProductos[index].nombre = value;
      const match = productosMock.find((p) => p.nombre === value);
      if (match) {
        newProductos[index] = {
          ...newProductos[index],
          codigo: match.codigo,
          um: match.um,
          precio: match.precio,
        };
      }
    } else {
      newProductos[index][field] = value;
    }

    setProductos(newProductos);
  };

  const addProducto = () => {
    setProductos([
      ...productos,
      { codigo: '', nombre: '', um: '', cantidad: 0, precio: 0, descP: 0 },
    ]);
  };

  const removeProducto = (index) => {
    setProductos(productos.filter((_, i) => i !== index));
  };

  // Cálculos
  const calcularTotales = () => {
    let subtotal = 0;
    let descuento = 0;
    productos.forEach((p) => {
      const importe = p.cantidad * p.precio;
      const descBs = (importe * p.descP) / 100;
      subtotal += importe;
      descuento += descBs;
    });
    return { subtotal, descuento, total: subtotal - descuento };
  };

  const { subtotal, descuento, total } = calcularTotales();

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <h2
        style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}
      >
        Registro de Compra de Inventario
      </h2>

      {/* Datos de la compra */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <input style={inputStyle} placeholder="Nro. Doc." />
        <select
          style={inputStyle}
          value={proveedor}
          onChange={(e) => setProveedor(e.target.value)}
        >
          <option value="">Seleccione Proveedor</option>
          {proveedoresMock.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <input style={inputStyle} placeholder="Detalle" />
        <input style={inputStyle} placeholder="Almacén" />
        <div>
          <label>
            <input type="radio" name="doc" /> Factura
          </label>
          <label style={{ marginLeft: 12 }}>
            <input type="radio" name="doc" /> Documento
          </label>
        </div>
        <input style={inputStyle} placeholder="Nro. Factura" />
        <input style={inputStyle} placeholder="NIT" />
        <input style={inputStyle} placeholder="Fecha" type="date" />
        <input style={inputStyle} placeholder="T.C. Dólar" />
        <input style={inputStyle} placeholder="Nro. Autorización" />
      </div>

      {/* Tabla de productos */}
      <h3 style={{ marginBottom: '1rem' }}>Productos Comprados</h3>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '1rem',
        }}
      >
        <thead>
          <tr style={{ background: '#E1CD9B' }}>
            <th style={{ padding: '0.5rem' }}>COD. PRD.</th>
            <th style={{ padding: '0.5rem' }}>NOMBRE PRODUCTO</th>
            <th style={{ padding: '0.5rem' }}>U.M.</th>
            <th style={{ padding: '0.5rem' }}>CANTIDAD</th>
            <th style={{ padding: '0.5rem' }}>PRECIO Bs.</th>
            <th style={{ padding: '0.5rem' }}>Importe Bs.</th>
            <th style={{ padding: '0.5rem' }}>Desc.%</th>
            <th style={{ padding: '0.5rem' }}>Desc. Bs.</th>
            <th style={{ padding: '0.5rem' }}>SUBTOTAL</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p, i) => {
            const importe = p.cantidad * p.precio;
            const descBs = (importe * p.descP) / 100;
            const subtotal = importe - descBs;
            return (
              <tr
                key={i}
                style={{ background: i % 2 === 0 ? '#fff' : '#F5F5F5' }}
              >
                <td style={{ padding: '0.5rem', position: 'relative' }}>
                  <input
                    style={inputStyle}
                    value={p.codigo}
                    onChange={(e) =>
                      handleChangeProducto(i, 'codigo', e.target.value)
                    }
                    list={`codigos-${i}`}
                  />
                  <datalist id={`codigos-${i}`}>
                    {getSuggestions(p.codigo, 'codigo').map((s) => (
                      <option key={s.codigo} value={s.codigo} />
                    ))}
                  </datalist>
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input
                    style={inputStyle}
                    value={p.nombre}
                    onChange={(e) =>
                      handleChangeProducto(i, 'nombre', e.target.value)
                    }
                    list={`nombres-${i}`}
                  />
                  <datalist id={`nombres-${i}`}>
                    {getSuggestions(p.nombre, 'nombre').map((s) => (
                      <option key={s.codigo} value={s.nombre} />
                    ))}
                  </datalist>
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input style={inputStyle} value={p.um} readOnly />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input
                    type="number"
                    style={inputStyle}
                    value={p.cantidad}
                    onChange={(e) =>
                      handleChangeProducto(
                        i,
                        'cantidad',
                        Number(e.target.value),
                      )
                    }
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input
                    type="number"
                    style={inputStyle}
                    value={p.precio}
                    onChange={(e) =>
                      handleChangeProducto(i, 'precio', Number(e.target.value))
                    }
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>{importe.toFixed(2)}</td>
                <td style={{ padding: '0.5rem' }}>
                  <input
                    type="number"
                    style={inputStyle}
                    value={p.descP}
                    onChange={(e) =>
                      handleChangeProducto(i, 'descP', Number(e.target.value))
                    }
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>{descBs.toFixed(2)}</td>
                <td style={{ padding: '0.5rem' }}>{subtotal.toFixed(2)}</td>
                <td style={{ padding: '0.5rem' }}>
                  {productos.length > 1 && (
                    <button
                      onClick={() => removeProducto(i)}
                      style={{
                        background: 'red',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '0.3rem 0.6rem',
                        cursor: 'pointer',
                      }}
                    >
                      ❌
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        onClick={addProducto}
        style={{
          background: '#4CAF50',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '0.5rem 1rem',
          marginBottom: '1rem',
          cursor: 'pointer',
        }}
      >
        ➕ Agregar Producto
      </button>

      {/* Totales */}
      <div style={{ textAlign: 'right', marginTop: '2rem' }}>
        <p>
          <b>SUBTOTAL:</b> {subtotal.toFixed(2)} Bs.
        </p>
        <p>
          <b>DESCUENTO:</b> {descuento.toFixed(2)} Bs.
        </p>
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          TOTAL NETO: {total.toFixed(2)} Bs.
        </p>
      </div>
    </div>
  );
}
