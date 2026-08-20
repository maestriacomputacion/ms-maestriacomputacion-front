import { Component, OnInit, OnDestroy } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
    AbstractControl,
    ValidatorFn,
} from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ApiResponse } from '../../../models/api-response.model';
import { PeriodoAcademicoService } from '../../../services/periodo-academico.service';
import {
    PeriodoAcademico,
    PeriodoAcademicoPayload,
} from '../../../models/periodo-academico.model';

@Component({
    selector: 'app-gestion-periodo-academico',
    templateUrl: './gestion-periodo-academico.component.html',
    styleUrls: ['./gestion-periodo-academico.component.scss'],
    providers: [MessageService, ConfirmationService],
})
export class GestionPeriodoAcademicoComponent implements OnInit, OnDestroy {
    periodos: PeriodoAcademico[] = [];
    displayModal = false;
    displayPrecargaModal = false;
    editMode = false;
    editPeriodoId: string | null = null;
    fechasValidasBackend = true;
    mensajeValidacionBackend = '';
    form: FormGroup;
    periodoPrecargaDestino: PeriodoAcademico | null = null;
    periodoPrecargaOrigen: PeriodoAcademico | null = null;
    periodosPrecargaDisponibles: PeriodoAcademico[] = [];

    readonly tagPeriodoOptions = [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
    ];

