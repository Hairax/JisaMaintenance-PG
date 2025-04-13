import { useCallback } from 'react';

const API_BASE_URL = 'http://localhost:3000'; // O la URL donde corre tu API NestJS

export const fetchUsers = useCallback(async () => {
  setLoading(true);
  setError(null); // Resetea error al recargar
  try {
    // Asegúrate que el endpoint '/users' existe en tu controller NestJS con @Get()
    const res = await fetch(`${API_BASE_URL}/users`); // Asumiendo endpoint REST
    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ message: 'Error desconocido en la respuesta' }));
      throw new Error(errorData.message || `Error ${res.status}`);
    }
    const data = await res.json();
    // Filtrar usuarios activos si decides implementar soft delete y quieres mostrar solo activos
    // setUsers(data.filter((user: User) => user.status));
    setUsers(data); // Mostrar todos por ahora
  } catch (err) {
    console.error('Fetch error:', err);
    setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    setUsers([]); // Limpia usuarios en caso de error
  } finally {
    setLoading(false);
  }
}, []);
