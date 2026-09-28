import React from 'react';

export type BadgeTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

// Colores legibles tanto en modo claro como oscuro (fondo translúcido).
const TONES: Record<BadgeTone, { bg: string; color: string }> = {
  success: { bg: 'rgba(46, 125, 50, 0.14)', color: 'var(--badge-success)' },
  danger: { bg: 'rgba(211, 47, 47, 0.14)', color: 'var(--badge-danger)' },
  warning: { bg: 'rgba(230, 81, 0, 0.14)', color: 'var(--badge-warning)' },
  info: { bg: 'rgba(21, 101, 192, 0.14)', color: 'var(--badge-info)' },
  neutral: { bg: 'var(--app-surface-alt)', color: 'var(--app-text-muted)' },
};

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
}) {
  const t = TONES[tone];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: t.bg, color: t.color }}
    >
      {children}
    </span>
  );
}
