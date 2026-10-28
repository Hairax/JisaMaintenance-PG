import { useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  FaCheckCircle,
  FaDownload,
  FaExclamationTriangle,
  FaFileUpload,
  FaTimes,
} from 'react-icons/fa';
import { Proveedor } from '../../../shared/types/proveedor.types';
import { API_URL } from '../../../shared/config/api';
import { normalizarTexto } from '../../../shared/utils/search';
import {
  PrimaryButton,
  SecondaryButton,
} from '../../../shared/components/management/ManagementPage';

const MAX_FILAS = 5000;
const MAX_ID = 2147483647;

interface FilaArchivo {
  fila: number; // número de fila en el Excel (1 = encabezados)
  codigo: string; // ID del proveedor (vacío = automático)
  nombre: string;
  nit: string;
  motivo: string | null; // null = se importará
}

interface Resultado {
  total: number;
  creados: number;
  omitidos: { fila: number; motivo: string }[];
}

// Encabezados aceptados (sin tildes ni mayúsculas) para cada columna.
const ALIAS: Record<'codigo' | 'nombre' | 'nit', string[]> = {
  codigo: [
    'codigo',
    'cod',
    'id',
    'cod proveedor',
    'cod. proveedor',
    'codigo proveedor',
  ],
  nombre: [
    'nombre',
    'proveedor',
    'razon social',
    'nombre proveedor',
    'nom. proveedor',
  ],
  nit: ['nit', 'ruc', 'nit/ci', 'nit / ci', 'ci/nit'],
};

const claveNit = (v: string) => normalizarTexto(v).replace(/\s+/g, '');

// Los CSV se decodifican aparte: XLSX no detecta la codificación y las
// tildes salen corruptas. Se intenta UTF-8 y, si no es válido,
// Windows-1252 (lo que usa Excel al guardar CSV en Windows).
async function leerLibro(file: File) {
  const buffer = await file.arrayBuffer();
  if (!/\.csv$/i.test(file.name)) return XLSX.read(buffer, { type: 'array' });
  let texto: string;
  try {
    texto = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    texto = new TextDecoder('windows-1252').decode(buffer);
  }
  return XLSX.read(texto.replace(/^\uFEFF/, ''), { type: 'string', raw: true });
}

function descargarPlantilla() {
  const hoja = XLSX.utils.aoa_to_sheet([['Código', 'Nombre', 'NIT']]);
  // NIT en formato texto: evita que Excel lo muestre en notación científica.
  for (let r = 2; r <= 1001; r++) hoja[`C${r}`] = { t: 's', v: '', z: '@' };
  hoja['!ref'] = 'A1:C1001';
  hoja['!cols'] = [{ wch: 10 }, { wch: 40 }, { wch: 16 }];
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Proveedores');
  XLSX.writeFile(libro, 'plantilla_proveedores.xlsx');
}

interface Props {
  isOpen: boolean;
  proveedores: Proveedor[];
  onClose: () => void;
  onImportado: () => void;
}

