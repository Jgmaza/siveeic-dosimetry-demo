import { TipoEstado } from '../tipo_estado';
import { CicloFactura } from './cicloFactura';
import { Servicio } from './servicioPublico';

export interface CompartomienergiaView {
  Id: number;
  Operador: number;
  Periodo: string;
  Servicio_publico:  Array<Servicio>;
  Total_recaudo: string;
  Fuente_aportes: string;
  Ciclo_facturacion:  Array<CicloFactura>;
  Cantidad_beneficiarios_estrato1: string;
  Cantidad_beneficiarios_estrato2: string;
  Observacion: string;
  Fechacreacion: Date;
  Usuarioreporta: string;
}
