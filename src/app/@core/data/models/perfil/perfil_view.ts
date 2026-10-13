import { TipoEstado } from '../tipo_estado';
import { Enlace } from '../menu/enlace';
import { Rol } from './rol';

export class PerfilView {
  Id: number;
  Rol: Array<Rol>;
  Enlace: Array<Enlace>;
  Fechacreacion: Date;
  Estado: Array<TipoEstado>;
}