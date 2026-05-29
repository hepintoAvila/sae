// src/hooks/useDependencias.ts
import { useState, useCallback, useContext, useMemo } from 'react';
import { atom, useAtom } from 'jotai';
import { Dependencia } from '@/types/aulas';
import AulaService from '@/common/api/AulaService';
import { AuthContext, config, encodeBasicUrl } from '@/common';

const dependenciasAtom = atom<Dependencia[]>([]);

export default function useDependencias() {
  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error('AuthContext no está disponible');

  const { credentials } = authContext;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dependencias, setDependencias] = useAtom(dependenciasAtom);

  const aulaService = useMemo(() => AulaService(), []);

  const parseError = (result: any): string => {
    const code = result?.metadata?.statusCode;
    const msg = result?.error || result?.metadata?.message || '';
    if (code === 409 || msg.includes('Duplicate')) return 'El código ya existe';
    if (code === 401) return 'No autorizado';
    return msg || 'Error desconocido';
  };

  const executeRequest = useCallback(async (
    method: 'GET' | 'POST',
    urlOptions: any,
    bodyData: any = null
  ) => {
    if (!credentials?.login) throw new Error('Usuario no autenticado');

    setLoading(true);
    setError(null);

    try {
      const result = await aulaService.callAulaApi(
        method,
        urlOptions,
        credentials as any,
        bodyData
      );

      if (result.status === 'success') {
        if (result.data?.Dependencias) {
          setDependencias(result.data.Dependencias);
        }
        return result;
      } else {
        const msg = parseError(result);
        setError(msg);
        throw new Error(msg);
      }
    } catch (err: any) {
      const msg = err.message || 'Error de red';
      setError(msg);
      console.error('[useDependencias]', msg, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [credentials, aulaService, setDependencias]);

  // --- CRUD ---

  const fetchDependencias = useCallback(async (all = false) => {
    return executeRequest('POST', {
      accion: encodeBasicUrl(config.API_ADMIN_AULAS),
      opcion: encodeBasicUrl('get_dependencias'),
    }, { all });
  }, [executeRequest]);

  const createDependencia = useCallback(async (data: Partial<Dependencia>) => {
    const { id,...payload } = data;
    return executeRequest('POST', {
      accion: encodeBasicUrl(config.API_ADMIN_AULAS),
      opcion: encodeBasicUrl('add_dependencia'),
    }, payload);
  }, [executeRequest]);

  const updateDependencia = useCallback(async (data: Partial<Dependencia> & { id: number }) => {
    if (!data.id) throw new Error('ID requerido');
    return executeRequest('POST', {
      accion: encodeBasicUrl(config.API_ADMIN_AULAS),
      opcion: encodeBasicUrl('update_dependencia'),
    }, data);
  }, [executeRequest]);

  const deleteDependencia = useCallback(async (id: number) => {
    return executeRequest('POST', {
      accion: encodeBasicUrl(config.API_ADMIN_AULAS),
      opcion: encodeBasicUrl('delete_dependencia'),
    }, { id });
  }, [executeRequest]);

  // Helpers
  const getById = useCallback((id: number) =>
    dependencias.find(d => Number(d.id) === Number(id)), [dependencias]);

  const getByCodigo = useCallback((codigo: string) =>
    dependencias.find(d => d.codigo === codigo), [dependencias]);

  return {
    loading,
    error,
    dependencias,
    fetchDependencias,
    createDependencia,
    updateDependencia,
    deleteDependencia,
    getById,
    getByCodigo,
    refresh: fetchDependencias,
  };
}