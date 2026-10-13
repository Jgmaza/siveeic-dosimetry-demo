import { TipoEstado } from '../tipo_estado';
import { Departamento } from '../departamento';
import { Municipio } from '../municipio';

export interface MedidoresView {
  Id: number;
  Idoperador: number;
  Periodo: string;
  Departamento: Array<Departamento>;
  Municipio: Array<Municipio>;
  Estadoreporte: Array<TipoEstado>;
  Fechacreacion: Date;
  Medidores: Array<any>;
}
