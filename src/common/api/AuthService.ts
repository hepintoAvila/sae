// src/common/api/AuthService.ts
import BaseApiService, { UserCredentials, UrlConfig } from '@/common/api/BaseService';
import { AuthApiData, AuthServiceResponse, UserProps } from '@/types/User';
import { encodeBasicUrl, config } from '@/common';
// Definición de la interfaz del servicio de autenticación
export interface AuthServiceInterface {
  authenticateUser: (values: UserProps) => Promise<AuthServiceResponse>;
}
const AuthService = (): AuthServiceInterface => {
  const authenticateUser = async (values: UserProps): Promise<AuthServiceResponse> => {
    if (!values || !values.login || !values.password) {
      return {
        status: 'error',
        error: 'Las credenciales de usuario son requeridas.',
        metadata: { statusCode: 400, type: 'error', message: 'Credenciales incompletas' }
      };
    }
    const urlConfig: UrlConfig = {
      exec: 'admin_login',
      _SPIP_PAGE: 'admin_login',
      accion: encodeBasicUrl(config.API_ACCION_AUTH),
      opcion: encodeBasicUrl(config.API_OPCION_AUTH),
      action: 'true',
      var_ajax: 'form',
      bonjour: 'oui',
    };
    const credentials: UserCredentials = {
      login: values.login,
      password: values.password,
    };
    const response = await BaseApiService.get<AuthApiData>(urlConfig, credentials);
    // No necesitamos ajustar la estructura si la interfaz AuthApiData ya es correcta
    // response.data ya es del tipo AuthApiData (Auth, Permisos, Menu)
    return response;
  };
  return {
    authenticateUser,
  };
};
export default AuthService;