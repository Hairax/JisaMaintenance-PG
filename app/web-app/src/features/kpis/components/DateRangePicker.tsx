// src/components/DateRangePicker.tsx
import React from 'react';

type Props = {
  from: string; // "YYYY-MM-DD"
  to: string; // "YYYY-MM-DD"
  onChange: (from: string, to: string) => void;
};

export default function DateRangePicker({ from, to, onChange }: Props) {
  return (
    <div style={styles.container}>
      <div style={styles.field}>
        <label style={styles.label}>Desde</label>
        <input
          type="date"
          value={from}
          onChange={(e) => onChange(e.target.value, to)}
          style={styles.input}
        />
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Hasta</label>
        <input
          type="date"
          value={to}
          onChange={(e) => onChange(from, e.target.value)}
          style={styles.input}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 12, color: '#555', marginBottom: 6 },
  input: {
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid #ddd',
    minWidth: 160,
    background: '#fff',
  },
};
