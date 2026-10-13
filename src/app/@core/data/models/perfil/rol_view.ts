import { TipoEstado } from '../tipo_estado';

export interface RolView {
  Id: number;
  Nombre: string;
  Descripcion: string;
  Fechacreacion: Date;
  Estado: Array<TipoEstado>;
}