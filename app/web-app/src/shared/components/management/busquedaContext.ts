import { createContext, useContext } from 'react';

export const BusquedaContext = createContext('');

/** Texto de búsqueda activo (lo usa ManagementTable para su mensaje vacío). */
export const useBusquedaActiva = () => useContext(BusquedaContext);
