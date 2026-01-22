import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

type PeriodoItem = {
    label: string;
    value: string;
    fechaInicio: string;
    fechaFin: string;
};

@Component({
    selector: 'app-periodo-selector',
    templateUrl: './periodo-selector.component.html',
})
export class PeriodoSelectorComponent implements OnChanges {
    @Input() periodos: PeriodoItem[] = [];
    @Input() selectedPeriodoId: string | null = null;
    @Input() placeholder = 'Seleccionar período';
    @Input() showClear = true;

    @Output() selectedPeriodoIdChange = new EventEmitter<string | null>();

    periodosFiltrados: PeriodoItem[] = [];
    periodoSeleccionadoLabel = '';
    periodoSeleccionadoItem: PeriodoItem | null = null;
    dialogVisible = false;
    fechaInicio: Date | null = null;
    fechaFin: Date | null = null;
    rangoInvalido = false;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['periodos']) {
            this.applyPeriodoFilters();
        }

        if (changes['selectedPeriodoId'] || changes['periodos']) {
            this.periodoSeleccionadoLabel = this.getPeriodoLabelById(
                this.selectedPeriodoId
            );
            this.periodoSeleccionadoItem = this.getPeriodoItemById(
                this.selectedPeriodoId
            );
        }
    }

    onOpenDialog(): void {
        this.dialogVisible = true;
    }

    onCloseDialog(): void {
        this.dialogVisible = false;
    }

    onSelectPeriodo(periodo: PeriodoItem): void {
        this.selectedPeriodoId = periodo.value;
        this.periodoSeleccionadoLabel = periodo.label;
        this.periodoSeleccionadoItem = periodo;
        this.selectedPeriodoIdChange.emit(this.selectedPeriodoId);
        this.dialogVisible = false;
    }

    onClearSelection(): void {
        this.selectedPeriodoId = null;
        this.periodoSeleccionadoLabel = '';
        this.periodoSeleccionadoItem = null;
        this.fechaInicio = null;
        this.fechaFin = null;
        this.rangoInvalido = false;
        this.applyPeriodoFilters();
        this.selectedPeriodoIdChange.emit(null);
    }

    onFechasChange(): void {
        this.applyPeriodoFilters();
    }

    private getPeriodoLabelById(id: string | null): string {
        if (!id) return '';
        return this.periodos.find((periodo) => periodo.value === id)?.label || '';
    }

    private getPeriodoItemById(id: string | null): PeriodoItem | null {
        if (!id) return null;
        return this.periodos.find((periodo) => periodo.value === id) || null;
    }

    private applyPeriodoFilters(): void {
        const rango = this.getNormalizedRange(this.fechaInicio, this.fechaFin);

        if (this.rangoInvalido) {
            this.periodosFiltrados = [];
            return;
        }

        this.periodosFiltrados = this.periodos.filter((periodo) => {
            if (!rango) return true;

            const inicio = this.parseDateString(periodo.fechaInicio);
            const fin = this.parseDateString(periodo.fechaFin);

            if (!inicio || !fin) return false;

            return inicio <= rango.fin && fin >= rango.inicio;
        });
    }

    private parseDateString(dateStr: string): Date | null {
        const parts = dateStr.split('/');
        if (parts.length !== 3) return null;
        const [day, month, year] = parts.map((part) => Number(part));
        if (!day || !month || !year) return null;
        return new Date(year, month - 1, day);
    }

    private getNormalizedRange(
        inicio: Date | null,
        fin: Date | null
    ): { inicio: Date; fin: Date } | null {
        if (!inicio && !fin) return null;
        const start = inicio || fin;
        const end = fin || inicio;
        if (!start || !end) return null;
        if (inicio && fin && start > end) {
            this.rangoInvalido = true;
            return null;
        }
        this.rangoInvalido = false;
        return { inicio: start, fin: end };
    }
}
