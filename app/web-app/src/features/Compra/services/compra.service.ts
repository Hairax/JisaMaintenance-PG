import { API_URL } from '../../../shared/config/api';

const API_BASE_URL = API_URL;

export const compraService = {
  // Obtener todos los repuestos
  async getRepuestos() {
    try {
      console.log(
        '📦 Obteniendo repuestos desde:',
        `${API_BASE_URL}/repuestos`,
      );
      const response = await fetch(`${API_BASE_URL}/repuestos`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log('✅ Repuestos obtenidos:', data);
      // Asegurar que es un array
      return Array.isArray(data) ? data : data.data || data.repuestos || [];
    } catch (error) {
      console.error('❌ Error al obtener repuestos:', error);
      return [];
    }
  },

  // Obtener todos los proveedores
  async getProveedores() {
    try {
      console.log(
        '🏢 Obteniendo proveedores desde:',
        `${API_BASE_URL}/proveedores`,
      );
      const response = await fetch(`${API_BASE_URL}/proveedores`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log('✅ Proveedores obtenidos:', data);
      // Asegurar que es un array
      return Array.isArray(data) ? data : data.data || data.proveedores || [];
    } catch (error) {
      console.error('❌ Error al obtener proveedores:', error);
      return [];
    }
  },

  // Obtener compra por ID
  async getCompraById(id: number) {
    const response = await fetch(`${API_BASE_URL}/compras/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // Actualizar compra
  async updateCompra(id: number, data: unknown) {
    const response = await fetch(`${API_BASE_URL}/compras/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // Crear compra
  async createCompra(data: unknown) {
    try {
      console.log('💾 Guardando compra...', data);
      const response = await fetch(`${API_BASE_URL}/compras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      console.log('✅ Compra guardada:', result);
      return result;
    } catch (error) {
      console.error('❌ Error al guardar compra:', error);
      throw error;
    }
  },
};
