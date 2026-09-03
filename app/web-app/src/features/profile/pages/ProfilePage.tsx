import {
  FaUserCircle,
  FaSave,
  FaCheckCircle,
  FaExclamationCircle,
} from 'react-icons/fa';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useProfile } from '../hooks/useProfile';

const CARGO_LABELS: Record<string, string> = {
  externo: 'Externo',
  admin: 'Administrador',
  supervisor: 'Supervisor',
  tecnico: 'Técnico',
  'jefe-mantenimiento': 'Jefe de Mantenimiento',
  'encargado-almacen': 'Encargado de Almacén',
  'usuario-contable': 'Usuario Contable',
};

const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

export default function ProfilePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const {
    profile,
    formData,
    newPassword,
    confirmPassword,
    setNewPassword,
    setConfirmPassword,
    loading,
    saving,
    error,
    success,
    handleChange,
    handleSave,
  } = useProfile();

  const pageBg = isDark ? colors.darkBg : colors.lightBg;
  const cardBg = isDark ? '#242424' : '#FFFFFF';
  const textColor = isDark ? colors.lightText : colors.darkText;
  const secondaryTextColor = isDark ? colors.beige : colors.brown;
  const inputBg = isDark ? '#2A2A2A' : '#F5F5F5';
  const inputBorder = isDark ? '#3A3A3A' : '#D6D6D6';
  const borderColor = isDark ? '#3A3A3A' : '#D6D6D6';
  const iconColor = isDark ? colors.beige : colors.brown;

  const renderField = (
    label: string,
    name: keyof typeof formData,
    type: string = 'text',
  ) => (
    <div>
      <label
        htmlFor={name}
        style={{ color: secondaryTextColor }}
        className="block text-sm font-medium mb-1"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={formData[name] ?? ''}
        onChange={handleChange}
        style={{
          backgroundColor: inputBg,
          borderColor: inputBorder,
          color: textColor,
        }}
        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-1"
      />
    </div>
  );

  if (loading) {
    return (
      <div
        style={{ backgroundColor: pageBg, color: textColor }}
        className="min-h-full flex items-center justify-center p-6"
      >
        Cargando perfil...
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        style={{ backgroundColor: pageBg, color: textColor }}
        className="min-h-full flex items-center justify-center p-6"
      >
        No se pudo cargar tu perfil.
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: pageBg, minHeight: '100%' }}
      className="p-4 md:p-8"
    >
      <div className="max-w-2xl mx-auto">
        {/* Encabezado */}
        <div className="flex items-center gap-4 mb-6">
          <FaUserCircle
            className="w-16 h-16 shrink-0"
            style={{ color: iconColor }}
          />
          <div className="min-w-0">
            <h1
              style={{ color: textColor }}
              className="text-2xl font-semibold truncate"
            >
              {profile.name} {profile.lastName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span
                style={{
                  backgroundColor: isDark
                    ? `${colors.gold}30`
                    : `${colors.gold}30`,
                  color: isDark ? colors.gold : colors.brown,
                }}
                className="px-2 py-0.5 rounded-full text-xs font-medium"
              >
                {CARGO_LABELS[profile.cargo] || profile.cargo}
              </span>
              <span
                style={{
                  backgroundColor: profile.status
                    ? isDark
                      ? '#2C6E2C'
                      : '#D1E7DD'
                    : isDark
                      ? '#8B3A3A'
                      : '#F8D7DA',
                  color: profile.status
                    ? isDark
                      ? '#AEFFAE'
                      : '#0F5132'
                    : isDark
                      ? '#FFB0B0'
                      : '#842029',
                }}
                className="px-2 py-0.5 rounded-full text-xs font-medium"
              >
                {profile.status ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>

        {(error || success) && (
          <div
            style={{
              backgroundColor: error
                ? isDark
                  ? '#8B3A3A30'
                  : '#F8D7DA'
                : isDark
                  ? '#2C6E2C30'
                  : '#D1E7DD',
              color: error
                ? isDark
                  ? '#FFB0B0'
                  : '#842029'
                : isDark
                  ? '#AEFFAE'
                  : '#0F5132',
            }}
            className="mb-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
          >
            {error ? <FaExclamationCircle /> : <FaCheckCircle />}
            {error || success}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-6"
        >
          {/* Datos personales */}
          <div
            style={{ backgroundColor: cardBg, borderColor }}
            className="rounded-lg border p-4 md:p-6 space-y-4"
          >
            <h2
              style={{ color: textColor }}
              className="text-lg font-semibold mb-2"
            >
              Datos personales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Nombre', 'name')}
              {renderField('Apellido', 'lastName')}
              {renderField('Email', 'email', 'email')}
              {renderField('Nombre de usuario', 'userName')}
              {renderField('Teléfono', 'phone')}
              {renderField('Celular', 'celphone')}
            </div>
          </div>

          {/* Cambiar contraseña */}
          <div
            style={{ backgroundColor: cardBg, borderColor }}
            className="rounded-lg border p-4 md:p-6 space-y-4"
          >
            <h2
              style={{ color: textColor }}
              className="text-lg font-semibold mb-2"
            >
              Cambiar contraseña
            </h2>
            <p style={{ color: secondaryTextColor }} className="text-sm mb-2">
              Dejá estos campos vacíos si no querés cambiar tu contraseña.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="newPassword"
                  style={{ color: secondaryTextColor }}
                  className="block text-sm font-medium mb-1"
                >
                  Nueva contraseña
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                    color: textColor,
                  }}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-1"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  style={{ color: secondaryTextColor }}
                  className="block text-sm font-medium mb-1"
                >
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                    color: textColor,
                  }}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-1"
                />
              </div>
            </div>
          </div>

          {/* Info de solo lectura */}
          <div
            style={{ backgroundColor: cardBg, borderColor }}
            className="rounded-lg border p-4 md:p-6"
          >
            <h2
              style={{ color: textColor }}
              className="text-lg font-semibold mb-3"
            >
              Información de la cuenta
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <p>
                <strong style={{ color: secondaryTextColor }}>Cargo:</strong>{' '}
                <span style={{ color: textColor }}>
                  {CARGO_LABELS[profile.cargo] || profile.cargo}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Estado:</strong>{' '}
                <span style={{ color: textColor }}>
                  {profile.status ? 'Activo' : 'Inactivo'}
                </span>
              </p>
            </div>
            <p style={{ color: secondaryTextColor }} className="text-xs mt-3">
              El cargo y el estado de tu cuenta solo pueden ser modificados por
              un administrador.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              style={{
                backgroundColor: colors.gold,
                color: colors.darkText,
                opacity: saving ? 0.6 : 1,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-medium transition"
            >
              <FaSave /> {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
