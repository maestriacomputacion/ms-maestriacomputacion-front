import { Component, EventEmitter, Input, Output } from '@angular/core';

type OptionItem = { label: string; value: string };

@Component({
    selector: 'app-multi-select-chips',
    templateUrl: './multi-select-chips.component.html',
})
export class MultiSelectChipsComponent {
    @Input() options: OptionItem[] = [];
    @Input() selectedValues: string[] | null = [];
    @Input() placeholder = 'Seleccionar';
    @Input() selectedItemsLabel = '{0} seleccionados';
    @Input() showClearButton = true;

    @Output() selectedValuesChange = new EventEmitter<string[]>();
    @Output() selectionChange = new EventEmitter<string[]>();

    onMultiSelectChange(): void {
        this.normalizeSelection();
        this.emitSelection();
    }

    onClearSelection(): void {
        this.selectedValues = [];
        this.emitSelection();
    }

    removeValue(value: string): void {
        this.selectedValues = (this.selectedValues || []).filter(
            (item) => item !== value
        );
        this.emitSelection();
    }

    getLabel(value: string): string {
        return (
            this.options.find((item) => item.value === value)?.label || value
        );
    }

    private emitSelection(): void {
        const values = this.selectedValues || [];
        this.selectedValuesChange.emit(values);
        this.selectionChange.emit(values);
    }

    private normalizeSelection(): void {
        if (!this.selectedValues) {
            this.selectedValues = [];
        }
    }
}
