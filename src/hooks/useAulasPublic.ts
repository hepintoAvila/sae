// src/hooks/useAulasPublic.ts
import { useCallback, useState } from 'react';
import AulaService from '../common/api/AulaServicePublic'; // Importa el AulaService refactorizado
import { Credentials, Dependencia, EquipoInventario } from '@/types/aulas';
//import { Credentials } from '@/types';
// Asegúrate de la ruta correcta para UserProps
const useAulasPublic = () => {
  const [aulas, setAulas] = useState<any[]>([]);
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [inventario, setInventario] = useState<EquipoInventario[]>([]);
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Definir urlObjet y bodyData aquí, ya que son parte de la configuración de esta llamada
   //const bodyData = {}; // Si no hay body, deja un objeto vacío
  // Instanciar el servicio con los parámetros fijos (urlObjet y bodyData)
  const aulasServiceInstance = AulaService(); 
 
  const loadInitialPublicData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const GUEST_CREDENTIALS: Credentials = { // Asegúrate de que UserProps es correcto
         login: import.meta.env.VITE_API_USERNAME,
          password: import.meta.env.VITE_API_PASSWORD,
        };
        
        const result = await aulasServiceInstance.fetchPublicAulas(GUEST_CREDENTIALS); // Usar la nueva función
        //console.log("Public data fetch result:", result);
      // guard against unexpected typings from the service
      const resData = (result as any)?.data;
      if (result && (result as any).status === 'success' && resData && typeof resData === 'object') {
        setAulas(resData.Aulas || []); // Asegúrate de que es result.data.Aulas
        setPrestamos(resData.Prestamos || []); // Asegúrate de que es result.data.Prestamos
        setInventario(resData.Inventario || []); // Asegúrate de que es result.data.Inventario
        setDependencias(resData.Dependencias || []); // Asegúrate de que es result.data.Dependencias
        
      } else {
        setError((result as any)?.error || 'Failed to fetch public data');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [aulasServiceInstance]); // Dependencia del servicio
  //console.log('useAulasPublic', inventario);
  return {
    dependencias,
    aulas,
    prestamos,
    inventario,
    loading,
    error,
    loadInitialPublicData,
  };
};
export default useAulasPublic;