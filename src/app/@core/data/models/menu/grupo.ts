import { TipoEstado } from '../tipo_estado';

export class Grupo {
  Id: number;
  Nombre: string;
  Posicion: string;
  Titulo: string;
  Icono: string;
  Home: string;
  Key: string;
  Grupopadre: string;
  Fechacreacion: Date;
  Estado: Array<TipoEstado>;
}
