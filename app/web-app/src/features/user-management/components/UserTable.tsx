import React from 'react';
import { User } from '../../../shared/types/user.types';
import { FaPlus } from 'react-icons/fa';

// Paleta de colores
const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

interface UserTableProps {
  users: User[];
  theme: string;
  onAddUser: () => void;
  onViewUser: (user: User) => void;
  loading: boolean;
  error: string | null;
  canCreate?: boolean;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  theme,
  onAddUser,
  onViewUser,
  loading,
  error,
  canCreate = true,
}) => {
  // Colores basados en el tema
  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const secondaryTextColor = theme === 'dark' ? colors.beige : colors.brown;
  const bgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const hoverBgColor = theme === 'dark' ? '#2A2A2A' : '#D6D6D6';
  const theadBgColor = theme === 'dark' ? colors.brown : colors.beige;
  const theadTextColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const tbodyBgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const buttonBgColor = colors.gold;
  const buttonHoverColor = '#E69D00'; // Versión ligeramente oscurecida del gold

  const getDisplayName = (name: string = '') => name.split(' ')[0];
  const getDisplayLastName = (lastName: string = '') => lastName.split(' ')[0];

  if (loading && users.length === 0) {
    return (
      <div style={{ color: secondaryTextColor }} className="text-center mt-10">
        Cargando...
      </div>
    );
  }

  if (error && users.length === 0) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h1 style={{ color: textColor }} className="text-2xl font-bold">
          Gestión de Usuarios
        </h1>
        {canCreate && (
          <button
            onClick={onAddUser}
            style={{
              backgroundColor: buttonBgColor,
              color: colors.darkText,
            }}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg shadow transition duration-150 ease-in-out"
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = buttonHoverColor;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = buttonBgColor;
            }}
          >
            <FaPlus /> Nuevo Usuario
          </button>
        )}
      </div>

      {error && !loading && (
        <div className="mb-4 text-center text-red-500">{error}</div>
      )}

      <div
        style={{ backgroundColor: bgColor }}
        className="shadow-md rounded-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm md:text-base">
            <thead
              style={{
                backgroundColor: theadBgColor,
                color: theadTextColor,
              }}
            >
              <tr>
                <th className="p-3 text-left font-semibold">ID</th>
                <th className="p-3 text-left font-semibold">Nombre</th>
                <th className="p-3 text-left font-semibold">Cargo</th>
                <th className="p-3 text-left font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody
              style={{
                backgroundColor: tbodyBgColor,
                color: textColor,
                borderColor: theme === 'dark' ? '#2A2A2A' : '#D6D6D6',
              }}
              className="divide-y"
            >
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => onViewUser(user)}
                  style={{
                    backgroundColor: !user.status
                      ? theme === 'dark'
                        ? 'rgba(158, 85, 51, 0.2)' // brown con transparencia
                        : 'rgba(225, 205, 155, 0.5)' // beige con transparencia
                      : undefined,
                    opacity: !user.status ? 0.7 : 1,
                  }}
                  className="cursor-pointer transition duration-150 ease-in-out"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = hoverBgColor;
                  }}
                  onMouseOut={(e) => {
                    if (!user.status) {
                      e.currentTarget.style.backgroundColor =
                        theme === 'dark'
                          ? 'rgba(158, 85, 51, 0.2)'
                          : 'rgba(225, 205, 155, 0.5)';
                    } else {
                      e.currentTarget.style.backgroundColor = '';
                    }
                  }}
                >
                  <td className="p-3 whitespace-nowrap">{user.id}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="hidden sm:inline">
                      {user.name} {user.lastName}
                    </span>
                    <span className="inline sm:hidden">
                      {getDisplayName(user.name)}{' '}
                      {getDisplayLastName(user.lastName)}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">{user.cargo}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      style={{
                        backgroundColor: user.status
                          ? theme === 'dark'
                            ? '#2C6E2C' // verde oscuro
                            : '#D1E7DD' // verde claro
                          : theme === 'dark'
                            ? '#8B3A3A' // rojo oscuro
                            : '#F8D7DA', // rojo claro
                        color: user.status
                          ? theme === 'dark'
                            ? '#AEFFAE' // texto verde claro
                            : '#0F5132' // texto verde oscuro
                          : theme === 'dark'
                            ? '#FFB0B0' // texto rojo claro
                            : '#842029', // texto rojo oscuro
                      }}
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                    >
                      {user.status ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={4}
                    style={{ color: secondaryTextColor }}
                    className="p-4 text-center"
                  >
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
