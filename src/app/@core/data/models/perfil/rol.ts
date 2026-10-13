import { TipoEstado } from '../tipo_estado';

export class Rol {
  Id: number;
  Nombre: string;
  Descripcion: string;
  Fechacreacion: Date;
  Estado: Array<TipoEstado>;
}
