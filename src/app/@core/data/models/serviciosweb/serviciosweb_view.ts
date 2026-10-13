import { TipoEstado } from '../tipo_estado';

export interface ServiciowebView {
  Id: number;
  Nombre: string;
  Servidor: string;
  Parametros: string;
  Peticion: string;
  Uso: string;
  Abreviatura: string;
  Fechacreacion: Date;
  Estado: Array<TipoEstado>;
  Usuarioreporta: number;
}