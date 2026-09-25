import { useEffect } from 'react';

export interface ExportOption<T extends string> {
  value: T;
  titulo: string;
  detalle: string;
  color: string;
}

interface ExportOptionsModalProps<T extends string> {
  open: boolean;
  titulo: string;
  pregunta: string;
  opciones: ExportOption<T>[];
  onClose: () => void;
  onSelect: (value: T) => void;
}

// Popup genérico para elegir una variante de export antes de generarlo.
export function ExportOptionsModal<T extends string>({
  open,
  titulo,
  pregunta,
  opciones,
  onClose,
  onSelect,
}: ExportOptionsModalProps<T>) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--app-surface)',
          borderRadius: 12,
          padding: '1.4rem',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
          color: 'var(--app-text)',
        }}
      >
        <h3 style={{ margin: '0 0 0.3rem', fontSize: 17 }}>{titulo}</h3>
        <p
          style={{
            margin: '0 0 1rem',
            fontSize: 13,
            color: 'var(--app-text-muted)',
          }}
        >
          {pregunta}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {opciones.map((o) => (
            <button
              key={o.value}
              onClick={() => onSelect(o.value)}
              style={{
                textAlign: 'left',
                padding: '0.8rem 1rem',
                borderRadius: 8,
                border: `2px solid ${o.color}`,
                background: 'var(--app-surface)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 700, color: o.color, marginBottom: 2 }}>
                {o.titulo}
              </div>
              <div style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>
                {o.detalle}
              </div>
            </button>
          ))}
        </div>
        <div style={{ textAlign: 'right', marginTop: '1rem' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.45rem 1.1rem',
              borderRadius: 8,
              background: 'transparent',
              border: '1px solid var(--app-border)',
              color: 'var(--app-text)',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export type AlcanceExport = 'completa' | 'contables';

const OPCIONES_CONTABILIDAD: ExportOption<AlcanceExport>[] = [
  {
    value: 'completa',
    titulo: 'Exportación completa',
    detalle: 'Incluye todos los repuestos.',
    color: '#6A5ACD',
  },
  {
    value: 'contables',
    titulo: 'Solo repuestos contables',
    detalle: 'Excluye los repuestos marcados como no contables.',
    color: '#2E7D32',
  },
];

// Popup previo a los exports para contabilidad: permite exportar todo o
// solo las líneas de repuestos marcados como "contable".
export function ExportContabilidadModal(props: {
  open: boolean;
  onClose: () => void;
  onSelect: (alcance: AlcanceExport) => void;
}) {
  return (
    <ExportOptionsModal
      {...props}
      titulo="Exportar para Contabilidad"
      pregunta="¿Qué repuestos desea incluir en el archivo?"
      opciones={OPCIONES_CONTABILIDAD}
    />
  );
}
