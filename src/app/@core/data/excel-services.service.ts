import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import * as XLSXStyle from 'xlsx-js-style';
import {
  COLUMNAS_DOSIS_ANUAL,
  COLUMNAS_DOSIS_MENSUAL,
  superaUmbral,
  tipoEstudioDesdeFila,
} from '../../pages/dosimetria/dosimetria-umbrales.util';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

const STYLE_ALERTA = {
  font: { color: { rgb: 'FF0000' }, bold: true },
};

@Injectable({
  providedIn: 'root',
})
export class ExcelServicesService {
  constructor() { }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  /**
   * HU-10 §3.2.1.1 / §3.2.1.2: Excel resumen con texto rojo en V–AG / AH
   * según Columna T (Tipo_dosimetro). Sin T → umbrales Cuerpo Entero.
   */
  public exportAsExcelFileConUmbrales(json: any[], excelFileName: string): void {
    if (!json || !json.length) {
      this.exportAsExcelFile(json || [], excelFileName);
      return;
    }

    // Preserva orden de claves de la primera fila (formato A–AJ si viene ordenado).
    const headers = Object.keys(json[0]);
    const worksheet: any = XLSXStyle.utils.json_to_sheet(json, { header: headers });
    const mensualIdx: number[] = [];
    const anualIdx: number[] = [];

    headers.forEach((h, idx) => {
      if (COLUMNAS_DOSIS_MENSUAL.indexOf(h) >= 0) {
        mensualIdx.push(idx);
      }
      // AH = Hp_Acumulado (no Total_mSv en el formato de 36 columnas)
      if (h === 'Hp_Acumulado' || h === 'Hp_acumulado') {
        anualIdx.push(idx);
      } else if (COLUMNAS_DOSIS_ANUAL.indexOf(h) >= 0 && h === 'Total_mSv') {
        // solo si el export aún incluye Total_mSv
        anualIdx.push(idx);
      }
    });

    for (let r = 0; r < json.length; r++) {
      const row = json[r];
      const tipo = tipoEstudioDesdeFila(row);
      const excelRow0 = r + 1; // 0-based sheet row (row 0 = header)

      for (let i = 0; i < mensualIdx.length; i++) {
        const colIdx = mensualIdx[i];
        const key = headers[colIdx];
        if (superaUmbral(row[key], tipo, 'mensual')) {
          this.applyRedCell(worksheet, excelRow0, colIdx);
        }
      }
      for (let j = 0; j < anualIdx.length; j++) {
        const colIdx = anualIdx[j];
        const key = headers[colIdx];
        if (superaUmbral(row[key], tipo, 'anual')) {
          this.applyRedCell(worksheet, excelRow0, colIdx);
        }
      }
    }

    const workbook: any = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSXStyle.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private applyRedCell(worksheet: any, row0Based: number, col0Based: number): void {
    const addr = XLSXStyle.utils.encode_cell({ r: row0Based, c: col0Based });
    const cell = worksheet[addr];
    if (!cell) { return; }
    cell.s = Object.assign({}, cell.s || {}, STYLE_ALERTA);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, 'Reporte_' + fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }
}
