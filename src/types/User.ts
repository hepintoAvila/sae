// src/types/User.ts
import { BaseServiceResponse } from "@/common/api/BaseService";
export interface AuthData {
  Nom: string;
  Email: string;
  Rol: string;
  status: string;
  AppKey: string;
  dependencia_id: string;
}

export interface Permiso {
  menu: string;
  submenu: string;
  query: 'S' | 'N';
  add: 'S' | 'N';
  update: 'S' | 'N';
  delete: 'S' | 'N';
  // ... otras propiedades de Permiso
}
export interface MenuItem {
  key: string;
  label: string;
  isTitle?: boolean;
  children?: MenuItem[];
  icon?: string;
  badge?: {
    variant: string;
    text: string;
  };
  parentKey?: string;
}
// Contenido de la data de la API para Autenticación
// ¡Esta es la corrección! Ahora AuthApiData representa solo el contenido del 'data' del JSON.
export interface AuthApiData { // Eliminamos status, type, message y la propiedad anidada 'data'
  Auth: AuthData;
  Permisos: Permiso[];
  Menu: MenuItem[];
}
// Nueva interfaz para la respuesta del servicio de autenticación
export interface AuthServiceResponse extends BaseServiceResponse<AuthApiData> {}
// El tipo de UserProps ya lo tenías, lo mantengo por consistencia
export interface UserProps {
  login: string;
  password: string;
}