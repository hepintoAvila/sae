// src/contexts/AulasContext.tsx
import React, { createContext, useContext, useEffect } from 'react';
import useAulasPublic from '@/hooks/useAulasPublic'; // Asegúrate de que la ruta sea correcta
import { Aula, Dependencia, EquipoInventario, Prestamo } from '@/types/aulas'; // Importa los tipos correctos
// Define el tipo para el estado del contexto
interface AulasContextType {
  aulas: Aula[]; // Sustituido 'any' por tu tipo de Aula
  prestamos: Prestamo[]; // Sustituido 'any' por tu tipo de Prestamo
  inventario: EquipoInventario[]; // Sustituido 'any' por tu tipo de EquipoInventario
  dependencias: Dependencia[]; // Sustituido 'any' por tu tipo de Dependencia
  loadingInitialData: boolean;
  errorInitialData: string | null;
  // Puedes añadir funciones para refrescar los datos si es necesario
  refetchInitialData: () => void; // Añadimos esta función para re-cargar
}
// Crea el Context
const AulasContext = createContext<AulasContextType | undefined>(undefined);
// Crea el Provider
export const AulasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Usamos useAulasPublic directamente para obtener los datos y estados
  const { 
    aulas, // Estos son directamente los `aulas` del hook
    prestamos, // Estos son directamente los `prestamos` del hook
    inventario, // Estos son directamente los `inventario` del hook, aunque no los exponemos en el contexto
    dependencias, // Estos son directamente los `dependencias` del hook, aunque no los exponemos en el contexto
    loading: loadingInitialData, // Renombramos 'loading' a 'loadingInitialData' para el Context
    error: errorInitialData, // Renombramos 'error' a 'errorInitialData' para el Context
    loadInitialPublicData: refetchInitialData // Renombramos para mejor semántica en el Context
  } = useAulasPublic();
  // useEffect para cargar los datos solo una vez al montar el Provider
  useEffect(() => {
    //console.log('AulasContext: Iniciando carga de datos públicos...');
    refetchInitialData(); // Llama a la función del hook para cargar los datos
  }, []); // El hook useCallback en useAulasPublic garantiza que refetchInitialData sea estable
  const contextValue: AulasContextType = {
    aulas,
    prestamos,
    inventario,
    dependencias,
    loadingInitialData,
    errorInitialData,
    refetchInitialData, // Exponemos la función para recargar datos
  };

  //console.log('AulasContext: Context value actualizado:', contextValue); // Log para depuración
  return (
    <AulasContext.Provider value={contextValue}>
      {children}
    </AulasContext.Provider>
  );
};
// Hook personalizado para usar el contexto
export const useAulasContext = () => {
  const ctx = useContext(AulasContext);
    if (!ctx) throw new Error('useAulasContext debe usarse dentro de AulasProvider');
  return ctx;
 
};