import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user.types'; // Asegúrate que la ruta sea correcta

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  // Opcional: Añadir un estado de carga si la lógica se vuelve más compleja
  // isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Función auxiliar para obtener el usuario inicial de forma segura
const getInitialUser = (): User | null => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    return null;
  }
  try {
    // Intenta parsear el usuario almacenado
    return JSON.parse(storedUser) as User;
  } catch (error) {
    console.error('Error parsing stored user on initial load:', error);
    // Si hay un error (ej. JSON malformado), limpia el almacenamiento relacionado
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Podrías querer limpiar el token también si el usuario está corrupto
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Inicializa ambos estados directamente desde localStorage
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token'),
  );
  const [user, setUser] = useState<User | null>(getInitialUser); // <--- CAMBIO AQUÍ

  // Este useEffect ahora es menos crítico para la carga inicial,
  // pero puede ser útil si el token o usuario pudieran cambiar por
  // otros medios o para verificar consistencia.
  // Si su *único* propósito era cargar el usuario al inicio,
  // podrías incluso eliminarlo o simplificarlo después del cambio anterior.
  // Lo dejaré por si maneja otros casos, pero la clave es la inicialización síncrona.
  useEffect(() => {
    // Podrías añadir lógica aquí para verificar si el token sigue siendo válido
    // llamando a una API, por ejemplo, pero la carga inicial ya está hecha.
    // Asegúrate de que el token y el usuario estén sincronizados.
    const currentToken = localStorage.getItem('token');
    const currentUserJson = localStorage.getItem('user');

    if (!currentToken || !currentUserJson) {
      // Si falta alguno en localStorage, asegúrate de que el estado esté limpio
      if (token || user) {
        // Solo llama a logout si el estado actual no está ya limpio
        logout();
      }
    } else {
      // Opcional: verificar si el usuario en estado coincide con localStorage
      // por si acaso algo externo lo modificó.
      try {
        const storedUser = JSON.parse(currentUserJson);
        if (
          token !== currentToken ||
          JSON.stringify(user) !== JSON.stringify(storedUser)
        ) {
          setToken(currentToken);
          setUser(storedUser);
        }
      } catch {
        // Si el JSON en localStorage se corrompió después de la carga inicial
        logout();
      }
    }
    // Depender de token y user podría causar ciclos si no se maneja con cuidado.
    // Considera si realmente necesitas este useEffect o si la lógica síncrona es suficiente.
    // Si lo dejas, asegúrate de que la lógica interna evite actualizaciones innecesarias.
    // Una dependencia vacía `[]` haría que solo se ejecute al montar,
    // lo cual podría ser más seguro si solo quieres una verificación inicial post-carga.
  }, [token, user]); // O usa [] si es solo verificación al montar.

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData)); // Guarda antes de actualizar estado
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Limpia antes de actualizar estado
    setToken(null);
    setUser(null);
  };

  // Actualiza el usuario en sesión (ej. tras editar el propio perfil) sin
  // pasar por login/logout.
  const updateUser = (updatedUser: User) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // isAuthenticated ahora debería ser correcto desde la primera renderización
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
