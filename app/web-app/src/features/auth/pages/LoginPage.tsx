import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { LocationState } from '../../../shared/types/navigation';
import { FaSun, FaMoon, FaEye, FaEyeSlash } from 'react-icons/fa';
import Logo from '../../../assets/logoJacha.png';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: email,
          password,
        }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || 'Credenciales incorrectas');
      }

      const data = await response.json();

      // Guardar el token y redirigir
      login(data.access_token, data.user);

      const from = (location.state as LocationState)?.from?.pathname || '/home';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido');
      }
    }
  };

  // Colores de la paleta
  const colors = {
    brown: '#9E5533',
    beige: '#E1CD9B',
    gold: '#FBAF11',
    darkBg: '#1A1A1A',
    lightBg: '#E6E6E6',
    darkText: '#000000',
    lightText: '#FFFFFF',
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300`}
      style={{
        backgroundColor: theme === 'dark' ? colors.darkBg : colors.lightBg,
      }}
    >
      <div
        className="relative w-full max-w-sm md:max-w-md rounded-3xl p-8 shadow-xl"
        style={{ backgroundColor: colors.beige }}
      >
        <div className="flex flex-col items-center">
          <h2
            className="text-2xl font-semibold mb-4"
            style={{ color: colors.brown }}
          >
            Login
          </h2>
          <div
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 border-2"
            style={{ borderColor: colors.gold }}
          >
            <img
              src={Logo}
              alt="Jisa Logo"
              className="w-16 h-16 object-contain rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/64x64?text=JISA';
              }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Usuario"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-xl focus:outline-none"
            style={{
              color: colors.darkText,
              boxShadow: `0 0 0 2px ${colors.gold}90`,
            }}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl focus:outline-none pr-12"
              style={{
                color: colors.darkText,
                boxShadow: `0 0 0 2px ${colors.gold}90`,
              }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              style={{ color: colors.brown }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {error && (
            <p className="text-red-600 text-sm text-center bg-red-100 py-2 rounded-lg">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full py-3 text-white rounded-xl transition hover:opacity-90"
            style={{ backgroundColor: colors.brown }}
          >
            Log in
          </button>
        </form>

        {/* Toggle Theme */}
        <button
          onClick={toggleTheme}
          className="absolute -bottom-15 right-4 p-3 rounded-full shadow-md"
          style={{ backgroundColor: colors.gold }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <FaSun style={{ color: colors.lightText }} />
          ) : (
            <FaMoon style={{ color: colors.darkText }} />
          )}
        </button>
      </div>
    </div>
  );
};
