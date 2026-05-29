import BaseApiService, { UrlConfig } from '@/common/api/BaseService';
import { AuthContext, encodeBasicUrl } from '@/common';
import { useContext } from 'react';

export interface AlertaPayload {
  to: string;
  tipo: 'preaviso' | 'vencido';
  id_prestamo: string;
  titulo: string;
  fin: string;
}

export const AulasAlertService = () => {
  const sendAlerta = async (payload: AlertaPayload) => {
    const urlConfig: UrlConfig = {
      exec: 'admin_aulas',
      _SPIP_PAGE: 'admin_aulas',
      accion: encodeBasicUrl('admin_aulas'),
      opcion: encodeBasicUrl('sendAlerta'),
      action: 'true',
      var_ajax: 'form',
      bonjour: 'oui',
    };
      const authContext = useContext(AuthContext);
      if (!authContext) throw new Error('AuthContext no está disponible');
    
 const { credentials } = authContext;
    // BaseApiService.get ya maneja POST con credenciales vacías
    const response = await BaseApiService.post(urlConfig,{
      login: credentials?.login || '',
      password: credentials?.password || '',
    } , {
      to: String(payload.to),
      tipo: payload.tipo,
      id_prestamo: payload.id_prestamo,
      titulo: payload.titulo,
      fin: payload.fin,
    });

    return response;
  };

  return { sendAlerta };
};