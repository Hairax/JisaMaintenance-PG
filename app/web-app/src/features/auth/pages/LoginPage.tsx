import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { useTheme } from '../../../core/context/ThemeContext';
import { LocationState } from '../../../shared/types/navigation';
import { FaSun, FaMoon } from 'react-icons/fa';

const MOCK_ADMIN = {
  email: 'admin@jisa.com',
  password: 'admin123',
};

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
      login('mock-token');
      const from = (location.state as LocationState)?.from?.pathname || '/home';
      navigate(from, { replace: true });
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${isDarkMode ? 'bg-black' : 'bg-white'} transition-colors duration-300`}
    >
      <div className="relative w-full max-w-sm md:max-w-md bg-[#E1CD9B] rounded-3xl p-8 shadow-xl">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-[#9E5533] mb-4">Login</h2>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6">
            <img
              src="/logo.png"
              alt="Jisa Logo"
              className="w-16 h-16 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/64x64?text=JISA';
              }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9E5533]/50"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9E5533]/50"
            required
          />
          {error && (
            <p className="text-red-600 text-sm text-center bg-red-100 py-2 rounded-lg">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-[#9E5533] text-white rounded-xl hover:bg-[#9E5533]/90 transition"
          >
            Log in
          </button>
        </form>

        {/* Toggle Theme */}
        <button
          onClick={toggleTheme}
          className="absolute -bottom-15 right-4 p-3 rounded-full bg-[#E1CD9B] hover:bg-[#E1CD9B]/90 shadow-md"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <FaSun className="text-[#9E5533]" />
          ) : (
            <FaMoon className="text-[#9E5533]" />
          )}
        </button>
      </div>
    </div>
  );
};
