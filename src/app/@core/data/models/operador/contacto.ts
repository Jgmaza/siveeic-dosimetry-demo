import { TipoIdentificacion } from '../tipo_identificacion';
import { TipoEstado } from '../tipo_estado';

export class Contacto {
  Id: number;
  Operador: number;
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
