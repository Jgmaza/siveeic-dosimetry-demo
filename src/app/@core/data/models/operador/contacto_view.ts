import { TipoIdentificacion } from '../tipo_identificacion';
import { TipoEstado } from '../tipo_estado';
import { Operador } from './operador';

export interface ContactoView {
  Id: number;
  Idoperador: number;
  Operador: Array<Operador>;
  Nombres: string;
  Apellidos: string;
  Tipoidentificacion: Array<TipoIdentificacion>;
  Nroidentificacion: string;
  Estadocontacto: Array<TipoEstado>;
  Fechacreacion: Date;
  Indicativo: number;
  Telefonofijo: number;
  Celular: number;
  Cargo: string;
}
