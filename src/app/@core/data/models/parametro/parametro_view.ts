import { TipoEstado } from '../tipo_estado';

export interface ParametroView {
  Id: number;
  Nombre: string;
  Tipo: string;
  Descripcion: string;
  Fechacreacion: Date;
  Estado: Array<TipoEstado>;
}