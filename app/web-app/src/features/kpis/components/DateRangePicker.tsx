// src/components/DateRangePicker.tsx
import { useTheme } from '../../../shared/contexts/ThemeContext';

type Props = {
  from: string; // "YYYY-MM-DD"
  to: string; // "YYYY-MM-DD"
  onChange: (from: string, to: string) => void;
};

export default function DateRangePicker({ from, to, onChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: isDark ? '#AAAAAA' : '#555555',
    marginBottom: 6,
  };
  const inputStyle: React.CSSProperties = {
    padding: '8px 10px',
    borderRadius: 8,
    border: `1px solid ${isDark ? '#3A3A3A' : '#ddd'}`,
    minWidth: 130,
    background: isDark ? '#2A2A2A' : '#fff',
    color: isDark ? '#F5F5F5' : '#1A1A1A',
    colorScheme: isDark ? 'dark' : 'light',
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label style={labelStyle}>Desde</label>
        <input
          type="date"
          value={from}
          onChange={(e) => onChange(e.target.value, to)}
          style={inputStyle}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label style={labelStyle}>Hasta</label>
        <input
          type="date"
          value={to}
          onChange={(e) => onChange(from, e.target.value)}
          style={inputStyle}
        />
      </div>
    </div>
  );
}
