// src/hooks/useAulasPublic.ts
import { useCallback, useState } from 'react';
import { fetchPublicAulasData } from '@/common/api/initialDataService'; // Importa la nueva función de servicio
import { Aula, Prestamo } from '@/types/aulas'; // Importa los tipos correctos
const useAulasPublic = () => {
  const [aulas, setAulas] = useState<Aula[]>([]); // Tipado más específico
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]); // Tipado más específico
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  const loadInitialPublicData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        // Llama a la función del servicio centralizado
        const { aulas: fetchedAulas, prestamos: fetchedPrestamos } = await fetchPublicAulasData();
        
        setAulas(fetchedAulas);
        setPrestamos(fetchedPrestamos);
      
    } catch (err: any) {
      console.error("Error en useAulasPublic al cargar datos:", err); // Log más específico
      setError(err.message || 'An unexpected error occurred while loading public data');
    } finally {
      setLoading(false);
    }
  }, []); // Dependencias: ninguna, ya que fetchPublicAulasData es una función estática
  console.log('useAulasPublic - aulas:', prestamos);
  return {
    aulas,
    prestamos,
    loading,
    error,
    loadInitialPublicData,
  };
};
export default useAulasPublic;