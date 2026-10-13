/*export interface Operador {
}
*/
import { TipoIdentificacion } from '../tipo_identificacion';
import { TipoEstado } from '../tipo_estado';
import { TipoOperador } from './tipo_operador';
import { TipoPersona } from './tipo_persona';
import { Departamento } from '../departamento';
import { Municipio } from '../municipio';

export class Estaciones {
  Id: number;
  Nombres: string;
  Tipoidentificacion: Array<TipoIdentificacion>;
  Nroidentificacion: string;
  Tipopersona: Array<TipoPersona>;
  Tipooperador: Array<TipoOperador>;
  Estadooperador: Array<TipoEstado>;
  Departamento: Array<Departamento>;
  Municipio: Array<Municipio>;
  Fechacreacion: Date;
  Indicativo: number;
  Telefonofijo: number;
  Celular: number;
  Direccion: string;
}
