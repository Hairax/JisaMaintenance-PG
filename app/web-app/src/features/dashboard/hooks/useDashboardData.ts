import { useCallback, useEffect, useState } from 'react';
import {
  minutosTrabajados,
  costoManoObra,
} from '../../../shared/utils/laborCost';
import type {
  DashboardData,
  DashboardDepartamento,
  DashboardInforme,
  DashboardMaquina,
  DashboardOT,
  DashboardSalida,
  DashboardTipoOT,
  DashboardUsuario,
  NameValue,
  OTVencida,
  RankingActivo,
  RankingTecnico,
} from '../types/dashboard.types';
import { API_URL } from '../../../shared/config/api';

const API = API_URL;

export type PeriodoFiltro = '3m' | '6m' | '12m' | 'anio' | 'todo';

const getName = (obj?: { nombre?: string; name?: string }): string =>
  obj?.nombre ?? obj?.name ?? 'Sin asignar';

const monthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const monthLabel = (d: Date) =>
  d.toLocaleDateString('es-BO', { month: 'short', year: '2-digit' });

function periodStartDate(periodo: PeriodoFiltro): Date | null {
  const now = new Date();
  switch (periodo) {
    case '3m':
      return new Date(now.getFullYear(), now.getMonth() - 2, 1);
    case '6m':
      return new Date(now.getFullYear(), now.getMonth() - 5, 1);
    case '12m':
      return new Date(now.getFullYear(), now.getMonth() - 11, 1);
    case 'anio':
      return new Date(now.getFullYear(), 0, 1);
    case 'todo':
    default:
      return null;
  }
}

function isCorrectivo(ot: DashboardOT): boolean {
  const nombre = (ot.tipoOT?.nombre ?? '').toLowerCase();
  const ejecucion = (ot.tipoEjecucion ?? '').toLowerCase();
  return nombre.includes('correctiv') || ejecucion.includes('correctiv');
}

