// src/common/api/initialDataService.ts (o apiClients.ts)
//import { config, encodeBasicUrl } from '@/common'; // Asegúrate de la ruta correcta

import { Aula, Credentials, Prestamo } from '@/types/aulas'; // Importa los tipos correctos para Aula y Prestamo
import AulaServicePublic from './AulaServicePublic';
//import { co } from 'node_modules/@fullcalendar/core/internal-common';

// Define las credenciales fijas para la consulta inicial de datos públicos
const GUEST_CREDENTIALS: Credentials = {
  login: import.meta.env.VITE_API_USERNAME,
  password: import.meta.env.VITE_API_PASSWORD,
};
// Interfaz para el tipo de retorno de esta función
interface PublicAulasDataResult {
  aulas: Aula[];
  prestamos: Prestamo[];
}
// Función para obtener los datos públicos al inicio
export async function fetchPublicAulasData(): Promise<PublicAulasDataResult> {
  try {
    // Instancia AulaService sin parámetros en el constructor
    const aulasService = AulaServicePublic(); 
    // Llama a la función fetchPublicAulas
    const result = await aulasService.fetchPublicAulas(GUEST_CREDENTIALS);
    //console.log("fetchPublicAulasData: Resultado de fetchPublicAulas:", result); // Log para depuración 
    if (result.status === 'success' && result.data) {
      return {
        aulas: result.data.Aulas, // Accede a .aulas directamente desde result.data
        prestamos: result.data.Prestamos, // Accede a .prestamos directamente desde result.data
      };
    } else {
      // Manejar el caso donde el resultado no es un éxito (ej. error o datos nulos)
      throw new Error(result.error || result.metadata?.message || 'Fallo al obtener datos públicos');
    }
  } catch (err: any) {
    console.error("Error fetching public aulas data:", err);
    // Relanzar el error para que el consumidor pueda manejarlo
    throw err; 
  }
}