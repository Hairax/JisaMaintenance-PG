import React, { useState } from 'react';
import { FaKey } from 'react-icons/fa';

interface ChangePasswordFormProps {
  theme: string;
  userName: string;
  // Devuelve un mensaje de error, o null si se guardó bien.
  onSubmit: (password: string) => Promise<string | null>;
}

// Cambio de contraseña de otro usuario (solo lo ve el administrador; el
// backend también lo exige). Arranca colapsado como un botón.
export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  theme,
  userName,
  onSubmit,
}) => {
  const [abierto, setAbierto] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const isDark = theme === 'dark';
  const inputStyle: React.CSSProperties = {
    backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
    borderColor: isDark ? '#3A3A3A' : '#D6D6D6',
    color: isDark ? '#FFFFFF' : '#000000',
  };
  const labelColor = isDark ? '#E1CD9B' : '#9E5533';

  const cerrar = () => {
    setAbierto(false);
    setPassword('');
    setConfirmacion('');
    setError(null);
  };

  const guardar = async () => {
    setExito(false);
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setGuardando(true);
    const err = await onSubmit(password);
    setGuardando(false);
    if (err) {
      setError(err);
      return;
    }
    cerrar();
    setExito(true);
  };

  if (!abierto) {
    return (
      <div className="mt-4">
        <button
          type="button"
          onClick={() => {
            setAbierto(true);
            setExito(false);
          }}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded border transition hover:opacity-80"
          style={{ borderColor: labelColor, color: labelColor }}
        >
          <FaKey /> Cambiar contraseña
        </button>
        {exito && (
          <p
            className="text-sm mt-2"
            style={{ color: isDark ? '#4ADE80' : '#166534' }}
          >
            Contraseña actualizada.
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      className="mt-4 p-3 rounded border space-y-2"
      style={{ borderColor: isDark ? '#3A3A3A' : '#D6D6D6' }}
      onSubmit={(e) => {
        e.preventDefault();
        guardar();
      }}
    >
      <p className="text-sm font-semibold" style={{ color: labelColor }}>
        Nueva contraseña para {userName}
      </p>
      <input
        type="password"
        placeholder="Nueva contraseña (mín. 8 caracteres)"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-1 text-sm"
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="Repetir contraseña"
        autoComplete="new-password"
        value={confirmacion}
        onChange={(e) => setConfirmacion(e.target.value)}
        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-1 text-sm"
        style={inputStyle}
      />
      {error && (
        <p
          className="text-sm"
          style={{ color: isDark ? '#FF7070' : '#D32F2F' }}
        >
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={cerrar}
          className="px-3 py-1.5 rounded text-sm"
          style={{ color: isDark ? '#FFFFFF' : '#000000' }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={guardando}
          className="px-3 py-1.5 rounded text-sm font-medium"
          style={{
            backgroundColor: '#FBAF11',
            color: '#000000',
            opacity: guardando ? 0.6 : 1,
          }}
        >
          {guardando ? 'Guardando...' : 'Guardar contraseña'}
        </button>
      </div>
    </form>
  );
};
