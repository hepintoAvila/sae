// src/common/api/BaseService.ts
// ==========================================================
// 1. Tipos Comunes y Interfaces
// ==========================================================
export interface ServiceMetadata {
  statusCode: number;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export interface BaseServiceResponse<TData> {
  status: 'success' | 'error';
  data?: TData | null;
  error?: string | null;
  metadata?: ServiceMetadata;
}

export interface UserCredentials {
  login: string;
  password: string;
}

export interface UrlConfig {
  exec: string;
  _SPIP_PAGE: string;
  action?: string;
  var_ajax?: string;
  bonjour?: string;
  accion: string;
  opcion: string;
}

interface CustomHeaders {
  [key: string]: string;
}

// ==========================================================
// 2. Función genérica para realizar llamadas a la API
// ==========================================================
const API_BASE_URL = import.meta.env.DEV
 ? '/api2025' // usa el proxy en desarrollo
  : (import.meta.env.VITE_API_URL || 'https://biblioteca.unicesar.edu.co/api2025');
const DEFAULT_TIMEOUT = 15000; // 15s

async function callApi<TData>(
  method: 'GET' | 'POST',
  urlConfig: UrlConfig,
  credentials: UserCredentials,
  bodyData: any = null,
  customHeaders: CustomHeaders = {}
): Promise<BaseServiceResponse<TData>> {
  const token = localStorage.getItem('authToken');
  
  const params = new URLSearchParams({
    exec: urlConfig.exec,
    _SPIP_PAGE: urlConfig._SPIP_PAGE,
    action: urlConfig.action || 'true',
    var_ajax: urlConfig.var_ajax || 'form',
    bonjour: urlConfig.bonjour || 'oui',
    accion: urlConfig.accion,
    opcion: urlConfig.opcion,
  });

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...customHeaders,
  };

  // Solo añade Basic Auth si hay credenciales
  if (credentials?.login && credentials?.password) {
    try {
      headers['Authorization'] = `Basic ${btoa(`${credentials.login}:${credentials.password}`)}`;
    } catch (e) {
      console.warn('Error codificando credenciales', e);
    }
  }

  if (token) {
    headers['x-sices-api-apikey'] = token;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  const requestOptions: RequestInit = {
    method,
    headers,
    credentials: 'include',
    signal: controller.signal,
  };

  if (method === 'POST' && bodyData !== null) {
    requestOptions.body = JSON.stringify(bodyData);
  }

  const url = `${API_BASE_URL}/?${params.toString()}`;

  try {
    //console.log(`[API] ${method} ${url}`);
    const response = await fetch(url, requestOptions);
    clearTimeout(timeoutId);

    // 1. 204 No Content
    if (response.status === 204) {
      return {
        status: 'success',
        data: null,
        metadata: { statusCode: 204, type: 'success', message: 'No content' }
      };
    }

    const responseText = await response.text();
    //console.log('[API] Raw response:', responseText.substring(0, 500));

    // 2. DETECTAR JSON DOBLE - tu bug principal
    let jsonText = responseText.trim();
    
    // Si hay dos JSON pegados, toma el último (el exitoso)
    if (jsonText.includes('}{')) {
      //console.warn('[API] Detectados múltiples JSON concatenados, extrayendo el último');
      const parts = jsonText.split('}{');
      // Reconstruir el último JSON válido
      jsonText = '{' + parts[parts.length - 1];
      if (!jsonText.startsWith('{')) {
        jsonText = '{' + jsonText;
      }
    }

    let result: any;
    try {
      result = jsonText ? JSON.parse(jsonText) : {};
    } catch (parseError) {
      console.error('[API] JSON parse error:', parseError, 'Texto:', jsonText);
      return {
        status: 'error',
        error: 'Respuesta del servidor no es JSON válido',
        metadata: {
          statusCode: response.status,
          type: 'error',
          message: `Parse error: ${responseText.substring(0, 100)}`
        }
      };
    }
// después de desempaquetar payload
const payload = (result?.data && 'status' in result.data)? result.data : result;

//console.log('[API] payload:', payload); // temporal para debug

// SPIP usa status 200 aunque haya error, hay que mirar type
const isSuccess = payload?.status === 200 && payload?.type === 'success';

if (isSuccess) {
  return {
    status: 'success',
    data: payload.data as TData,
    metadata: {
      statusCode: payload.status,
      type: payload.type,
      message: payload.message || 'OK'
    }
  };
} else {
  // aquí entra tu caso
  const errorMessage = payload?.message || payload?.error || 'Error desconocido';
  const errorCode = payload?.status || response.status;

  //console.warn('[API] Error lógico con HTTP 200:', errorMessage);

  return {
    status: 'error',
    error: errorMessage,
    metadata: {
      statusCode: errorCode,
      type: payload?.type || 'error',
      message: errorMessage
    }
  };
}

  } catch (error) {
    clearTimeout(timeoutId);
    //console.error('[API] Error en fetch:', error);

    // Mejorar diagnóstico de Failed to fetch
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        status: 'error',
        error: 'La petición tardó demasiado (timeout)',
        metadata: { statusCode: 408, type: 'error', message: 'Timeout' }
      };
    }

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return {
        status: 'error',
        error: 'No se pudo conectar al servidor. Verifica tu conexión, CORS o que el backend esté activo.',
        metadata: { statusCode: 0, type: 'error', message: 'Network error' }
      };
    }

    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido',
      metadata: { statusCode: 500, type: 'error', message: String(error) }
    };
  }
}

// ==========================================================
// 3. Exportar servicio
// ==========================================================
const BaseApiService = {
  get: <TData>(urlConfig: UrlConfig, credentials: UserCredentials, customHeaders?: CustomHeaders) =>
    callApi<TData>('GET', urlConfig, credentials, null, customHeaders),
  
  post: <TData>(urlConfig: UrlConfig, credentials: UserCredentials, bodyData: any, customHeaders?: CustomHeaders) =>
    callApi<TData>('POST', urlConfig, credentials, bodyData, customHeaders),
};

export default BaseApiService;