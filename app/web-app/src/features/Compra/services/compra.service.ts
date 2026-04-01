const API_BASE_URL = 'http://localhost:3000';

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

  // Obtener todos los repuestos-maquina
  async getRepuestosMaquina() {
    try {
      console.log(
        '🔧 Obteniendo repuestos-máquina desde:',
        `${API_BASE_URL}/repuesto-maquina`,
      );
      const response = await fetch(`${API_BASE_URL}/repuesto-maquina`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log('✅ Repuestos-máquina obtenidos:', data);
      // Asegurar que es un array
      return Array.isArray(data) ? data : data.data || data.repuestos || [];
    } catch (error) {
      console.error('❌ Error al obtener repuestos-máquina:', error);
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

  // Crear compra
  async createCompra(data) {
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
