import { TipoEstado } from '../tipo_estado';

export interface TableroedaView {
  Id: number;
  Nombre: string;
  Descripcion: string;
  Puntoacceso: string;
  Servidor: string;
  Pagina: string;
  Servicio: string;
  Titulo: string;
  Nombredatos: string;
  Columnasnumericas: string;
  Columnascategoricas: string;
  Columnasfecha: string;
  Cajasnumeros: string;
  Graficos: string;
  Fechacreacion: Date;
  Estado: Array<TipoEstado>;
  Usuarioreporta: number;
}