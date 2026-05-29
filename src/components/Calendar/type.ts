import { Dependencia } from "@/types/aulas";

// src/types/aulas.ts
export interface AulaChild {
  id: string | number;
  dependencia_id: string | number;
  title: string;
  className?: string;
  textClass?: string;
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
  id: string | number;
  title: string; // aulaId
  childId?: string | number;
  start: string | Date;
  end: string | Date;
  observaciones: string;
  className?: string | undefined;
  textClass?: string | undefined;
  email?: string | undefined;
  recurrencia?: string | undefined;
  serie_id?: string | undefined;
  dependencia_id?: string | number | undefined;
  statut?: string | undefined;
}

// Si usas Aulas como alias plural
export type Aulas = Aula;

export interface AulasApiData {
  Aulas: Aula[];
  Prestamos: Prestamo[];
  Dependencias: Dependencia[];
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
export type DependenciaBodyData = Partial<Dependencia>;
export type SendEvent = Prestamo;