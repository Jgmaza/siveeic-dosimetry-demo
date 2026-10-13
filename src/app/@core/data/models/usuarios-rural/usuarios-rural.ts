import { TipoEstado } from '../tipo_estado';
import { Departamento } from '../departamento';
import { Municipio } from '../municipio';
import { Solucion } from './solucion';
import { Fuente } from './fuentefinancia';

export class Usuariosrural {
  Id: number;
  Operador: number;
  Periodo: string;
  Departamento: Array<Departamento>;
  Municipio: Array<Municipio>;
  Vereda: string;
  Cantidad_Usuarios: string;
  Fuente_Financiacion:  Array<Fuente>;
  Tipo_Solucion:  Array<Solucion>;
  Fecha_inicio: Date;
  Latitud: string;
  Longitud: string;
  Altitud: string;
  Fechacreacion: Date;
  Usuarioreporta: string;
}
