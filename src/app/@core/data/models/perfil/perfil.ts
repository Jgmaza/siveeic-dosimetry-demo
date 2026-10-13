/*export interface Operador {
}
*/
import { TipoEstado } from '../tipo_estado';
import { Enlace } from '../menu/enlace';
import { Rol } from './rol';

export class Perfil {
  Id: number;
  Rol: Array<Rol>;
  Enlace: Array<Enlace>;
  Fechacreacion: Date;
  Estado: Array<TipoEstado>;
}