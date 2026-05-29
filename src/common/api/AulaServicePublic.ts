// src/common/api/AulaService.ts
import BaseApiService, { UserCredentials, UrlConfig } from '@/common/api/BaseService';
import { AulaServiceResponse, AulasApiData, UserProps } from '@/types/aulas';
import { encodeBasicUrl, config } from '@/common';
// Interfaz para el servicio de aulas
export interface AulaServiceInterface {
  fetchPublicAulas: (credentials: UserProps) => Promise<AulaServiceResponse>;
}
// Ahora AulaService no necesita parámetros en su constructor si su lógica es fija
const AulaServicePublic = (): AulaServiceInterface => { // Ya no recibe urlObjetParam y bodyDataParam
  const fetchPublicAulas = async (credentials: UserProps): Promise<AulaServiceResponse> => {
    if (!credentials || !credentials.login || !credentials.password) {
      return {
        status: 'error',
        error: 'Las credenciales de usuario son requeridas.',
        metadata: { statusCode: 400, type: 'error', message: 'Credenciales incompletas' }
      };
    }
    // Los urlObjet y bodyData ahora se definen aquí, ya que son específicos de fetchPublicAulas
    const urlConfig: UrlConfig = {
      exec: 'admin_aulas',
      _SPIP_PAGE: config.API_ADMIN_AULAS,
      accion: encodeBasicUrl(config.API_ADMIN_AULAS),
      opcion: encodeBasicUrl(config.API_OPCION_GET_PUBLIC_AULAS),
      action: 'true',
      var_ajax: 'form',
      bonjour: 'oui',
    };
    const bodyData = {}; // Cuerpo vacío para esta llamada
    const userCredentials: UserCredentials = {
      login: credentials.login,
      password: credentials.password,
    };
    const response = await BaseApiService.post<AulasApiData>(urlConfig, userCredentials, bodyData);
    console.log('[AulaServicePublic] API response:', response);
    if (response.status === 'success' && response.data) {
        return {
           ...response,
            data: {
                Aulas: response.data.Aulas,
                Prestamos: response.data.Prestamos,
                Inventario: response.data.Inventario,
                Dependencias: response.data.Dependencias,
            }
        };
    }
    return response as AulaServiceResponse; // Aseguramos que el tipo de retorno es correcto
  };
  return {
    fetchPublicAulas,
  };
};
export default AulaServicePublic;