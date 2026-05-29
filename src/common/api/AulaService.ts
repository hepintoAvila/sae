// src/common/api/AulaService.ts
import BaseApiService, { UserCredentials, UrlConfig } from '@/common/api/BaseService';
import { AulaServiceResponse, AulasApiData, UserProps, AulaUrlOptions } from '@/types/aulas';
import { encodeBasicUrl, config } from '@/common';


export interface AulaServiceInterface {
  callAulaApi: (
    method: 'GET' | 'POST',
    urlOptions: AulaUrlOptions,
    credentials: UserProps,
    bodyData?: any
  ) => Promise<AulaServiceResponse>;


  fetchPublicAulas: (credentials: UserProps) => Promise<AulaServiceResponse>;


  // Nuevos métodos útiles
  getAulas: (credentials: UserProps) => Promise<AulaServiceResponse>;
  createPrestamo: (credentials: UserProps, data: any) => Promise<AulaServiceResponse>;
  updatePrestamo: (credentials: UserProps, id: string | number, data: any) => Promise<AulaServiceResponse>;
  deletePrestamo: (credentials: UserProps, { id,serie_id,dependencia_id,modo }: { id: string | number, serie_id: string | number, dependencia_id: string | number, modo: string }) => Promise<AulaServiceResponse>;
}


const AulaService = (): AulaServiceInterface => {


  const buildUrlConfig = (urlOptions: AulaUrlOptions): UrlConfig => ({
    exec: 'admin_aulas',
    _SPIP_PAGE: urlOptions._SPIP_PAGE || 'admin_aulas',
    accion: urlOptions.accion,
    opcion: urlOptions.opcion,
    action: urlOptions.action?? 'true',
    var_ajax: urlOptions.var_ajax?? 'form',
    bonjour: urlOptions.bonjour?? 'oui',
  });


  const toUserCredentials = (credentials: UserProps): UserCredentials => {
    if (!credentials?.login ||!credentials?.password) {
      throw new Error('Credenciales incompletas');
    }
    return {
      login: credentials.login,
      password: credentials.password,
    };
  };


  const callAulaApi = async (
    method: 'GET' | 'POST',
    urlOptions: AulaUrlOptions,
    credentials: UserProps,
    bodyData: any = null
  ): Promise<AulaServiceResponse> => {
    try {
      const urlConfig = buildUrlConfig(urlOptions);
      const userCredentials = toUserCredentials(credentials);

      //console.log('[AulaService] Calling API with:', { method, urlConfig, bodyData,userCredentials: { login: userCredentials.login, password: userCredentials.password  }   });
      const response = method === 'GET'
       ? await BaseApiService.get<AulasApiData>(urlConfig, userCredentials)
        : await BaseApiService.post<AulasApiData>(urlConfig, userCredentials, bodyData);


      return response as AulaServiceResponse;


    } catch (error) {
      console.error('[AulaService] Error:', error);
      return {
        status: 'error',
        error: error instanceof Error? error.message : 'Error en AulaService',
        metadata: {
          statusCode: 500,
          type: 'error',
          message: String(error)
        }
      };
    }
  };


  // Carga pública inicial
  const fetchPublicAulas = async (credentials: UserProps): Promise<AulaServiceResponse> => {
    return callAulaApi(
      'POST',
      {
        accion: encodeBasicUrl(config.API_ADMIN_AULAS),
        opcion: encodeBasicUrl(config.API_OPCION_GET_PUBLIC_AULAS),
      },
      credentials,
      {} // SPIP espera POST vacío
    );
  };


  // Métodos específicos (más legibles que callAulaApi directo)
  const getAulas = (credentials: UserProps) =>
    fetchPublicAulas(credentials);


  const createPrestamo = (credentials: UserProps, data: any) =>
    callAulaApi(
      'POST',
      {
        accion: encodeBasicUrl(config.API_ADMIN_AULAS),
        opcion: encodeBasicUrl(config.API_OPCION_CREATE_PRESTAMO), // crea esta constante
      },
      credentials,
      data
    );


  const updatePrestamo = (credentials: UserProps, id: string | number, data: any) =>
    callAulaApi(
      'POST',
      {
        accion: encodeBasicUrl(config.API_ADMIN_AULAS),
        opcion: encodeBasicUrl(config.API_OPCION_UPDATE_PRESTAMO),
      },
      credentials,
      { id,...data }
    );


  const deletePrestamo = (credentials: UserProps, { id, serie_id ,dependencia_id,modo}: { id: string | number, serie_id: string | number, dependencia_id: string | number, modo: string }) =>
    callAulaApi(
      'POST',
      {
        accion: encodeBasicUrl(config.API_ADMIN_AULAS),
        opcion: encodeBasicUrl(config.API_OPCION_DELETE_PRESTAMO),
      },
      credentials,
      { id, serie_id ,dependencia_id,modo}
    );


  return {
    callAulaApi,
    fetchPublicAulas,
    getAulas,
    createPrestamo,
    updatePrestamo,
    deletePrestamo,
  };
};


export default AulaService;