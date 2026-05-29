// src/types/aulas.ts
export interface AulaChild {
  id: string | number;
  dependencia_id: string | number;
  title: string;
  className?: string;
  textClass?: string;
  stock?: string;
}

export interface Aula {
  id: string | number;
  dependencia_id: string | number;
  title: string;
  className?: string;
  textClass?: string;
  children?: AulaChild[]; // <- AGREGA ESTO
}

export interface Prestamo {
  aula: any;
  salle: any;
  id: string | number;
  title: string; // aulaId
  start: string | Date;
  end: string | Date;
  observaciones: string;
  className?: string;
  textClass?: string;
  email?: string;
  recurrencia?: string;
  serie_id?: string | undefined;
  dependencia_id: number;
  childId?: string;      // este es tu opcion_id original
  equipo_id?: number;
  statut?: string;
}
export interface EquipoInventario {
  id: number;
  opcion_id: number;           // FK a upc_aulas_opciones.id (7 = Tablets)
  serial: string;
  marca: string;               // default 'Samsung'
  modelo: string;              // default 'Galaxy Tab A8'
  codigo_interno?: string | null;
  estado: 'Disponible' | 'Prestado' | 'Mantenimiento' | 'Baja';
  observaciones?: string | null;
  dependencia_id?: string | null;
  maj: string;                 // datetime ISO
};
export interface Dependencia {
  id: number;
  nombre: string;
  sede: string;               // default 'Samsung'
  ciudad: string;              // default 'Galaxy Tab A8'
  codigo?: string | null;
  color_primary?: string | null;                // datetime ISO
};
// para la respuesta del API
export type InventarioResponse = {
  status: number;
  data: EquipoInventario[];
};
// Si usas Aulas como alias plural
export type Aulas = Aula;

export interface AulasApiData {
  Dependencias: Dependencia[];
  Aulas: Aula[];
  Prestamos: Prestamo[];
  Inventario: EquipoInventario[];
}

export interface AulaServiceResponse {
  status: 'success' | 'error';
  data?: AulasApiData;
  error?: string | null;
  metadata?: {
    statusCode: number;
    type: string;
    message: string;
  };
}

export interface UserProps {
  login: string;
  password: string;
}
export interface Credentials {
  login: string;
  password: string;
}
export interface AulaUrlOptions {
  accion: string;
  opcion: string;
  _SPIP_PAGE?: string;
  action?: string;
  var_ajax?: string;
  bonjour?: string;
}

export type AulaBodyData = Partial<Aula>;
export type PrestamoBodyData = Partial<Prestamo>;
export type InventarioBodyData = Partial<EquipoInventario>;
export type DependenciaBodyData = Partial<Dependencia>;
export type SendEvent = Prestamo;