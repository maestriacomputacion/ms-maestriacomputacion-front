import { Injectable } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
    ReportFormat,
    ReportFormatDialogData,
    ReportFormatDialogHostComponent,
} from '../components/report-format-dialog-host/report-format-dialog-host.component';

export interface ReportFormatDialogOptions {
    title?: string;
    defaultFormat?: ReportFormat;
    confirmLabel?: string;
    description?: string;
    width?: string;
}

@Injectable({ providedIn: 'root' })
export class ReportFormatDialogService {
    private ref: DynamicDialogRef | null = null;

    constructor(private readonly dialogService: DialogService) {}

    open(options?: ReportFormatDialogOptions): Observable<ReportFormat | null> {
        if (this.ref) {
            this.ref.close(null);
            this.ref = null;
        }

        const data: ReportFormatDialogData = {
            defaultFormat: options?.defaultFormat ?? 'pdf',
            confirmLabel: options?.confirmLabel ?? 'Generar',
            description:
                options?.description ??
                'Selecciona el formato de salida del reporte.',
        };

        this.ref = this.dialogService.open(ReportFormatDialogHostComponent, {
            header: options?.title ?? 'Formato del reporte',
            width: options?.width ?? '28rem',
            data,
            modal: true,
            closable: false,
            dismissableMask: true,
        });

        return this.ref.onClose.pipe(
            map((value) => (value === 'pdf' || value === 'xlsx' ? value : null)),
            tap(() => {
                this.ref = null;
            })
        );
    }
}
