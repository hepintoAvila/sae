// src/hooks/useServicios.ts
import { useState, useCallback, useContext, useMemo } from 'react';
import { atom, useAtom } from 'jotai';
import AulaService from '@/common/api/AulaService';
import { AuthContext, config, encodeBasicUrl } from '@/common';

export type Aula = {
  id: number;
  dependencia_id: number;
  title: string;
  observaciones?: string;
  className: string;
  textClass: string;
  statut: string;
  maj?: string;
  opciones?: Opcion[];
};

export type Opcion = {
  id: number;
  idAula: number;
  dependencia_id: number;
  title: string;
  className?: string;
  textClass?: string;
  stock: number;
  statut: string;
};

const aulasAtom = atom<Aula[]>([]);

export default function useServicios() {
  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error('AuthContext no está disponible');

  const { credentials } = authContext;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [servicios, setServicios] = useAtom(aulasAtom);

  const aulaService = useMemo(() => AulaService(), []);

  const parseError = (result: any): string => {
    const msg = result?.error || result?.metadata?.message || '';
    if (msg.includes('Duplicate')) return 'Ya existe';
    return msg || 'Error desconocido';
  };

  const execute = useCallback(async (opcion: string, body: any = {}) => {
    if (!credentials?.login) throw new Error('No autenticado');
    setLoading(true); setError(null);
    try {
      const result = await aulaService.callAulaApi(
        'POST',
        {
          accion: encodeBasicUrl(config.API_ADMIN_AULAS),
          opcion: encodeBasicUrl(opcion),
        },
        credentials as any,
        body
      );
      if (result.status === 'success') {
        if (result.data?.Aulas) setServicios(result.data.Aulas as any[]);
        return result;
      } else {
        const msg = parseError(result);
        setError(msg); throw new Error(msg);
      }
    } finally { setLoading(false); }
  }, [credentials, aulaService, setServicios]);

  // --- SERVICIOS (upc_aulas) ---
  const fetchServicios = useCallback(async (dependencia_id?: number) => {
    return execute('get_aulas', { dependencia_id });
  }, [execute]);

  const createServicio = useCallback(async (data: Partial<Aula> & { opciones?: string[] }) => {
    const res = await execute('add_aula', data);
    await fetchServicios(data.dependencia_id);
    return res;
  }, [execute, fetchServicios]);

  const updateServicio = useCallback(async (data: Partial<Aula> & { id: number }) => {
    const res = await execute('update_aula', data);
    await fetchServicios();
    return res;
  }, [execute, fetchServicios]);

  const deleteServicio = useCallback(async (id: number) => {
    const res = await execute('delete_aula', { id });
    await fetchServicios();
    return res;
  }, [execute, fetchServicios]);

  // --- OPCIONES (upc_aulas_opciones) ---
  const createOpcion = useCallback(async (data: Partial<Opcion>) => {
    const res = await execute('add_opcion', data);
    await fetchServicios(data.dependencia_id);
    return res;
  }, [execute, fetchServicios]);

  const updateOpcion = useCallback(async (data: Partial<Opcion> & { id: number }) => {
    const res = await execute('update_opcion', data);
    await fetchServicios();
    return res;
  }, [execute, fetchServicios]);

  const deleteOpcion = useCallback(async (id: number, dependencia_id?: number) => {
    const res = await execute('delete_opcion', { id });
    await fetchServicios(dependencia_id);
    return res;
  }, [execute, fetchServicios]);

  // Helpers
  const getServicioById = useCallback((id: number) =>
    servicios.find(s => Number(s.id) === Number(id)), [servicios]);

  const getOpcionesByServicio = useCallback((idAula: number) =>
    getServicioById(idAula)?.opciones || [], [getServicioById]);

  const opcionesFlat = useMemo(() =>
    servicios.flatMap(s => s.opciones || []), [servicios]);

  return {
    loading,
    error,
    servicios,
    opciones: opcionesFlat,
    fetchServicios,
    createServicio,
    updateServicio,
    deleteServicio,
    createOpcion,
    updateOpcion,
    deleteOpcion,
    getServicioById,
    getOpcionesByServicio,
    refresh: fetchServicios,
  };
}