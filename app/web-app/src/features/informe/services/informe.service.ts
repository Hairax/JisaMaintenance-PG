import { API_URL } from '../../../shared/config/api';

const API_BASE_URL = API_URL;

export const informeService = {
  async getInformes() {
    try {
      const response = await fetch(`${API_BASE_URL}/informes`);
      if (!response.ok) throw new Error('Error al cargar informes');
      const data = await response.json();
      console.log('✅ Informes cargados:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Error al cargar informes:', error);
      throw error;
    }
  },

  async getInforme(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/informes/${id}`);
      if (!response.ok) throw new Error('Error al cargar informe');
      const data = await response.json();
      console.log('✅ Informe cargado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al cargar informe:', error);
      throw error;
    }
  },

  async createInforme(informeData: Record<string, unknown>) {
    try {
      const response = await fetch(`${API_BASE_URL}/informes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(informeData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear informe');
      }
      const data = await response.json();
      console.log('✅ Informe creado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al crear informe:', error);
      throw error;
    }
  },

  async updateInforme(id: number, informeData: Record<string, unknown>) {
    try {
      const response = await fetch(`${API_BASE_URL}/informes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(informeData),
      });
      if (!response.ok) throw new Error('Error al actualizar informe');
      const data = await response.json();
      console.log('✅ Informe actualizado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al actualizar informe:', error);
      throw error;
    }
  },

  async deleteInforme(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/informes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar informe');
      console.log('✅ Informe eliminado');
      return { message: 'Informe deleted' };
    } catch (error) {
      console.error('❌ Error al eliminar informe:', error);
      throw error;
    }
  },
};
