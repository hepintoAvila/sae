// src/hooks/useAulas.ts
import { useState, useCallback, useContext, useMemo } from 'react';
import { atom, useAtom } from 'jotai';
import { Aula, Prestamo, UserProps, PrestamoBodyData, AulaUrlOptions, EquipoInventario, Dependencia } from '@/types/aulas';
import AulaService from '@/common/api/AulaService';
import { AuthContext, config, encodeBasicUrl } from '@/common';
//import { co } from 'node_modules/@fullcalendar/core/internal-common';

const aulasAtom = atom<Aula[]>([]);
const prestamosAtom = atom<Prestamo[]>([]);
const inventarioAtom = atom<EquipoInventario[]>([]);
const dependenciasAtom = atom<Dependencia[]>([]);

export default function useAulas() {

  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error('AuthContext no está disponible');

  const { credentials } = authContext;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aulas, setAulas] = useAtom(aulasAtom);
  const [prestamos, setPrestamos] = useAtom(prestamosAtom);
  const [inventario, setInventario] = useAtom(inventarioAtom);
  const [dependencias, setDependencias] = useAtom(dependenciasAtom); // Puedes crear un atom para dependencias si lo necesitas globalmente
  // Instancia memoizada del servicio
  const aulaService = useMemo(() => AulaService(), []);

  // Helper para limpiar errores de SPIP
const parseError = (result: any): string => {
  const code = result?.metadata?.statusCode;
  const msg = result?.error || result?.metadata?.message || '';

  if (code === 409 || msg.includes('Duplicate')) {
    return 'Ya existe un préstamo con esos datos. No envíes ID al crear.';
  }
  if (code === 401) return 'No autorizado. Revisa credenciales.';
  return msg || 'Error desconocido';
};

  const executeRequest = useCallback(async (
    method: 'GET' | 'POST',
    urlOptions: AulaUrlOptions,
    bodyData: any = null
  ) => {
    if (!credentials?.login) {
      throw new Error('Usuario no autenticado');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await aulaService.callAulaApi(
        method,
        urlOptions,
        credentials as UserProps,
        bodyData
      );
          //console.log('[useAulas] API result:', result);  
      if (result.status === 'success') {
        // Actualiza atoms solo si vienen datos
        if (result.data?.Aulas) setAulas(result.data.Aulas);
        if (result.data?.Prestamos) setPrestamos(result.data.Prestamos);
        if (result.data?.Inventario ) setInventario(result.data.Inventario);
        if (result.data?.Dependencias ) setDependencias(result.data.Dependencias);
        return result.data;
      } else {
        const msg = parseError(result);
        setError(msg);
        throw new Error(msg);
      }
    } catch (err: any) {
      const msg = err.message || 'Error de red';
      setError(msg);
      console.error('[useAulas]', msg, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [credentials, aulaService, setAulas, setPrestamos, setInventario, setDependencias]);

  // --- CRUD ---

  const fetchAulas = useCallback(async () => {
    return executeRequest('POST', {
      accion: encodeBasicUrl(config.API_ADMIN_AULAS),
      opcion: encodeBasicUrl(config.API_OPCION_GET_PUBLIC_AULAS),
    }, {});
  }, [executeRequest]);

  const createPrestamo = useCallback(async (data: PrestamoBodyData) => {
    // IMPORTANTE: no envíes id si es nuevo, deja que MySQL lo autoincremente
    const { id,...payload } = data;
    const body = {
     ...payload,
      // si tu API requiere id=0 para nuevo
     ...(id? { id } : {})
    };

    return executeRequest('POST', {
      accion: encodeBasicUrl(config.API_ACCION_PRESTAMO),
      opcion: encodeBasicUrl(config.API_OPCION_CREATE_PRESTAMO),
    }, body);
  }, [executeRequest]);

  const updatePrestamo = useCallback(async (data: PrestamoBodyData) => {
    if (!data.id) throw new Error('ID requerido para actualizar');

    return executeRequest('POST', {
      accion: encodeBasicUrl(config.API_ACCION_PRESTAMO),
      opcion: encodeBasicUrl(config.API_OPCION_UPDATE_PRESTAMO),
    }, data);
  }, [executeRequest]);

  const deletePrestamo = useCallback(async ({ id, serie_id, dependencia_id,modo }: { id: string | number, serie_id: string | number, dependencia_id: string | number, modo: string }) => {
    return executeRequest('POST', {
      accion: encodeBasicUrl(config.API_ACCION_PRESTAMO),
      opcion: encodeBasicUrl(config.API_OPCION_DELETE_PRESTAMO),
    }, { id, serie_id, dependencia_id ,modo } as any);
  }, [executeRequest]);

  // Para compatibilidad con tu código anterior
  const sendAulasRequest = createPrestamo;
  const updateAulasRequest = updatePrestamo;

  return {
    loading,
    error,
    dependencias,
    aulas,
    prestamos,
    inventario,
    fetchAulas,
    createPrestamo,
    updatePrestamo,
    deletePrestamo,
    sendAulasRequest, // alias
    updateAulasRequest, // alias
    refresh: fetchAulas,
  };
}