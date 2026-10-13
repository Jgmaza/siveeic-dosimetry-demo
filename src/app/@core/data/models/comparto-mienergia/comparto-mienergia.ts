import { TipoEstado } from '../tipo_estado';
import { CicloFactura } from './cicloFactura';
import { Servicio } from './servicioPublico';

export class Compartomienergia {
  Id: number;
  Operador: number;
  Periodo: string;
  Servicio_publico:  Array<Servicio>;
  Total_recaudo: string;
  Fuente_aportes: string;
  Cantidad_beneficiarios_estrato1: string;
  Cantidad_beneficiarios_estrato2: string;
  Observacion: string;
  Ciclo_facturacion:  Array<CicloFactura>;
  Fechacreacion: Date;
  Usuarioreporta: string;
}
