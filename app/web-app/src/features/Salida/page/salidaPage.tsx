import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { salidaService } from '../services/salida.service';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';

const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

export default function SalidaPage() {
  const { theme } = useTheme();

  // Colores dinámicos según tema
  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const secondaryTextColor = theme === 'dark' ? colors.beige : colors.brown;
  const bgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const inputBgColor = theme === 'dark' ? '#2A2A2A' : '#F5F5F5';
  const inputBorderColor = theme === 'dark' ? '#3A3A3A' : '#D6D6D6';
  const theadBgColor = theme === 'dark' ? colors.brown : colors.gold;
  const theadTextColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const tbodyBgColor = theme === 'dark' ? '#232323' : '#FAFAFA';
  const successColor = theme === 'dark' ? '#4ADE80' : '#22863a';
  const errorColor = '#E53E3E';
  const buttonBgColor = '#2196F3';
  const buttonHoverColor = '#0b7dda';
  const addButtonBg = colors.gold;
  const addButtonHover = '#E69D00';

  // Estado de la salida
  const [nroSalida, setNroSalida] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [otId, setOtId] = useState('');
  const [fecha, setFecha] = useState('');
  const [observacion, setObservacion] = useState('');
  const [almacen, setAlmacen] = useState('');
  const [estado, setEstado] = useState('pendiente');

  // Productos saliendo
  const [productos, setProductos] = useState([
    {
      tipoProducto: 'repuesto',
      productoId: '',
      codigo: '',
      nombre: '',
      unidadMedida: '',
      cantidad: 0,
      precioUnitario: 0,
      porcentajeDescuento: 0,
    },
  ]);

  // Datos del servidor
  const [usuarios, setUsuarios] = useState([]);
  const [ots, setOts] = useState([]);
  const [repuestos, setRepuestos] = useState([]);
  const [repuestosMaquina, setRepuestosMaquina] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar datos del servidor al montar
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [usrs, ots_, rep, repMaq] = await Promise.all([
          salidaService.getUsers(),
          salidaService.getOts(),
          salidaService.getRepuestos(),
          salidaService.getRepuestosMaquina(),
        ]);
        setUsuarios(Array.isArray(usrs) ? usrs : []);
        setOts(Array.isArray(ots_) ? ots_ : []);
        setRepuestos(Array.isArray(rep) ? rep : []);
        setRepuestosMaquina(Array.isArray(repMaq) ? repMaq : []);
      } catch (err) {
        setError('Error al cargar datos del servidor');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Obtener lista de productos según tipo
  const getProductosList = (tipoProducto) => {
    return tipoProducto === 'repuesto' ? repuestos : repuestosMaquina;
  };

  // Obtener producto por ID
  const getProductoById = (tipoProducto, id) => {
    const list = getProductosList(tipoProducto);
    return list.find((p) => p.id === Number(id));
  };

  const handleChangeProducto = (index, field, value) => {
    const newProductos = [...productos];

    if (field === 'tipoProducto') {
      // Limpiar datos cuando cambia el tipo
      newProductos[index].tipoProducto = value;
      newProductos[index].productoId = '';
      newProductos[index].codigo = '';
      newProductos[index].nombre = '';
      newProductos[index].unidadMedida = '';
    } else if (field === 'productoId') {
      newProductos[index].productoId = value;
      const producto = getProductoById(newProductos[index].tipoProducto, value);
      if (producto) {
        newProductos[index] = {
          ...newProductos[index],
          codigo: `P${producto.id}`,
          nombre: producto.nombre,
          unidadMedida: producto.cantidad ? 'unid' : 'unid',
          precioUnitario: producto.costoUnitario || 0,
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
      {
        tipoProducto: 'repuesto',
        productoId: '',
        codigo: '',
        nombre: '',
        unidadMedida: '',
        cantidad: 0,
        precioUnitario: 0,
        porcentajeDescuento: 0,
      },
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
      const importe = p.cantidad * p.precioUnitario;
      const descBs = (importe * p.porcentajeDescuento) / 100;
      subtotal += importe;
      descuento += descBs;
    });
    return { subtotal, descuento, total: subtotal - descuento };
  };

  const { subtotal, descuento, total } = calcularTotales();

  // Guardar salida
  const handleGuardarSalida = async () => {
    if (!nroSalida || !usuarioId || !otId || !fecha || productos.length === 0) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      const detalles = productos.map((p) => ({
        tipoProducto: p.tipoProducto,
        productoId: Number(p.productoId) || null,
        codigo: p.codigo,
        nombre: p.nombre,
        unidadMedida: p.unidadMedida,
        cantidad: Number(p.cantidad),
        precioUnitario: Number(p.precioUnitario),
        porcentajeDescuento: Number(p.porcentajeDescuento) || 0,
      }));

      const salidaData = {
        nroSalida,
        usuarioId: Number(usuarioId),
        otId: Number(otId),
        fecha: new Date(fecha).toISOString(),
        observacion: observacion || null,
        almacen: almacen || null,
        estado,
        detalles,
      };

      const result = await salidaService.createSalida(salidaData);
      alert(`Salida registrada exitosamente! ID: ${result.id}`);

      // Limpiar formulario
      setNroSalida('');
      setUsuarioId('');
      setOtId('');
      setFecha('');
      setObservacion('');
      setAlmacen('');
      setEstado('pendiente');
      setProductos([
        {
          tipoProducto: 'repuesto',
          productoId: '',
          codigo: '',
          nombre: '',
          unidadMedida: '',
          cantidad: 0,
          precioUnitario: 0,
          porcentajeDescuento: 0,
        },
      ]);
      setError('');
    } catch (err) {
      setError(`Error al guardar: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: 1100,
        margin: '0 auto',
        color: textColor,
        minHeight: '100vh',
      }}
    >
      <h2
        style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}
      >
        Registro de Salida de Inventario
      </h2>

      {/* Debug info */}
      {!loading && (
        <div
          style={{
            padding: '0.8rem',
            background: theme === 'dark' ? '#1e3a5f' : '#e3f2fd',
            borderLeft: `4px solid ${successColor}`,
            marginBottom: '1rem',
            fontSize: '0.9rem',
            borderRadius: 4,
            color: textColor,
          }}
        >
          ✓ Usuarios: <strong>{usuarios.length}</strong> | ✓ OTs:{' '}
          <strong>{ots.length}</strong> | ✓ Repuestos:{' '}
          <strong>{repuestos.length}</strong> | ✓ Repuestos-Máquina:{' '}
          <strong>{repuestosMaquina.length}</strong>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '1rem',
            background: theme === 'dark' ? '#5f1f1f' : '#ffebee',
            color: errorColor,
            borderRadius: 6,
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Datos de la salida */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <input
          style={{
            padding: '0.5rem',
            border: `1px solid ${inputBorderColor}`,
            borderRadius: 6,
            width: '100%',
            backgroundColor: inputBgColor,
            color: textColor,
          }}
          placeholder="Nro. Salida"
          value={nroSalida}
          onChange={(e) => setNroSalida(e.target.value)}
        />
        <select
          style={{
            padding: '0.5rem',
            border: `1px solid ${inputBorderColor}`,
            borderRadius: 6,
            width: '100%',
            backgroundColor: inputBgColor,
            color: textColor,
          }}
          value={usuarioId}
          onChange={(e) => setUsuarioId(e.target.value)}
        >
          <option value="">Seleccione Usuario</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre || `Usuario ${u.id}`}
            </option>
          ))}
        </select>
        <select
          style={{
            padding: '0.5rem',
            border: `1px solid ${inputBorderColor}`,
            borderRadius: 6,
            width: '100%',
            backgroundColor: inputBgColor,
            color: textColor,
          }}
          value={otId}
          onChange={(e) => setOtId(e.target.value)}
        >
          <option value="">Seleccione OT</option>
          {ots.map((o) => (
            <option key={o.id} value={o.id}>
              {o.numeroOt || `OT ${o.id}`}
            </option>
          ))}
        </select>
        <input
          style={{
            padding: '0.5rem',
            border: `1px solid ${inputBorderColor}`,
            borderRadius: 6,
            width: '100%',
            backgroundColor: inputBgColor,
            color: textColor,
          }}
          placeholder="Almacén"
          value={almacen}
          onChange={(e) => setAlmacen(e.target.value)}
        />
        <input
          style={{
            padding: '0.5rem',
            border: `1px solid ${inputBorderColor}`,
            borderRadius: 6,
            width: '100%',
            backgroundColor: inputBgColor,
            color: textColor,
          }}
          placeholder="Fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        <select
          style={{
            padding: '0.5rem',
            border: `1px solid ${inputBorderColor}`,
            borderRadius: 6,
            width: '100%',
            backgroundColor: inputBgColor,
            color: textColor,
          }}
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="pendiente">Pendiente</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <textarea
          style={{
            padding: '0.5rem',
            border: `1px solid ${inputBorderColor}`,
            borderRadius: 6,
            width: '100%',
            backgroundColor: inputBgColor,
            color: textColor,
            gridColumn: '1 / -1',
            minHeight: '60px',
          }}
          placeholder="Observación"
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
        />
      </div>

      {/* Tabla de productos */}
      <h3 style={{ marginBottom: '1rem', color: textColor }}>
        Productos Saliendo
      </h3>
      <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.85rem',
            backgroundColor: tbodyBgColor,
          }}
        >
          <thead>
            <tr
              style={{ backgroundColor: theadBgColor, color: theadTextColor }}
            >
              <th style={{ padding: '0.5rem' }}>TIPO</th>
              <th style={{ padding: '0.5rem' }}>ID PRODUCTO</th>
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
          <tbody style={{ color: textColor }}>
            {productos.map((p, i) => {
              const importe = p.cantidad * p.precioUnitario;
              const descBs = (importe * p.porcentajeDescuento) / 100;
              const subtotal = importe - descBs;
              const productosList = getProductosList(p.tipoProducto);
              const rowBgColor =
                i % 2 === 0
                  ? tbodyBgColor
                  : theme === 'dark'
                    ? '#1a1a1a'
                    : '#FAFAFA';
              return (
                <tr
                  key={i}
                  style={{
                    backgroundColor: rowBgColor,
                    borderBottom: `1px solid ${inputBorderColor}`,
                  }}
                >
                  <td style={{ padding: '0.5rem' }}>
                    <select
                      style={{
                        padding: '0.5rem',
                        border: `1px solid ${inputBorderColor}`,
                        borderRadius: 6,
                        width: '100%',
                        backgroundColor: inputBgColor,
                        color: textColor,
                      }}
                      value={p.tipoProducto}
                      onChange={(e) =>
                        handleChangeProducto(i, 'tipoProducto', e.target.value)
                      }
                    >
                      <option value="repuesto">Repuesto</option>
                      <option value="repuesto-maquina">Repuesto Máquina</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <select
                      style={{
                        padding: '0.5rem',
                        border: `1px solid ${inputBorderColor}`,
                        borderRadius: 6,
                        width: '100%',
                        backgroundColor: inputBgColor,
                        color: textColor,
                      }}
                      value={p.productoId}
                      onChange={(e) =>
                        handleChangeProducto(i, 'productoId', e.target.value)
                      }
                    >
                      <option value="">Seleccionar ID</option>
                      {productosList.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.id}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input
                      style={{
                        padding: '0.5rem',
                        border: `1px solid ${inputBorderColor}`,
                        borderRadius: 6,
                        width: '100%',
                        backgroundColor: inputBgColor,
                        color: textColor,
                      }}
                      value={p.codigo}
                      readOnly
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input
                      style={{
                        padding: '0.5rem',
                        border: `1px solid ${inputBorderColor}`,
                        borderRadius: 6,
                        width: '100%',
                        backgroundColor: inputBgColor,
                        color: textColor,
                      }}
                      value={p.nombre}
                      readOnly
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input
                      style={{
                        padding: '0.5rem',
                        border: `1px solid ${inputBorderColor}`,
                        borderRadius: 6,
                        width: '100%',
                        backgroundColor: inputBgColor,
                        color: textColor,
                      }}
                      value={p.unidadMedida}
                      readOnly
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input
                      type="number"
                      style={{
                        padding: '0.5rem',
                        border: `1px solid ${inputBorderColor}`,
                        borderRadius: 6,
                        width: '100%',
                        backgroundColor: inputBgColor,
                        color: textColor,
                      }}
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
                      step="0.01"
                      style={{
                        padding: '0.5rem',
                        border: `1px solid ${inputBorderColor}`,
                        borderRadius: 6,
                        width: '100%',
                        backgroundColor: inputBgColor,
                        color: textColor,
                      }}
                      value={p.precioUnitario}
                      onChange={(e) =>
                        handleChangeProducto(
                          i,
                          'precioUnitario',
                          Number(e.target.value),
                        )
                      }
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>{importe.toFixed(2)}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <input
                      type="number"
                      style={{
                        padding: '0.5rem',
                        border: `1px solid ${inputBorderColor}`,
                        borderRadius: 6,
                        width: '100%',
                        backgroundColor: inputBgColor,
                        color: textColor,
                      }}
                      value={p.porcentajeDescuento}
                      onChange={(e) =>
                        handleChangeProducto(
                          i,
                          'porcentajeDescuento',
                          Number(e.target.value),
                        )
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
                          background: errorColor,
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '0.3rem 0.6rem',
                          cursor: 'pointer',
                        }}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={addProducto}
          style={{
            background: addButtonBg,
            color: colors.darkText,
            border: 'none',
            borderRadius: 6,
            padding: '0.7rem 1.2rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = addButtonHover;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = addButtonBg;
          }}
        >
          <FaPlus /> Agregar Producto
        </button>

        <button
          onClick={handleGuardarSalida}
          disabled={loading}
          style={{
            background: loading ? '#999' : buttonBgColor,
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '0.7rem 1.2rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.currentTarget.style.background = buttonHoverColor;
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.currentTarget.style.background = buttonBgColor;
            }
          }}
        >
          <FaSave /> {loading ? 'Guardando...' : 'Guardar Salida'}
        </button>
      </div>

      {/* Totales */}
      <div
        style={{
          textAlign: 'right',
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: theme === 'dark' ? '#2A2A2A' : bgColor,
          borderRadius: 6,
          border: `1px solid ${inputBorderColor}`,
        }}
      >
        <p style={{ color: textColor }}>
          <b>SUBTOTAL:</b> {subtotal.toFixed(2)} Bs.
        </p>
        <p style={{ color: colors.gold }}>
          <b>DESCUENTO:</b> {descuento.toFixed(2)} Bs.
        </p>
        <p
          style={{ fontSize: '1.3rem', fontWeight: 'bold', color: colors.gold }}
        >
          TOTAL NETO: {total.toFixed(2)} Bs.
        </p>
      </div>
    </div>
  );
}
