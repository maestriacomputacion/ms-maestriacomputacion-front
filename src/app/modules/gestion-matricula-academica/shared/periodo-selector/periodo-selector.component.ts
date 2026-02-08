import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';

type PeriodoItem = {
    label: string;
    value: string;
    fechaInicio: string;
    fechaFin: string;
    estado?: string | null;
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
    anioInicio: Date | null = null;
    anioFin: Date | null = null;
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
        this.anioInicio = null;
        this.anioFin = null;
        this.rangoInvalido = false;
        this.applyPeriodoFilters();
        this.selectedPeriodoIdChange.emit(null);
    }

    onFechasChange(): void {
        this.applyPeriodoFilters();
    }

    isPeriodoActivo(periodo: PeriodoItem): boolean {
        return (periodo.estado || '').toUpperCase().trim() === 'ACTIVO';
    }

    private getPeriodoLabelById(id: string | null): string {
        if (!id) return '';
        return (
            this.periodos.find((periodo) => periodo.value === id)?.label || ''
        );
    }

    private getPeriodoItemById(id: string | null): PeriodoItem | null {
        if (!id) return null;
        return this.periodos.find((periodo) => periodo.value === id) || null;
    }

    private applyPeriodoFilters(): void {
        const rango = this.getNormalizedRange(this.anioInicio, this.anioFin);

        if (this.rangoInvalido) {
            this.periodosFiltrados = [];
            return;
        }

        this.periodosFiltrados = this.periodos.filter((periodo) => {
            if (!rango) return true;

            const inicio = this.getYearFromDate(periodo.fechaInicio);
            const fin = this.getYearFromDate(periodo.fechaFin);

            if (!inicio || !fin) return false;

            return inicio <= rango.fin && fin >= rango.inicio;
        });
    }

    get minAnioDate(): Date | null {
        const minYear = this.getMinPeriodoYear();
        return minYear ? new Date(minYear, 0, 1) : null;
    }

    private getYearFromDate(dateStr: string): number | null {
        const parts = dateStr.split('/');
        if (parts.length !== 3) return null;
        const year = Number(parts[2]);
        return Number.isFinite(year) ? year : null;
    }

    private getNormalizedRange(
        inicio: Date | null,
        fin: Date | null
    ): { inicio: number; fin: number } | null {
        if (!inicio && !fin) return null;
        const start = inicio || fin;
        const end = fin || inicio;
        if (!start || !end) return null;
        const startYear = start.getFullYear();
        const endYear = end.getFullYear();
        if (inicio && fin && startYear > endYear) {
            this.rangoInvalido = true;
            return null;
        }
        this.rangoInvalido = false;
        return { inicio: startYear, fin: endYear };
    }

    private getMinPeriodoYear(): number | null {
        let minYear: number | null = null;
        this.periodos.forEach((periodo) => {
            const inicio = this.getYearFromDate(periodo.fechaInicio);
            const fin = this.getYearFromDate(periodo.fechaFin);
            if (Number.isFinite(inicio)) {
                minYear =
                    minYear === null
                        ? (inicio as number)
                        : Math.min(minYear, inicio as number);
            }
            if (Number.isFinite(fin)) {
                minYear =
                    minYear === null
                        ? (fin as number)
                        : Math.min(minYear, fin as number);
            }
        });
        return minYear;
    }
}
