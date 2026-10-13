import { TipoEstado } from '../tipo_estado';

export class Parametro {
  Id: number;
  Nombre: string;
  Tipo: string;
  Descripcion: string;
  Fechacreacion: Date;
  Estado: Array<TipoEstado>;
}
