import { Component } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

export type ReportFormat = 'pdf' | 'xlsx';

export interface ReportFormatDialogData {
    defaultFormat?: ReportFormat;
    confirmLabel?: string;
    description?: string;
    loadingText?: string;
    errorSummary?: string;
    fileNamePrefix?: string;
    action?: (format: ReportFormat) => Observable<HttpResponse<Blob> | Blob>;
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
    loadingText = 'Generando reporte, por favor espera...';
    errorSummary = 'No se pudo generar el reporte';
    fileNamePrefix = 'reporte';
    generando = false;

    constructor(
        public readonly ref: DynamicDialogRef,
        public readonly config: DynamicDialogConfig,
        private readonly messageService: MessageService
    ) {
        const data = (this.config?.data ?? {}) as ReportFormatDialogData;
        this.formatoReporte = data.defaultFormat ?? 'pdf';
        this.confirmLabel = data.confirmLabel ?? 'Generar';
        this.description =
            data.description ?? 'Selecciona el formato de salida del reporte.';
        this.loadingText = data.loadingText ?? 'Generando reporte, por favor espera...';
        this.errorSummary = data.errorSummary ?? 'No se pudo generar el reporte';
        this.fileNamePrefix = data.fileNamePrefix ?? 'reporte';
    }

    cancelar(): void {
        if (this.generando) {
            return;
        }
        this.ref.close(null);
    }

    confirmar(): void {
        if (this.generando) {
            return;
        }

        const data = (this.config?.data ?? {}) as ReportFormatDialogData;
        if (!data.action) {
            this.ref.close(this.formatoReporte);
            return;
        }

        this.generando = true;
        data.action(this.formatoReporte)
            .pipe(take(1))
            .subscribe({
                next: (result) => {
                    const blob = this.extraerBlob(result);
                    if (!blob) {
                        this.generando = false;
                        this.messageService.add({
                            key: 'global',
                            severity: 'error',
                            summary: this.errorSummary,
                            detail: 'Respuesta vacia al generar reporte.',
                            life: 9000,
                        });
                        return;
                    }

                    const nombreArchivo =
                        this.obtenerNombreArchivo(
                            result instanceof HttpResponse
                                ? (result.headers.get('content-disposition') ??
                                      result.headers.get('Content-Disposition'))
                                : null
                        ) ?? this.nombreArchivoConFecha(this.formatoReporte);

                    const url = globalThis.URL.createObjectURL(blob);
                    const enlace = document.createElement('a');
                    enlace.href = url;
                    enlace.download = nombreArchivo;
                    enlace.click();
                    globalThis.URL.revokeObjectURL(url);

                    this.generando = false;
                    this.ref.close(this.formatoReporte);
                },
                error: async (err) => {
                    const detail = await this.extraerMensajeError(err);
                    this.messageService.add({
                        key: 'global',
                        severity: 'error',
                        summary: this.errorSummary,
                        detail,
                        life: 9000,
                    });
                    this.generando = false;
                    console.error('[report-format-dialog] Error', err);
                },
            });
    }

    private extraerBlob(result: HttpResponse<Blob> | Blob): Blob | null {
        if (!result) return null;
        if (result instanceof Blob) return result;
        return result.body ?? null;
    }

    private obtenerNombreArchivo(contentDisposition?: string | null): string | null {
        if (!contentDisposition) return null;
        const filenameStar = contentDisposition.match(
            /filename\*=(?:UTF-8'')?([^;]+)/i
        );
        const filenameBasic = contentDisposition.match(/filename=([^;]+)/i);
        const raw = (filenameStar?.[1] ?? filenameBasic?.[1] ?? '').trim();
        if (!raw) return null;
        const unquoted = raw.replace(/^"|"$/g, '');
        try {
            return decodeURIComponent(unquoted);
        } catch {
            return unquoted;
        }
    }

    private nombreArchivoConFecha(formato: ReportFormat): string {
        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const fecha = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(
            d.getDate()
        )}`;
        const hora = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(
            d.getSeconds()
        )}`;
        const ext = formato === 'xlsx' ? 'xlsx' : 'pdf';
        return `${this.fileNamePrefix}_${fecha}_${hora}.${ext}`;
    }

    private async extraerMensajeError(err: any): Promise<string> {
        const fallback = 'Ocurrió un error inesperado.';
        if (!err) return fallback;

        const e = err?.error;

        if (typeof e === 'string' && e.trim().length > 0) {
            return e;
        }

        if (e && typeof e === 'object' && !(e instanceof Blob)) {
            return (
                e.message ||
                e.mensaje ||
                e.error ||
                e.detail ||
                err.message ||
                fallback
            );
        }

        if (e instanceof Blob) {
            try {
                const text = await e.text();
                if (!text || text.trim().length === 0) {
                    return err.message || fallback;
                }
                try {
                    const json = JSON.parse(text);
                    return (
                        json.message ||
                        json.mensaje ||
                        json.error ||
                        json.detail ||
                        text
                    );
                } catch {
                    return text;
                }
            } catch {
                return err.message || fallback;
            }
        }

        return err.message || fallback;
    }
}
