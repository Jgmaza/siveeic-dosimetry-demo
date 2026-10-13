import { TipoIdentificacion } from './tipo_identificacion';
import { TipoUsuario } from './tipo_usuario';
import { TipoEstado } from './tipo_estado';
import { Coordinacion } from './coordinacion';

export class Usuario {
  Id: number;
  Nombres: string;
  Apellidos: string;
  Tipoidentificacion: Array<TipoIdentificacion>;
  Nroidentificacion: string;
  Usuario: string;
  Clave: string;
  Tipousuario: Array<TipoUsuario>;
  Estadousuario: Array<TipoEstado>;
  Fechacreacion: Date;
  Fechaexpira: Date;
  Indicativo: number;
  Telefonofijo: number;
  Celular: number;
  Coordinacionoperativa: Array<Coordinacion>;
  Sistema: string;
  Host: string;
}
