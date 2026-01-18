import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CursoService } from '../../../../../services/curso.service';
import { BackendCurso } from '../../../../../models/curso.model';
import { EstudianteMatriculado } from '../../../../../models/matricula.model';
import { MatriculaCursoService } from '../../../../../services/matricula-curso.service';

@Component({
    selector: 'app-cancelar-matricula-estudiantes',
    templateUrl: './cancelar-matricula-estudiantes.component.html',
    styleUrls: ['./cancelar-matricula-estudiantes.component.scss'],
})
export class CancelarMatriculaEstudiantesComponent
    implements OnInit, OnDestroy
{
    cursoId: number | null = null;
    curso: BackendCurso | null = null;
    loading = false;

    estudiantesMatriculados: EstudianteMatriculado[] = [];
    displayMotivoModal = false;
    motivoTemporal = '';
    matriculaSeleccionada: EstudianteMatriculado | null = null;

    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly route: ActivatedRoute,
        private readonly cursoService: CursoService,
        private readonly messageService: MessageService,
        private readonly confirmationService: ConfirmationService,
        private readonly matriculaCursoService: MatriculaCursoService
    ) {}

    ngOnInit(): void {
        this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            if (params['id']) {
                this.cursoId = +params['id'];
                this.cargarCurso(this.cursoId);
                this.cargarEstudiantesMatriculados(this.cursoId);
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    abrirMotivoModal(matricula: EstudianteMatriculado | null): void {
        if (!matricula) {
            return;
        }
        this.matriculaSeleccionada = matricula;
        this.motivoTemporal = '';
        this.displayMotivoModal = true;
    }

    continuarCancelacion(event?: Event): void {
        const motivo = this.motivoTemporal.trim();
        if (!motivo) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe ingresar un motivo para cancelar la matrícula',
            });
            return;
        }

        const target = event?.target ?? event?.currentTarget;
        this.confirmationService.confirm({
            target: target ?? undefined,
            message:
                '¿Está seguro de cancelar la matrícula de este estudiante?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => this.confirmarCancelarMatricula(),
        });
    }

    cerrarMotivoModal(): void {
        this.displayMotivoModal = false;
        this.matriculaSeleccionada = null;
        this.motivoTemporal = '';
    }

    private cargarCurso(id: number): void {
        this.loading = true;
        this.cursoService
            .getCursoById(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.typeResponse === 'SUCCESS') {
                        this.curso = response.data;
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail:
                                response.message ||
                                'No se pudo cargar la información del curso',
                        });
                    }
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al cargar la información del curso',
                    });
                },
            });
    }

    private cargarEstudiantesMatriculados(cursoId: number): void {
        this.loading = true;
        this.matriculaCursoService
            .getEstudiantesMatriculados(cursoId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.typeResponse === 'SUCCESS') {
                        this.estudiantesMatriculados = response.data || [];
                    } else {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Advertencia',
                            detail:
                                response.message ||
                                'No se pudieron cargar los estudiantes matriculados',
                        });
                    }
                    this.loading = false;
                },
                error: (err) => {
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail:
                            err?.error?.message ??
                            err?.message ??
                            'Error al cargar los estudiantes matriculados',
                    });
                },
            });
    }

    private confirmarCancelarMatricula(): void {
        const matriculaId = this.matriculaSeleccionada?.id;
        const motivo = this.motivoTemporal.trim();
        if (!matriculaId) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'ID de matrícula no disponible',
            });
            return;
        }
        if (!motivo) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe ingresar un motivo para cancelar la matrícula',
            });
            return;
        }

        this.loading = true;
        this.matriculaCursoService
            .cancelarMatricula(matriculaId, motivo)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.loading = false;
                    if (response.typeResponse === 'SUCCESS') {
                        this.estudiantesMatriculados =
                            this.estudiantesMatriculados.filter(
                                (item) => item.id !== matriculaId
                            );
                        this.cerrarMotivoModal();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail:
                                response.message ||
                                'Matrícula cancelada correctamente',
                        });
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail:
                                response.message ||
                                'No se pudo cancelar la matrícula',
                        });
                    }
                },
                error: (err) => {
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail:
                            err?.error?.message ??
                            err?.message ??
                            'Error al cancelar la matrícula',
                    });
                },
            });
    }
}
