import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
  selector: 'app-checkbox-render',
  template: `
    <div class="hu10-checkbox-cell"
         (click)="blockRowClick($event)"
         (mousedown)="blockRowClick($event)"
         (mouseup)="blockRowClick($event)">
      <input
        type="checkbox"
        [checked]="checked"
        (click)="blockRowClick($event)"
        (change)="onToggle($event)"
        aria-label="Seleccionar fila"
        style="transform: scale(1.2); cursor: pointer;"
      />
    </div>
  `,
})
export class CheckboxRenderComponent implements ViewCell, OnInit {
  @Input() value: any;     // valor de la celda
  @Input() rowData: any;   // datos completos de la fila
  @Output() save = new EventEmitter<any>();

  checked = true;          // ✅ marcado por defecto

  ngOnInit(): void {
    // Si no existe marca previa, dejar seleccionada por defecto
    if (this.rowData.Selected === undefined) {
      this.rowData.Selected = false;
    }
    this.checked = !!this.rowData.Selected;

    // Mantener SelectedId consistente
    this.rowData.SelectedId = this.checked ? (this.rowData.Id || this.rowData.id) : null;
  }

  /** Evita que el clic del checkbox dispare userRowSelect → modal. */
  blockRowClick(ev: Event): void {
    if (ev) {
      ev.stopPropagation();
      if (ev.stopImmediatePropagation) { ev.stopImmediatePropagation(); }
    }
    if (this.rowData) {
      this.rowData.__hu10SkipModalAt = Date.now();
    }
  }

  onToggle(ev: Event) {
    this.blockRowClick(ev);
    const isChecked = (ev.target as HTMLInputElement).checked;
    this.checked = isChecked;
    this.rowData.Selected = isChecked;
    this.rowData.SelectedId = isChecked ? (this.rowData.Id || this.rowData.id) : null;
    this.save.emit(this.rowData);
  }
}