    readonly estadoOptions = [
        { label: 'ACTIVO', value: 'ACTIVO' },
        { label: 'INACTIVO', value: 'INACTIVO' },
        { label: 'FINALIZADO', value: 'FINALIZADO' },
        { label: 'PROYECCION', value: 'PROYECCION' },
    ];

    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly periodoService: PeriodoAcademicoService,
        private readonly fb: FormBuilder,
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService
    ) {
        this.form = this.fb.group(
            {
                fechaInicio: [null, Validators.required],
                fechaFin: [null, Validators.required],
                fechaFinMatricula: [null, Validators.required],
                tagPeriodo: [null, Validators.required],
                descripcion: [''],
                estado: [null],
            },
            { validators: this.fechaFinMatriculaEntreFechasValidator() }
        );

        this.setupFormListeners();
    }

    ngOnInit(): void {
        this.loadPeriodos();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get fechaFinMatriculaInvalida(): boolean {
        return (
            this.form.hasError('fechaFinMatriculaFueraRango') &&
            (this.form.get('fechaFinMatricula')?.dirty ||
                this.form.get('fechaFinMatricula')?.touched)
        );
    }

    get mostrarValidacionBackend(): boolean {
        return (
            !this.fechasValidasBackend &&
            !!this.mensajeValidacionBackend &&
            (this.form.get('fechaInicio')?.touched ||
                this.form.get('fechaFin')?.touched)
        );
    }

    get fechasValidas(): boolean {
        const fechaInicio = this.formatDateToString(
            this.form.get('fechaInicio')?.value
        );
        const fechaFin = this.formatDateToString(
            this.form.get('fechaFin')?.value
        );
        if (!fechaInicio || !fechaFin) return false;

        // En modo edición, si las fechas no han cambiado, asumir que son válidas
        if (this.editMode) {
            return fechaInicio < fechaFin;
        }

        return fechaInicio < fechaFin && this.fechasValidasBackend;
    }

    onAgregarPeriodo(): void {
        this.form.reset();
        this.editMode = false;
        this.editPeriodoId = null;
        this.resetValidacionBackend();
        this.displayModal = true;
    }

    onEditarPeriodo(id: string): void {
        const periodo = this.periodos.find((p) => p.id === id);
        if (!periodo) return;

        this.editMode = true;
        this.editPeriodoId = id;
        this.resetValidacionBackend();

        this.form.patchValue({
            fechaInicio: this.parseStringToDate(periodo.fechaInicio),
            fechaFin: this.parseStringToDate(periodo.fechaFin),
            fechaFinMatricula: this.parseStringToDate(
                periodo.fechaFinMatricula
            ),
            tagPeriodo: periodo.tagPeriodo,
            descripcion: periodo.descripcion,
            estado: periodo.estado,
        });

        this.displayModal = true;
    }

    onEliminarPeriodo(event: Event, id: string): void {
        this.confirmationService.confirm({
            target: event.target as HTMLElement,
            message: '¿Está seguro que desea eliminar este período académico?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => this.eliminarPeriodo(id),
        });
    }

    onPrecargarCursos(periodoId: string): void {
        const periodo = this.periodos.find((p) => p.id === periodoId);
        if (!periodo) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se encontró el período académico.',
            });
            return;
        }

        this.periodoPrecargaDestino = periodo;
        this.periodoPrecargaOrigen = null;
        this.periodosPrecargaDisponibles = this.periodos.filter(
            (item) => item.id !== periodoId
        );
        this.displayPrecargaModal = true;
    }

    confirmarPrecargaCursos(): void {
        if (!this.periodoPrecargaDestino || !this.periodoPrecargaOrigen) return;

        this.periodoService
            .precargarCursos({
                idPeriodo: this.periodoPrecargaDestino.id,
                idPeriodoPrecarga: this.periodoPrecargaOrigen.id,
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    const precargaExitosa = response.typeResponse === 'SUCCESS';
                    const detalleFallback = precargaExitosa
                        ? `La precarga de cursos desde ${this.formatPeriodoEtiqueta(
                              this.periodoPrecargaOrigen
                          )} hacia ${this.formatPeriodoEtiqueta(
                              this.periodoPrecargaDestino
                          )} ha sido iniciada.`
                        : 'No se pudo iniciar la precarga de cursos.';
                    this.messageService.add({
                        severity: precargaExitosa ? 'success' : 'error',
                        summary: precargaExitosa ? 'Proceso iniciado' : 'Error',
                        detail: response.message ?? detalleFallback,
                    });
                    if (precargaExitosa) {
                        this.cancelarPrecargaCursos();
                    }
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail:
                            err?.error?.message ??
                            'No se pudo iniciar la precarga de cursos.',
                    });
                },
            });
    }

    cancelarPrecargaCursos(): void {
        this.displayPrecargaModal = false;
        this.periodoPrecargaDestino = null;
        this.periodoPrecargaOrigen = null;
        this.periodosPrecargaDisponibles = [];
    }

    formatPeriodoEtiqueta(periodo: PeriodoAcademico | null): string {
        if (!periodo) return '';
        const fechaInicio = periodo.fechaInicio || '-';
        const fechaFin = periodo.fechaFin || '-';
        return `Período ${periodo.tagPeriodo} (${fechaInicio} - ${fechaFin})`;
    }

    registrarPeriodo(): void {
        if (!this.form.valid || !this.fechasValidas) {
            this.form.markAllAsTouched();
            return;
        }

        const value = this.form.value;
        const periodoData = {
            fechaInicio: this.formatDateToString(value.fechaInicio),
            fechaFin: this.formatDateToString(value.fechaFin),
            fechaFinMatricula: this.formatDateToString(value.fechaFinMatricula),
            tagPeriodo: value.tagPeriodo,
            descripcion: value.descripcion,
            estado: value.estado,
        };

        if (this.editMode && this.editPeriodoId) {
            this.actualizarPeriodoBackend(this.editPeriodoId, periodoData);
        } else {
            this.crearPeriodoBackend(periodoData);
        }
    }

    cancelarModal(): void {
        this.form.reset();
        this.resetValidacionBackend();
        this.editMode = false;
        this.editPeriodoId = null;
        this.displayModal = false;
    }

    formatDateToString(date: string | Date | null | undefined): string {
        if (!date) return '';
        if (typeof date === 'string') return date;
        const d = new Date(date);
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${d.getFullYear()}-${month}-${day}`;
    }

    parseStringToDate(dateStr: string): Date | null {
        if (!dateStr) return null;
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    private setupFormListeners(): void {
        this.form
            .get('fechaInicio')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe(() => this.validarFechasConBackend());

        this.form
            .get('fechaFin')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe(() => this.validarFechasConBackend());
    }

    private loadPeriodos(): void {
        this.periodoService
            .getPeriodos()
            .pipe(takeUntil(this.destroy$))
            .subscribe((response: ApiResponse<PeriodoAcademico[]>) => {
                if (response.typeResponse === 'SUCCESS') {
                    this.periodos = response.data;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail:
                            response.message ??
                            'No se pudo obtener la información de períodos.',
                    });
                }
            });
    }

    private validarFechasConBackend(): void {
        const fechaInicio = this.form.get('fechaInicio')?.value;
        const fechaFin = this.form.get('fechaFin')?.value;

        if (fechaInicio && fechaFin) {
            const fechaInicioStr = this.formatDateToString(fechaInicio);
            const fechaFinStr = this.formatDateToString(fechaFin);

            this.periodoService
                .validarFechasPeriodo(fechaInicioStr, fechaFinStr)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (response) => {
                        this.fechasValidasBackend = response.data;
                        this.mensajeValidacionBackend = response.data
                            ? ''
                            : response.message;
                    },
                    error: (err) => {
                        console.error('Error al validar fechas:', err);
                        this.fechasValidasBackend = false;
                        const errores = err?.error?.data;
                        this.mensajeValidacionBackend = Array.isArray(errores)
                            ? errores.join(', ')
                            : (err?.error?.message ??
                              'Error al validar las fechas con el servidor.');
                    },
                });
        } else {
            this.resetValidacionBackend();
        }
    }

    private crearPeriodoBackend(periodoData: PeriodoAcademicoPayload): void {
        this.periodoService
            .crearPeriodo(periodoData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.handlePeriodoResponse(response, 'registrar');
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail:
                            err?.error?.message ??
                            'No se pudo registrar el período académico.',
                    });
                },
            });
    }

    private actualizarPeriodoBackend(
        id: string,
        periodoData: PeriodoAcademicoPayload
    ): void {
        this.periodoService
            .actualizarPeriodo(id, periodoData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.handlePeriodoResponse(response, 'actualizar');
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail:
                            err?.error?.message ??
                            'No se pudo actualizar el período académico.',
                    });
                },
            });
    }

    private eliminarPeriodo(id: string): void {
        this.periodoService
            .eliminarPeriodo(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity:
                            response.typeResponse === 'SUCCESS'
                                ? 'success'
                                : 'error',
                        summary:
                            response.typeResponse === 'SUCCESS'
                                ? 'Éxito'
                                : 'Error',
                        detail: response.message,
                    });
                    if (response.typeResponse === 'SUCCESS') {
                        this.loadPeriodos();
                    }
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail:
                            err?.error?.message ??
                            'No se pudo eliminar el período académico.',
                    });
                },
            });
    }

    private handlePeriodoResponse(
        response: ApiResponse<unknown>,
        _accion: string
    ): void {
        this.messageService.add({
            severity: response.typeResponse === 'SUCCESS' ? 'success' : 'error',
            summary: response.typeResponse === 'SUCCESS' ? 'Éxito' : 'Error',
            detail: response.message,
        });

        if (response.typeResponse === 'SUCCESS') {
            this.loadPeriodos();
            this.displayModal = false;
        }
    }

    private resetValidacionBackend(): void {
        this.fechasValidasBackend = true;
        this.mensajeValidacionBackend = '';
    }

    private fechaFinMatriculaEntreFechasValidator(): ValidatorFn {
        return (group: AbstractControl) => {
            const inicio = group.get('fechaInicio')?.value;
            const fin = group.get('fechaFin')?.value;
            const finMatricula = group.get('fechaFinMatricula')?.value;

            if (inicio && fin && finMatricula) {
                const inicioDate = new Date(inicio);
                const finDate = new Date(fin);
                const finMatriculaDate = new Date(finMatricula);

                if (
                    finMatriculaDate < inicioDate ||
                    finMatriculaDate > finDate
                ) {
                    return { fechaFinMatriculaFueraRango: true };
                }
            }
            return null;
        };
    }
}
