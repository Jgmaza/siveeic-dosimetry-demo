import { Injectable } from '@angular/core';

/** Clave estable para filas del histórico (local_id en enrg_reporte_dosimetria). */
export function historicoRowKey(row: any): string | null {
  if (!row) { return null; }
  const id = row.SelectedId || row.Id || row.id || row.local_id || row.ID;
  return id != null && String(id).trim() !== '' ? String(id).trim() : null;
}

/**
 * Selección acumulada para comunicado / historial dosimétrico (un trabajador anclado por cédula).
 */
@Injectable()
export class DosimetriaHistoricoSeleccionService {
  /** Cédula con la que se inició el caso (peticionario). */
  anchoredCedula: string | null = null;

  private selected = new Map<string, any>();

  get selectedCount(): number {
    return this.selected.size;
  }

  get selectedIds(): string[] {
    return Array.from(this.selected.keys());
  }

  setAnchor(cedula: string): void {
    const v = (cedula || '').trim();
    this.anchoredCedula = v || null;
  }

  clearAnchor(): void {
    this.anchoredCedula = null;
  }

  clearSelection(): void {
    this.selected.clear();
  }

  resetCase(): void {
    this.clearAnchor();
    this.clearSelection();
  }

  syncFromRow(row: any): void {
    const key = historicoRowKey(row);
    if (!key) { return; }
    if (row.Selected) {
      this.selected.set(key, row);
    } else {
      this.selected.delete(key);
    }
  }

  applyToRow(row: any): void {
    const key = historicoRowKey(row);
    if (!key) {
      row.Selected = false;
      row.SelectedId = null;
      return;
    }
    if (this.selected.has(key)) {
      row.Selected = true;
      row.SelectedId = key;
    } else {
      row.Selected = false;
      row.SelectedId = null;
    }
  }

  /** Fusiona resultados nuevos con filas ya seleccionadas que no vienen en la consulta actual. */
  mergeResultRows(data: any[]): any[] {
    const getKey = historicoRowKey;
    const inNew = new Set(data.map((d) => getKey(d)).filter(Boolean) as string[]);

    data.forEach((d) => this.applyToRow(d));

    const carryOver: any[] = [];
    this.selected.forEach((row, key) => {
      if (!inNew.has(key)) {
        const copy = { ...row, Selected: true, SelectedId: key };
        carryOver.push(copy);
      }
    });

    const merged = [...carryOver, ...data];
    const seen = new Set<string>();
    return merged.filter((r) => {
      const k = getKey(r);
      if (!k || seen.has(k)) { return false; }
      seen.add(k);
      return true;
    });
  }
}
