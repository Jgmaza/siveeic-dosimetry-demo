import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  template: `
    <input 
      type="checkbox" 
      [checked]="isAllSelected"
      [indeterminate]="isIndeterminate"
      (change)="toggleAll()"
      style="cursor: pointer; transform: scale(1.2);"
    />
  `,
})
export class CheckboxHeaderComponent {
  @Input() isAllSelected: boolean = false;
  @Input() isIndeterminate: boolean = false;
  @Output() toggleAllEvent = new EventEmitter<void>();

  toggleAll(): void {
    this.toggleAllEvent.emit();
  }
}