// Importación por lote de proveedores desde Excel/CSV con las columnas
// Código (= ID del proveedor en el sistema), Nombre y NIT.
export function ImportarProveedoresModal({
  isOpen,
  proveedores,
  onClose,
  onImportado,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<string | null>(null);
  const [filas, setFilas] = useState<FilaArchivo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const validas = useMemo(() => filas.filter((f) => !f.motivo), [filas]);

  if (!isOpen) return null;

  const reiniciar = () => {
    setArchivo(null);
    setFilas([]);
    setError(null);
    setResultado(null);
    if (inputRef.current) inputRef.current.value = '';
  };
  const cerrar = () => {
    reiniciar();
    onClose();
  };

  const leerArchivo = async (file: File) => {
    reiniciar();
    setArchivo(file.name);
    try {
      const libro = await leerLibro(file);
      const hoja = libro.Sheets[libro.SheetNames[0]];
      const datos = XLSX.utils.sheet_to_json<string[]>(hoja, {
        header: 1,
        raw: false,
        defval: '',
      });
      if (datos.length < 2) {
        setError('El archivo no tiene filas debajo de los encabezados.');
        return;
      }
      const encabezados = datos[0].map((h) => normalizarTexto(String(h)));
      const col = (campo: keyof typeof ALIAS) =>
        encabezados.findIndex((h) => ALIAS[campo].includes(h));
      const iCodigo = col('codigo');
      const iNombre = col('nombre');
      const iNit = col('nit');
      if (iNombre < 0) {
        setError(
          'No se encontró la columna "Nombre". Use la plantilla (columnas: Código, Nombre, NIT).',
        );
        return;
      }

      const idsExistentes = new Map(proveedores.map((p) => [p.id, p.nombre]));
      const nitsExistentes = new Set(
        proveedores.map((p) => claveNit(p.ruc ?? '')).filter(Boolean),
      );
      const idsArchivo = new Set<number>();
      const nitsArchivo = new Set<string>();

      const leidas: FilaArchivo[] = [];
      datos.slice(1).forEach((r, i) => {
        const celda = (idx: number) =>
          idx >= 0 ? String(r[idx] ?? '').trim() : '';
        const codigo = celda(iCodigo);
        const nombre = celda(iNombre);
        const nit = celda(iNit);
        if (!codigo && !nombre && !nit) return; // fila vacía

        const id = /^\d+$/.test(codigo) ? Number(codigo) : NaN;
        let motivo: string | null = null;
        if (!nombre) motivo = 'Falta el nombre';
        else if (codigo && (!Number.isInteger(id) || id < 1 || id > MAX_ID))
          motivo = `Código "${codigo}" inválido: debe ser un número entero`;
        else if (codigo && idsExistentes.has(id))
          motivo = `El código ${id} ya existe (${idsExistentes.get(id)})`;
        else if (nit && nitsExistentes.has(claveNit(nit)))
          motivo = `El NIT ${nit} ya existe`;
        else if (codigo && idsArchivo.has(id))
          motivo = `Código ${id} repetido en el archivo`;
        else if (nit && nitsArchivo.has(claveNit(nit)))
          motivo = `NIT ${nit} repetido en el archivo`;
        if (!motivo) {
          if (codigo) idsArchivo.add(id);
          if (nit) nitsArchivo.add(claveNit(nit));
        }
        leidas.push({ fila: i + 2, codigo, nombre, nit, motivo });
      });

      if (leidas.length === 0) {
        setError('El archivo no tiene datos para importar.');
        return;
      }
      if (leidas.length > MAX_FILAS) {
        setError(
          `El archivo tiene ${leidas.length} filas; el máximo es ${MAX_FILAS}.`,
        );
        return;
      }
      setFilas(leidas);
    } catch (e) {
      console.error(e);
      setError(
        'No se pudo leer el archivo. Verifique que sea .xlsx, .xls o .csv.',
      );
    }
  };

  const importar = async () => {
    setImportando(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/proveedores/importar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filas: validas.map(({ fila, codigo, nombre, nit }) => ({
            fila,
            codigo,
            nombre,
            nit,
          })),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
      setResultado(data as Resultado);
      onImportado();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al importar');
    } finally {
      setImportando(false);
    }
  };

  const omitidasArchivo = filas.filter((f) => f.motivo);
  const muted = { color: 'var(--app-text-muted)' };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
    >
      <div
        className="rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-black/5 dark:border-white/10 relative flex flex-col max-h-[90vh]"
        style={{ background: 'var(--app-surface)', color: 'var(--app-text)' }}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={cerrar}
          className="absolute top-3 right-4 hover:opacity-70"
          aria-label="Cerrar"
          style={{ color: 'var(--app-brand-accent)' }}
        >
          <FaTimes className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold mb-1">Importar proveedores</h2>
        <p className="text-sm mb-4" style={muted}>
          Carga varios proveedores a la vez desde un Excel o CSV con las
          columnas <strong>Código</strong> (el ID del proveedor en el sistema),{' '}
          <strong>Nombre</strong> y <strong>NIT</strong>. Si el código se deja
          vacío, se asigna el siguiente automáticamente. Teléfono, correo y
          dirección quedan vacíos para completarlos después.
        </p>

        <div className="flex-grow overflow-y-auto pr-1 space-y-4">
          {!resultado && (
            <div className="flex flex-wrap items-center gap-2">
              <SecondaryButton onClick={descargarPlantilla}>
                <FaDownload /> Descargar plantilla
              </SecondaryButton>
              <SecondaryButton onClick={() => inputRef.current?.click()}>
                <FaFileUpload />{' '}
                {archivo ? 'Elegir otro archivo' : 'Elegir archivo'}
              </SecondaryButton>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) leerArchivo(f);
                }}
              />
              {archivo && (
                <span className="text-sm truncate" style={muted}>
                  {archivo}
                </span>
              )}
            </div>
          )}

          {error && (
            <div
              className="px-4 py-3 rounded-lg text-sm border"
              style={{
                background: 'rgba(211, 47, 47, 0.08)',
                borderColor: 'rgba(211, 47, 47, 0.35)',
                color: 'var(--badge-danger)',
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          {filas.length > 0 && !resultado && (
            <>
              <div className="flex flex-wrap gap-4 text-sm">
                <span style={{ color: 'var(--badge-success)' }}>
                  <FaCheckCircle className="inline mr-1" />
                  {validas.length} para importar
                </span>
                {omitidasArchivo.length > 0 && (
                  <span style={{ color: 'var(--badge-warning)' }}>
                    <FaExclamationTriangle className="inline mr-1" />
                    {omitidasArchivo.length} se omitirán
                  </span>
                )}
              </div>
              <div
                className="rounded-lg border overflow-auto max-h-72"
                style={{ borderColor: 'var(--app-border-soft)' }}
              >
                <table className="w-full text-xs">
                  <thead
                    className="sticky top-0"
                    style={{
                      background: 'var(--app-head-bg)',
                      color: 'var(--app-head-text)',
                    }}
                  >
                    <tr>
                      {['Fila', 'Código', 'Nombre', 'NIT', 'Estado'].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-3 py-2 text-left font-semibold"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filas.slice(0, 300).map((f) => (
                      <tr
                        key={f.fila}
                        className="border-t"
                        style={{ borderColor: 'var(--app-border-soft)' }}
                      >
                        <td className="px-3 py-1.5" style={muted}>
                          {f.fila}
                        </td>
                        <td className="px-3 py-1.5">
                          {f.codigo || <span style={muted}>automático</span>}
                        </td>
                        <td className="px-3 py-1.5">{f.nombre || '—'}</td>
                        <td className="px-3 py-1.5">{f.nit || '—'}</td>
                        <td
                          className="px-3 py-1.5"
                          style={{
                            color: f.motivo
                              ? 'var(--badge-warning)'
                              : 'var(--badge-success)',
                          }}
                        >
                          {f.motivo ?? 'OK'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filas.length > 300 && (
                  <p className="text-xs px-3 py-2" style={muted}>
                    Mostrando 300 de {filas.length} filas.
                  </p>
                )}
              </div>
            </>
          )}

          {resultado && (
            <div className="space-y-3 text-sm">
              <p
                style={{ color: 'var(--badge-success)' }}
                className="font-semibold"
              >
                <FaCheckCircle className="inline mr-1" />
                Se importaron {resultado.creados} proveedor(es).
              </p>
              {omitidasArchivo.length + resultado.omitidos.length > 0 && (
                <div>
                  <p style={{ color: 'var(--badge-warning)' }}>
                    {omitidasArchivo.length + resultado.omitidos.length} fila(s)
                    omitida(s):
                  </p>
                  <ul
                    className="mt-1 max-h-48 overflow-auto text-xs space-y-0.5"
                    style={muted}
                  >
                    {[
                      ...omitidasArchivo.map((f) => ({
                        fila: f.fila,
                        motivo: f.motivo as string,
                      })),
                      ...resultado.omitidos,
                    ]
                      .sort((a, b) => a.fila - b.fila)
                      .map((o) => (
                        <li key={`${o.fila}-${o.motivo}`}>
                          Fila {o.fila}: {o.motivo}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="mt-5 pt-4 border-t flex justify-end gap-2"
          style={{ borderColor: 'var(--app-border-soft)' }}
        >
          {resultado ? (
            <PrimaryButton onClick={cerrar}>Listo</PrimaryButton>
          ) : (
            <>
              <SecondaryButton onClick={cerrar}>Cancelar</SecondaryButton>
              <PrimaryButton
                onClick={importar}
                disabled={validas.length === 0 || importando}
              >
                <FaFileUpload />{' '}
                {importando
                  ? 'Importando...'
                  : `Importar ${validas.length} proveedor(es)`}
              </PrimaryButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
