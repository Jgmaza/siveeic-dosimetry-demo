import { TipoEstado } from '../tipo_estado';
import { Grupo } from './grupo';

export class EnlaceView {
  Id: number;
  Grupo: Array<Grupo>;
  Nombre: string;
  Posicion: string;
  Titulo: string;
  Enlace: string;
  Key: string;
  Fechacreacion: Date;
  Estado: Array<TipoEstado>;
}