export function useDashboardData(periodo: PeriodoFiltro) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        resOTs,
        resInformes,
        resSalidas,
        resUsers,
        resMaq,
        resDep,
        resTipo,
      ] = await Promise.all([
        fetch(`${API}/ots`),
        fetch(`${API}/informes`),
        fetch(`${API}/salidas`),
        fetch(`${API}/users`),
        fetch(`${API}/maquinas`),
        fetch(`${API}/departamentos`),
        fetch(`${API}/tipo-mantenimientos`),
      ]);

      const [ots, informes, salidas, users, maquinas, departamentos, tipos] =
        (await Promise.all([
          resOTs.ok ? resOTs.json() : [],
          resInformes.ok ? resInformes.json() : [],
          resSalidas.ok ? resSalidas.json() : [],
          resUsers.ok ? resUsers.json() : [],
          resMaq.ok ? resMaq.json() : [],
          resDep.ok ? resDep.json() : [],
          resTipo.ok ? resTipo.json() : [],
        ])) as [
          DashboardOT[],
          DashboardInforme[],
          DashboardSalida[],
          DashboardUsuario[],
          DashboardMaquina[],
          DashboardDepartamento[],
          DashboardTipoOT[],
        ];

      const allOTs = Array.isArray(ots) ? ots : [];
      const allInformes = Array.isArray(informes) ? informes : [];
      const allSalidas = Array.isArray(salidas) ? salidas : [];
      const allUsers = Array.isArray(users) ? users : [];
      const allMaquinas = Array.isArray(maquinas) ? maquinas : [];
      void departamentos;
      void tipos;

      const userMap: Record<number, DashboardUsuario> = {};
      for (const u of allUsers) userMap[u.id] = u;
      const maquinaMap: Record<number, DashboardMaquina> = {};
      for (const m of allMaquinas) maquinaMap[m.id] = m;

      // ── Horas y costo de mano de obra por OT (a partir de los informes) ──
      const horasPorOT: Record<number, number> = {};
      const manoObraPorOT: Record<number, number> = {};
      for (const inf of allInformes) {
        for (const det of inf.detalles ?? []) {
          const otId = Number(det.otId);
          const minutos = minutosTrabajados(
            det.horaInicio,
            det['horaFinalización' as keyof typeof det] as unknown as string,
          );
          horasPorOT[otId] = (horasPorOT[otId] ?? 0) + minutos / 60;
          manoObraPorOT[otId] =
            (manoObraPorOT[otId] ?? 0) +
            costoManoObra(userMap[inf.userId], minutos);
        }
      }

      // ── Costo de materiales por OT (a partir de salidas de almacén) ──
      const materialesPorOT: Record<number, number> = {};
      for (const s of allSalidas) {
        const otId = Number(s.otId);
        materialesPorOT[otId] = (materialesPorOT[otId] ?? 0) + Number(s.total);
      }

      // ── Filtro de período (por fecha de creación de la OT) ──
      const desde = periodStartDate(periodo);
      const otsFiltradas = desde
        ? allOTs.filter((ot) => {
            const f = new Date(ot.fechaCreacion ?? ot.fechaHora);
            return !isNaN(f.getTime()) && f >= desde;
          })
        : allOTs;

      // ── Resumen ──
      const totalOTs = otsFiltradas.length;
      const otsAbiertas = otsFiltradas.filter(
        (o) => o.estado === 'Abierta',
      ).length;
      const otsEnProgreso = otsFiltradas.filter((o) =>
        o.estado.startsWith('En Progreso'),
      ).length;
      const otsCerradas = otsFiltradas.filter(
        (o) => o.estado === 'Cerrada',
      ).length;
      const cumplimiento = totalOTs > 0 ? (otsCerradas / totalOTs) * 100 : 0;

      const horasTrabajadas = otsFiltradas.reduce(
        (s, ot) => s + (horasPorOT[ot.id] ?? 0),
        0,
      );
      const costoManoObraTotal = otsFiltradas.reduce(
        (s, ot) => s + (manoObraPorOT[ot.id] ?? 0),
        0,
      );
      const costoMaterialesTotal = otsFiltradas.reduce(
        (s, ot) => s + (materialesPorOT[ot.id] ?? 0),
        0,
      );
      const costoTotal = costoManoObraTotal + costoMaterialesTotal;
      const costoPromedioPorOT = totalOTs > 0 ? costoTotal / totalOTs : 0;

      const correctivasCerradas = otsFiltradas.filter(
        (o) =>
          o.estado === 'Cerrada' &&
          isCorrectivo(o) &&
          (horasPorOT[o.id] ?? 0) > 0,
      );
      const mttr =
        correctivasCerradas.length > 0
          ? correctivasCerradas.reduce(
              (s, o) => s + (horasPorOT[o.id] ?? 0),
              0,
            ) / correctivasCerradas.length
          : 0;

      // ── Series mensuales (últimos meses dentro del período, máx. 12) ──
      const mesesMap = new Map<
        string,
        { label: string; creadas: number; cerradas: number; costo: number }
      >();
      for (const ot of otsFiltradas) {
        const f = new Date(ot.fechaCreacion ?? ot.fechaHora);
        if (isNaN(f.getTime())) continue;
        const key = monthKey(f);
        if (!mesesMap.has(key)) {
          mesesMap.set(key, {
            label: monthLabel(f),
            creadas: 0,
            cerradas: 0,
            costo: 0,
          });
        }
        const entry = mesesMap.get(key)!;
        entry.creadas += 1;
        if (ot.estado === 'Cerrada') entry.cerradas += 1;
        entry.costo +=
          (manoObraPorOT[ot.id] ?? 0) + (materialesPorOT[ot.id] ?? 0);
      }
      const mesesOrdenados = Array.from(mesesMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12);

      const otsPorMes: NameValue[] = mesesOrdenados.map(([, v]) => ({
        name: v.label,
        value: v.creadas,
      }));
      const otsCerradasPorMes: NameValue[] = mesesOrdenados.map(([, v]) => ({
        name: v.label,
        value: v.cerradas,
      }));
      const costoPorMes: NameValue[] = mesesOrdenados.map(([, v]) => ({
        name: v.label,
        value: Math.round(v.costo * 100) / 100,
      }));

      // ── Distribuciones ──
      const porEstadoMap = new Map<string, number>();
      const porTipoMap = new Map<string, number>();
      const porDeptoMap = new Map<string, number>();
      for (const ot of otsFiltradas) {
        porEstadoMap.set(ot.estado, (porEstadoMap.get(ot.estado) ?? 0) + 1);
        const tipo = getName(ot.tipoOT);
        porTipoMap.set(tipo, (porTipoMap.get(tipo) ?? 0) + 1);
        const depto = getName(ot.departamento);
        porDeptoMap.set(depto, (porDeptoMap.get(depto) ?? 0) + 1);
      }
      const otsPorEstado: NameValue[] = Array.from(porEstadoMap.entries()).map(
        ([name, value]) => ({ name, value }),
      );
      const otsPorTipo: NameValue[] = Array.from(porTipoMap.entries()).map(
        ([name, value]) => ({ name, value }),
      );
      const otsPorDepartamento: NameValue[] = Array.from(porDeptoMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // ── Ranking de activos por costo total ──
      const porMaquina = new Map<
        number,
        { ots: number; horas: number; costo: number }
      >();
      for (const ot of otsFiltradas) {
        const maqId = Number(ot.maquina_id ?? ot.maquina?.id);
        if (!maqId) continue;
        if (!porMaquina.has(maqId))
          porMaquina.set(maqId, { ots: 0, horas: 0, costo: 0 });
        const e = porMaquina.get(maqId)!;
        e.ots += 1;
        e.horas += horasPorOT[ot.id] ?? 0;
        e.costo += (manoObraPorOT[ot.id] ?? 0) + (materialesPorOT[ot.id] ?? 0);
      }
      const rankingActivos: RankingActivo[] = Array.from(porMaquina.entries())
        .map(([id, v]) => ({
          id,
          nombre: maquinaMap[id]?.name ?? `Activo #${id}`,
          ots: v.ots,
          horas: v.horas,
          costo: v.costo,
        }))
        .sort((a, b) => b.costo - a.costo)
        .slice(0, 5);

      // ── Ranking de técnicos por horas/costo (solo detalles de OTs del período) ──
      const otIdsFiltradas = new Set(otsFiltradas.map((o) => o.id));
      const porTecnico = new Map<
        number,
        { horas: number; costo: number; intervenciones: number }
      >();
      for (const inf of allInformes) {
        for (const det of inf.detalles ?? []) {
          const otId = Number(det.otId);
          if (!otIdsFiltradas.has(otId)) continue;
          const minutos = minutosTrabajados(
            det.horaInicio,
            det['horaFinalización' as keyof typeof det] as unknown as string,
          );
          if (minutos <= 0) continue;
          if (!porTecnico.has(inf.userId)) {
            porTecnico.set(inf.userId, {
              horas: 0,
              costo: 0,
              intervenciones: 0,
            });
          }
          const e = porTecnico.get(inf.userId)!;
          e.horas += minutos / 60;
          e.costo += costoManoObra(userMap[inf.userId], minutos);
          e.intervenciones += 1;
        }
      }
      const rankingTecnicos: RankingTecnico[] = Array.from(porTecnico.entries())
        .map(([id, v]) => {
          const u = userMap[id];
          return {
            id,
            nombre: u ? `${u.name} ${u.lastName}`.trim() : `Técnico #${id}`,
            horas: v.horas,
            costo: v.costo,
            intervenciones: v.intervenciones,
          };
        })
        .sort((a, b) => b.horas - a.horas)
        .slice(0, 5);

      // ── OTs abiertas más antiguas (siempre sobre el total, no solo el período) ──
      const hoy = new Date();
      const otsVencidas: OTVencida[] = allOTs
        .filter((o) => o.estado !== 'Cerrada')
        .map((o) => {
          const f = new Date(o.fechaCreacion ?? o.fechaHora);
          const dias = isNaN(f.getTime())
            ? 0
            : Math.floor((hoy.getTime() - f.getTime()) / (1000 * 60 * 60 * 24));
          return {
            id: o.id,
            descripcion: o.descripcionTarea,
            maquina: getName(o.maquina),
            estado: o.estado,
            diasAbierta: dias,
            fechaCreacion: o.fechaCreacion ?? o.fechaHora,
          };
        })
        .sort((a, b) => b.diasAbierta - a.diasAbierta)
        .slice(0, 5);

      setData({
        summary: {
          totalOTs,
          otsAbiertas,
          otsEnProgreso,
          otsCerradas,
          cumplimiento,
          horasTrabajadas,
          costoManoObra: costoManoObraTotal,
          costoMateriales: costoMaterialesTotal,
          costoTotal,
          costoPromedioPorOT,
          mttr,
        },
        otsPorMes,
        otsCerradasPorMes,
        costoPorMes,
        otsPorEstado,
        otsPorTipo,
        otsPorDepartamento,
        rankingActivos,
        rankingTecnicos,
        otsVencidas,
      });
    } catch (err) {
      console.error(err);
      setError(
        'Error al cargar los datos del dashboard. Verifique la conexión con el servidor.',
      );
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { data, loading, error, recargar: cargar };
}
