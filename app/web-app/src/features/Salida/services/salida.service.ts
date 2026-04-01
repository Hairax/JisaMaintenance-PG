const API_BASE_URL = 'http://localhost:3000';

export const salidaService = {
  async getSalidas() {
    try {
      const response = await fetch(`${API_BASE_URL}/salidas`);
      if (!response.ok) throw new Error('Error al cargar salidas');
      const data = await response.json();
      console.log('✅ Salidas cargadas:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Error al cargar salidas:', error);
      throw error;
    }
  },

  async getSalida(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/salidas/${id}`);
      if (!response.ok) throw new Error('Error al cargar salida');
      const data = await response.json();
      console.log('✅ Salida cargada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al cargar salida:', error);
      throw error;
    }
  },

  async createSalida(salidasData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/salidas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salidasData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear salida');
      }
      const data = await response.json();
      console.log('✅ Salida creada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al crear salida:', error);
      throw error;
    }
  },

  async updateSalida(id: number, salidaData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/salidas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salidaData),
      });
      if (!response.ok) throw new Error('Error al actualizar salida');
      const data = await response.json();
      console.log('✅ Salida actualizada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al actualizar salida:', error);
      throw error;
    }
  },

  async deleteSalida(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/salidas/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar salida');
      console.log('✅ Salida eliminada');
      return { message: 'Salida deleted' };
    } catch (error) {
      console.error('❌ Error al eliminar salida:', error);
      throw error;
    }
  },

  // Métodos auxiliares para obtener datos
  async getUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) throw new Error('Error al cargar usuarios');
      const data = await response.json();
      console.log('✅ Usuarios cargados:', data.length);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error);
      return [];
    }
  },

  async getOts() {
    try {
      const response = await fetch(`${API_BASE_URL}/ots`);
      if (!response.ok) throw new Error('Error al cargar OTs');
      const data = await response.json();
      console.log('✅ OTs cargadas:', data.length);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error al cargar OTs:', error);
      return [];
    }
  },

  async getRepuestos() {
    try {
      const response = await fetch(`${API_BASE_URL}/repuestos`);
      if (!response.ok) throw new Error('Error al cargar repuestos');
      const data = await response.json();
      console.log('✅ Repuestos cargados:', data.length);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error al cargar repuestos:', error);
      return [];
    }
  },

  async getRepuestosMaquina() {
    try {
      const response = await fetch(`${API_BASE_URL}/repuesto-maquina`);
      if (!response.ok) throw new Error('Error al cargar repuestos máquina');
      const data = await response.json();
      console.log('✅ Repuestos máquina cargados:', data.length);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error al cargar repuestos máquina:', error);
      return [];
    }
  },
};
