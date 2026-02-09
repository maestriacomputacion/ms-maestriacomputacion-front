import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

export type ReportFormat = 'pdf' | 'xlsx';

export interface ReportFormatDialogData {
    defaultFormat?: ReportFormat;
    confirmLabel?: string;
    description?: string;
}

@Component({
    selector: 'app-report-format-dialog-host',
    templateUrl: './report-format-dialog-host.component.html',
    styleUrls: ['./report-format-dialog-host.component.scss'],
})
export class ReportFormatDialogHostComponent {
    formatoReporte: ReportFormat = 'pdf';
    confirmLabel = 'Generar';
    description = 'Selecciona el formato de salida del reporte.';

    constructor(
        public readonly ref: DynamicDialogRef,
        public readonly config: DynamicDialogConfig
    ) {
        const data = (this.config?.data ?? {}) as ReportFormatDialogData;
        this.formatoReporte = data.defaultFormat ?? 'pdf';
        this.confirmLabel = data.confirmLabel ?? 'Generar';
        this.description =
            data.description ?? 'Selecciona el formato de salida del reporte.';
    }

    cancelar(): void {
        this.ref.close(null);
    }

    confirmar(): void {
        this.ref.close(this.formatoReporte);
    }
}

