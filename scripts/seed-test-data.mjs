// Carga datos de prueba a través del api-gateway (respeta la lógica de negocio:
// stock, costo ponderado, validaciones de salida, correlativos).
// Uso: node scripts/seed-test-data.mjs   (requiere `pnpm dev` corriendo)
const API = process.env.API_URL || 'http://localhost:3000';

async function post(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`POST ${path} -> ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function get(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json();
}

const createAll = async (path, items) => {
  const out = [];
  for (const item of items) out.push(await post(path, item));
  console.log(`✔ ${path}: ${out.length}`);
  return out;
};

// ── Catálogos básicos ────────────────────────────────────────────────────────
await createAll('/unidades-medida', [
  { nombre: 'Unidad', codigo: 'UN', descripcion: 'Pieza individual' },
  { nombre: 'Kilogramo', codigo: 'KG', descripcion: 'Peso en kilogramos' },
  { nombre: 'Litro', codigo: 'LT', descripcion: 'Volumen en litros' },
  { nombre: 'Metro', codigo: 'MT', descripcion: 'Longitud en metros' },
  { nombre: 'Juego', codigo: 'JGO', descripcion: 'Kit / juego completo' },
]);

const almacenes = await createAll('/almacen', [
  { nombre: 'Almacén Central', codigo: 'ALM-01', descripcion: 'Depósito principal de repuestos' },
  { nombre: 'Almacén Planta Norte', codigo: 'ALM-02', descripcion: 'Repuestos de línea de producción norte' },
  { nombre: 'Almacén Lubricantes', codigo: 'ALM-03', descripcion: 'Aceites, grasas y químicos' },
  { nombre: 'Almacén Eléctrico', codigo: 'ALM-04', descripcion: 'Material eléctrico y electrónico' },
]);
const [central, norte, lubric, electr] = almacenes.map((a) => a.nombre);

const ccs = await createAll('/cost-centers', [
  { name: 'Producción' },
  { name: 'Envasado' },
  { name: 'Servicios Generales' },
  { name: 'Logística' },
]);

const procs = await createAll(
  '/process',
  ['Molienda', 'Llenado', 'Generación de vapor', 'Despacho'].map((name, i) => ({
    name,
    centroCosto_id: ccs[i].id,
  })),
);

const provs = await createAll('/proveedores', [
  { nombre: 'Rodamientos Bolivia S.R.L.', ruc: '1023456017', correoElectronico: 'ventas@rodabol.com', telefono: '+59133445566', direccion: 'Av. Banzer 4to anillo, Santa Cruz' },
  { nombre: 'Lubricantes del Oriente S.A.', ruc: '2034567018', correoElectronico: 'pedidos@lubrioriente.com', telefono: '+59133221100', direccion: 'Parque Industrial Mz. 7, Santa Cruz' },
  { nombre: 'Electro Industrial Andina', ruc: '3045678019', correoElectronico: 'contacto@electroandina.bo', telefono: '+59122334455', direccion: 'Calle Comercio 1234, La Paz' },
  { nombre: 'Hidráulica y Neumática SRL', ruc: '4056789010', correoElectronico: 'info@hidroneumatica.bo', telefono: '+59144556677', direccion: 'Av. Blanco Galindo km 5, Cochabamba' },
]);

const maqs = await createAll('/maquinas', [
  { name: 'Molino de martillos MM-500', fabricante: 'Bühler', tipoDeMaquina: 'Molino', numeroDeSerie: 'BH-MM500-2019-117', fechaDeFabricacion: '2019-03-10', fechaDeMontaje: '2019-08-01', costo: 185000, horasTrabajadas: 21450, centroCosto_id: ccs[0].id, proceso_id: procs[0].id, proveedor_id: provs[0].id },
  { name: 'Llenadora rotativa LR-24', fabricante: 'Krones', tipoDeMaquina: 'Llenadora', numeroDeSerie: 'KR-LR24-2021-044', fechaDeFabricacion: '2021-01-15', fechaDeMontaje: '2021-06-20', costo: 320000, horasTrabajadas: 12800, centroCosto_id: ccs[1].id, proceso_id: procs[1].id, proveedor_id: provs[3].id },
  { name: 'Caldero pirotubular CP-150', fabricante: 'Cleaver-Brooks', tipoDeMaquina: 'Caldero', numeroDeSerie: 'CB-150HP-2017-009', fechaDeFabricacion: '2017-05-02', fechaDeMontaje: '2017-11-12', costo: 150000, horasTrabajadas: 35200, centroCosto_id: ccs[2].id, proceso_id: procs[2].id, proveedor_id: provs[1].id },
  { name: 'Montacargas eléctrico ME-25', fabricante: 'Toyota', tipoDeMaquina: 'Montacargas', numeroDeSerie: 'TY-8FBE25-2022-331', fechaDeFabricacion: '2022-02-01', fechaDeMontaje: '2022-04-05', costo: 42000, horasTrabajadas: 6100, centroCosto_id: ccs[3].id, proceso_id: procs[3].id, proveedor_id: provs[2].id },
]);

const subs = await createAll(
  '/subunidades',
  ['Rotor y martillos', 'Carrusel de válvulas', 'Quemador', 'Sistema de tracción'].map(
    (descripcion, i) => ({ maquina_id: maqs[i].id, descripcion }),
  ),
);

await createAll('/repuesto-maquina', [
  { nombre: 'Martillo de impacto', cantidad: 24, costoUnitario: 180, descripcion: 'Martillo acero al manganeso', maquina_id: maqs[0].id, subUnidad: subs[0].id },
  { nombre: 'Válvula de llenado', cantidad: 24, costoUnitario: 950, descripcion: 'Válvula mecánica de llenado', maquina_id: maqs[1].id, subUnidad: subs[1].id },
  { nombre: 'Boquilla de quemador', cantidad: 2, costoUnitario: 1200, descripcion: 'Boquilla de atomización diésel', maquina_id: maqs[2].id, subUnidad: subs[2].id },
  { nombre: 'Motor de tracción 48V', cantidad: 1, costoUnitario: 8500, descripcion: 'Motor AC de tracción', maquina_id: maqs[3].id, subUnidad: subs[3].id },
]);

// ── Repuestos (10) ───────────────────────────────────────────────────────────
// Algunos con stock de apertura, otros en 0 para que entren solo por compra.
const R = (o) => ({ tipo: 'NORMAL', ...o });
const reps = await createAll('/repuestos', [
  R({ nombre: 'Rodamiento SKF 6205-2RS', uMedida: 'UN', almacen: central, numeroDeParte: '6205-2RS', ubicacion: 'Estante A1', especificacion: '25x52x15 mm', costoUnitario: 45, cantidad: 12, stockCritico: 5, centroCosto_id: ccs[0].id, proceso_id: procs[0].id, maquina_id: maqs[0].id, subUnidad_id: subs[0].id }),
  R({ nombre: 'Rodamiento SKF 6310-2Z', uMedida: 'UN', almacen: central, numeroDeParte: '6310-2Z', ubicacion: 'Estante A2', especificacion: '50x110x27 mm', costoUnitario: 160, cantidad: 4, stockCritico: 2, centroCosto_id: ccs[0].id, proceso_id: procs[0].id, maquina_id: maqs[0].id }),
  R({ nombre: 'Correa en V B-52', uMedida: 'UN', almacen: norte, numeroDeParte: 'B52', ubicacion: 'Estante B1', costoUnitario: 38, cantidad: 0, stockCritico: 4, centroCosto_id: ccs[0].id, proceso_id: procs[0].id, maquina_id: maqs[0].id }),
  R({ nombre: 'Aceite hidráulico ISO VG 68', uMedida: 'LT', almacen: lubric, numeroDeParte: 'HYD-68', ubicacion: 'Tambor 3', costoUnitario: 22, cantidad: 60, stockCritico: 40, centroCosto_id: ccs[1].id, proceso_id: procs[1].id, maquina_id: maqs[1].id }),
  R({ nombre: 'Grasa EP-2 litio', uMedida: 'KG', almacen: lubric, numeroDeParte: 'EP2-LI', ubicacion: 'Estante L2', costoUnitario: 35, cantidad: 0, stockCritico: 10 }),
  R({ nombre: 'Juego de sellos O-ring válvula', uMedida: 'JGO', almacen: norte, numeroDeParte: 'KR-ORK-24', ubicacion: 'Cajón B4', costoUnitario: 210, cantidad: 3, stockCritico: 2, centroCosto_id: ccs[1].id, proceso_id: procs[1].id, maquina_id: maqs[1].id, subUnidad_id: subs[1].id }),
  R({ nombre: 'Contactor Schneider LC1D25', uMedida: 'UN', almacen: electr, numeroDeParte: 'LC1D25M7', ubicacion: 'Gabinete E1', costoUnitario: 480, cantidad: 2, stockCritico: 1 }),
  R({ nombre: 'Cable THW 12 AWG', uMedida: 'MT', almacen: electr, numeroDeParte: 'THW-12', ubicacion: 'Carrete E3', costoUnitario: 6.5, cantidad: 100, stockCritico: 50 }),
  R({ tipo: 'LIBRE', codigoPersonalizado: 'LIB-001', nombre: 'Electrodo E6011 1/8"', uMedida: 'KG', almacen: central, ubicacion: 'Estante C1', costoUnitario: 28, cantidad: 0, stockCritico: 5 }),
  R({ tipo: 'LIBRE', codigoPersonalizado: 'LIB-002', nombre: 'Disco de corte 7" metal', uMedida: 'UN', almacen: central, ubicacion: 'Estante C2', costoUnitario: 18, cantidad: 10, stockCritico: 10 }),
]);

// ── Usuarios (4 además del admin) ────────────────────────────────────────────
const U = (o) => ({ password: 'Password123', phone: '+541112345678', celphone: '+541112345678', hora$: 0, minutos$: 0, status: true, ...o });
const users = await createAll('/users', [
  U({ name: 'Carlos', lastName: 'Mendoza', email: 'cmendoza@jisa.com', cargo: 'supervisor', userName: 'cmendoza', hora$: 45 }),
  U({ name: 'Luis', lastName: 'Rojas', email: 'lrojas@jisa.com', cargo: 'tecnico', userName: 'lrojas', hora$: 30 }),
  U({ name: 'Ana', lastName: 'Gutiérrez', email: 'agutierrez@jisa.com', cargo: 'tecnico', userName: 'agutierrez', hora$: 30 }),
  U({ name: 'María', lastName: 'Flores', email: 'mflores@jisa.com', cargo: 'encargado-almacen', userName: 'mflores', hora$: 25 }),
]);
const [sup, tec1, tec2, alm] = users;

// ── Catálogos de OT ─────────────────────────────────────────────────────────
const deps = await createAll('/departamentos', ['Mecánico', 'Eléctrico', 'Instrumentación', 'Civil'].map((nombre) => ({ nombre })));
const objs = await createAll('/objetos', ['Máquina', 'Instalación', 'Herramienta', 'Vehículo'].map((nombre) => ({ nombre })));
const tipos = await createAll('/tipo-mantenimientos', ['Preventivo', 'Correctivo', 'Predictivo', 'Mejora'].map((nombre) => ({ nombre })));

// ── Órdenes de trabajo (5, estados variados) ────────────────────────────────
const OT = (i, o) => ({
  centroCosto_id: ccs[i].id,
  proceso_id: procs[i].id,
  maquina_id: maqs[i].id,
  subUnidad_id: subs[i].id,
  supervisor_id: sup.id,
  tipoCambio: 7,
  ...o,
});
const ots = await createAll('/ots', [
  OT(0, { tipoOT_id: tipos[0].id, tipoEjecucion: 'Preventivo', departamento_id: deps[0].id, objeto_id: objs[0].id, tiempoEstimado: 4, descripcionTarea: 'Cambio de rodamientos y correas del molino', fechaHora: '2026-08-05T08:00:00', estado: 'Cerrada', tecnicos: [tec1.id] }),
  OT(1, { tipoOT_id: tipos[1].id, tipoEjecucion: 'Correctivo', departamento_id: deps[0].id, objeto_id: objs[0].id, tiempoEstimado: 6, descripcionTarea: 'Fuga en válvulas de llenado, reemplazo de sellos', indicacionesEspeciales: 'Bloqueo y etiquetado antes de intervenir', fechaHora: '2026-08-20T09:30:00', estado: 'Cerrada', tecnicos: [tec1.id, tec2.id] }),
  OT(2, { tipoOT_id: tipos[2].id, tipoEjecucion: 'Preventivo', departamento_id: deps[2].id, objeto_id: objs[1].id, tiempoEstimado: 3, descripcionTarea: 'Revisión de quemador y lubricación de bomba de alimentación', fechaHora: '2026-09-08T07:00:00', estado: 'En Progreso', tecnicos: [tec2.id] }),
  OT(3, { tipoOT_id: tipos[1].id, tipoEjecucion: 'Correctivo', departamento_id: deps[1].id, objeto_id: objs[3].id, tiempoEstimado: 2, descripcionTarea: 'Falla en contactor del sistema de tracción', fechaHora: '2026-09-15T14:00:00', estado: 'En Progreso', tecnicos: [tec1.id] }),
  OT(0, { tipoOT_id: tipos[3].id, tipoEjecucion: 'Preventivo', departamento_id: deps[3].id, objeto_id: objs[2].id, tiempoEstimado: 5, descripcionTarea: 'Refuerzo de base del molino con soldadura', fechaHora: '2026-09-24T08:00:00', estado: 'Abierta', tecnicos: [tec2.id] }),
]);

// ── Programaciones de OT (4) ────────────────────────────────────────────────
await createAll('/programaciones-ot', [
  { nombre: 'Lubricación semanal molino', frecuenciaValor: 1, frecuenciaUnidad: 'semanas', fechaInicio: '2026-09-01', descripcionTarea: 'Engrase de rodamientos del rotor', i: 0, t: 0, d: 0 },
  { nombre: 'Cambio de sellos llenadora', frecuenciaValor: 3, frecuenciaUnidad: 'meses', fechaInicio: '2026-10-01', descripcionTarea: 'Reemplazo preventivo de O-rings', i: 1, t: 0, d: 0 },
  { nombre: 'Inspección caldero', frecuenciaValor: 1, frecuenciaUnidad: 'meses', fechaInicio: '2026-09-15', descripcionTarea: 'Inspección de quemador y tubos', i: 2, t: 2, d: 2 },
  { nombre: 'Revisión batería montacargas', frecuenciaValor: 15, frecuenciaUnidad: 'dias', fechaInicio: '2026-09-20', descripcionTarea: 'Nivel de electrolito y conexiones', i: 3, t: 0, d: 1 },
].map(({ i, t, d, ...p }) => ({
  ...p,
  maquina_id: maqs[i].id,
  subUnidad_id: subs[i].id,
  centroCosto_id: ccs[i].id,
  proceso_id: procs[i].id,
  tipoOT_id: tipos[t].id,
  departamento_id: deps[d].id,
  objeto_id: objs[0].id,
  supervisor_id: sup.id,
  tipoEjecucion: 'Preventivo',
  tiempoEstimado: 2,
  activo: true,
})));

// ── Compras (5) — precios con IVA 13% incluido, como en factura ─────────────
const item = (r, cantidad, precioUnitario, porcentajeDescuento = 0) => ({
  repuestoId: r.id,
  codigo: r.codigoPersonalizado || String(r.id),
  nombre: r.nombre,
  unidadMedida: r.uMedida,
  cantidad,
  precioUnitario,
  porcentajeDescuento,
});
await createAll('/compras', [
  { nroDocumento: 'C-0001', tipoDocumento: 'Factura', nroFactura: '10245', nit: provs[0].ruc, proveedorId: provs[0].id, detalle: 'Rodamientos y correas para molino', almacen: central, fecha: '2026-07-10T10:00:00', tipoCambio: 6.96, nroAutorizacion: '79040011245', detalles: [item(reps[0], 20, 52), item(reps[1], 6, 185), item(reps[2], 10, 45)] },
  { nroDocumento: 'C-0002', tipoDocumento: 'Factura', nroFactura: '5521', nit: provs[1].ruc, proveedorId: provs[1].id, detalle: 'Reposición de lubricantes', almacen: lubric, fecha: '2026-07-25T15:30:00', tipoCambio: 6.96, nroAutorizacion: '79040055210', detalles: [item(reps[3], 200, 26, 5), item(reps[4], 30, 40)] },
  { nroDocumento: 'C-0003', tipoDocumento: 'Factura', nroFactura: '887', nit: provs[2].ruc, proveedorId: provs[2].id, detalle: 'Material eléctrico', almacen: electr, fecha: '2026-08-12T09:00:00', tipoCambio: 6.96, detalles: [item(reps[6], 4, 560), item(reps[7], 300, 7.5, 10)] },
  { nroDocumento: 'C-0004', tipoDocumento: 'Documento', nroFactura: 'S/N', nit: '0', proveedorId: provs[3].id, detalle: 'Compra menor sin factura: sellos y consumibles', almacen: norte, fecha: '2026-08-28T11:00:00', tipoCambio: 6.96, detalles: [item(reps[5], 4, 240), item(reps[8], 15, 32), item(reps[9], 25, 20)] },
  { nroDocumento: 'C-0005', tipoDocumento: 'Factura', nroFactura: '10398', nit: provs[0].ruc, proveedorId: provs[0].id, detalle: 'Segunda compra de rodamientos (precio actualizado)', almacen: central, fecha: '2026-09-10T16:00:00', tipoCambio: 6.96, nroAutorizacion: '79040011398', detalles: [item(reps[0], 10, 58), item(reps[4], 20, 42)] },
]);

// ── Salidas (6) — al costo ponderado vigente, como hace el frontend ─────────
const repsNow = Object.fromEntries((await get('/repuestos')).map((r) => [r.id, r]));
const out = (r, cantidad) => {
  const cur = repsNow[r.id];
  return {
    repuestoId: r.id,
    codigo: r.codigoPersonalizado || String(r.id),
    nombre: r.nombre,
    unidadMedida: r.uMedida,
    cantidad,
    precioUnitario: Number(cur.costoUnitarioPonderado || cur.costoUnitario),
  };
};
await createAll('/salidas', [
  { usuarioId: alm.id, otId: ots[0].id, fecha: '2026-08-05T08:30:00', almacen: central, observacion: 'Cambio de rodamientos molino', detalles: [out(reps[0], 4), out(reps[1], 2), out(reps[2], 4)] },
  { usuarioId: alm.id, otId: ots[1].id, fecha: '2026-08-20T10:00:00', almacen: norte, observacion: 'Sellos para válvulas de llenadora', detalles: [out(reps[5], 5), out(reps[3], 20)] },
  { usuarioId: tec1.id, otId: ots[0].id, fecha: '2026-08-06T09:00:00', almacen: lubric, observacion: 'Engrase post-montaje', detalles: [out(reps[4], 5)] },
  { usuarioId: alm.id, otId: ots[2].id, fecha: '2026-09-08T07:30:00', almacen: lubric, observacion: 'Lubricación bomba de caldero', detalles: [out(reps[3], 35), out(reps[4], 8)] },
  { usuarioId: tec2.id, otId: ots[3].id, fecha: '2026-09-15T14:30:00', almacen: electr, observacion: 'Reemplazo de contactor y cableado', detalles: [out(reps[6], 1), out(reps[7], 45)] },
  { usuarioId: alm.id, otId: ots[4].id, fecha: '2026-09-24T08:15:00', almacen: central, observacion: 'Soldadura base del molino', detalles: [out(reps[8], 6), out(reps[9], 28)] },
]);

// ── Informes (4) ─────────────────────────────────────────────────────────────
await createAll('/informes', [
  { userId: tec1.id, detalles: [{ otId: ots[0].id, observaciones: 'Rodamientos con desgaste, reemplazados', horaInicio: '2026-08-05T08:00:00', horaFinalización: '2026-08-05T12:30:00' }] },
  { userId: tec2.id, detalles: [{ otId: ots[1].id, observaciones: 'Se cambiaron 5 juegos de sellos', horaInicio: '2026-08-20T09:30:00', horaFinalización: '2026-08-20T16:00:00' }] },
  { userId: tec1.id, detalles: [{ otId: ots[1].id, observaciones: 'Prueba de hermeticidad OK', horaInicio: '2026-08-21T08:00:00', horaFinalización: '2026-08-21T10:00:00' }, { otId: ots[3].id, observaciones: 'Contactor quemado, reemplazado', horaInicio: '2026-09-15T14:00:00', horaFinalización: '2026-09-15T16:30:00' }] },
  { userId: tec2.id, detalles: [{ otId: ots[2].id, observaciones: 'Quemador con hollín, limpieza parcial', horaInicio: '2026-09-08T07:00:00', horaFinalización: '2026-09-08T10:00:00' }] },
]);

console.log('\nStock final de repuestos:');
for (const r of await get('/repuestos')) {
  console.log(`  ${String(r.id).padStart(2)} ${r.nombre.padEnd(34)} cant=${String(r.cantidad).padStart(4)}  ponderado=${Number(r.costoUnitarioPonderado).toFixed(2)}`);
}
