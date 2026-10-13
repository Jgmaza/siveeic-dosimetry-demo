import { TipoEstado } from '../tipo_estado';

export interface ApireporteView {
  Id: number;
  Nombre: string;
  Puntoacceso: string;
  Descripcion: string;
  Consultadb: string;
  Parametros: string;
  Tratamiento: string;
  Fechacreacion: Date;
  Estado: Array<TipoEstado>;
  Usuarioreporta: number;
}