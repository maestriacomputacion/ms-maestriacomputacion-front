import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CursoService } from '../../../../../services/curso.service';
import { BackendCurso } from '../../../../../models/curso.model';
import {
    MatriculaEstudiantesRequest,
    MatriculaResponseData,
    MatriculaNoRealizada,
    EstudianteExtendido,
    EstudianteMatriculado,
} from '../../../../../models/matricula.model';
import { MatriculaCursoService } from '../../../../../services/matricula-curso.service';

@Component({
    selector: 'app-realizar-matricula-estudiantes',
    templateUrl: './realizar-matricula-estudiantes.component.html',
    styleUrls: ['./realizar-matricula-estudiantes.component.scss'],
})
export class RealizarMatriculaEstudiantesComponent
    implements OnInit, OnDestroy
{
    cursoId: number | null = null;
    curso: BackendCurso | null = null;
    loading = false;

    estudiantes: EstudianteExtendido[] = [];
    estudiantesFiltrados: EstudianteExtendido[] = [];
    busquedaEstudiante = '';
    estudiantesMatricular: EstudianteExtendido[] = [];

    displayObservacionModal = false;
    observacionTemporal = '';
    estudianteSeleccionadoObs: EstudianteExtendido | null = null;

    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly cursoService: CursoService,
        private readonly messageService: MessageService,
        private readonly confirmationService: ConfirmationService,
        @Inject(MatriculaCursoService)
        private readonly matriculaCursoService: MatriculaCursoService
    ) {}

    ngOnInit(): void {
        this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            if (params['id']) {
                this.cursoId = +params['id'];
                this.cargarCurso(this.cursoId);
                this.cargarEstudiantesMatricular(this.cursoId);
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    filtrarEstudiantes(): void {
        const texto = this.busquedaEstudiante.trim().toLowerCase();
        if (!texto) {
            this.estudiantesFiltrados = [...this.estudiantes];
            return;
        }
        this.estudiantesFiltrados = this.estudiantes.filter((estudiante) => {
            const codigo = estudiante.codigo?.toLowerCase() || '';
            const nombre =
                `${estudiante.persona?.nombre} ${estudiante.persona?.apellido}`.toLowerCase();
            const correo =
                estudiante.persona?.correoElectronico?.toLowerCase() || '';
            return (
                codigo.includes(texto) ||
                nombre.includes(texto) ||
                correo.includes(texto)
            );
        });
    }

    seleccionarEstudiante(codigo: string): void {
        const estudiante = this.estudiantes.find((e) => e.codigo === codigo);
        if (!estudiante) return;

        if (this.estudianteYaSeleccionado(codigo)) {
            this.messageService.add({
                severity: 'info',
                summary: 'Información',
                detail: 'El estudiante ya está en la lista de matrícula',
            });
            return;
        }

        if (!this.cursoId) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'ID de curso no disponible para validar',
            });
            return;
        }

        this.validarYAgregarEstudiante(estudiante);
    }

    agregarObservacion(codigo: string): void {
        const estudiante = this.estudiantesMatricular.find(
            (e) => e.codigo === codigo
        );
        if (!estudiante) return;

        this.estudianteSeleccionadoObs = estudiante;
        this.observacionTemporal = estudiante.observaciones || '';
        this.displayObservacionModal = true;
    }

    guardarObservacion(): void {
        if (this.estudianteSeleccionadoObs) {
            this.estudianteSeleccionadoObs.observaciones =
                this.observacionTemporal;
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Observación guardada',
            });
        }
        this.cerrarObservacionModal();
    }

    cerrarObservacionModal(): void {
        this.displayObservacionModal = false;
        this.estudianteSeleccionadoObs = null;
        this.observacionTemporal = '';
    }

    quitarEstudiante(codigo: string): void {
        const idx = this.estudiantesMatricular.findIndex(
            (e) => e.codigo === codigo
        );
        const estudiante = this.estudiantesMatricular[idx];
        if (estudiante && this.esEstadoBloqueado(estudiante.estadoMatricula)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Acción no permitida',
                detail: 'No se puede quitar un estudiante con estado APROBADO o RECHAZADO',
            });
            return;
        }
        if (idx !== -1) {
            this.estudiantesMatricular.splice(idx, 1);
            this.messageService.add({
                severity: 'info',
                summary: 'Eliminado',
                detail: 'Estudiante quitado de la lista',
            });
        }
    }

    finalizarMatricula(event?: Event): void {
        if (!this.cursoId) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se encontró el ID del curso',
            });
            return;
        }

        if (!this.estudiantesMatricular?.length) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe seleccionar al menos un estudiante',
            });
            return;
        }

        const target = event?.target ?? event?.currentTarget;
        this.confirmationService.confirm({
            target: target ?? undefined,
            message: `¿Está seguro de matricular ${this.estudiantesMatricular.length} estudiante(s) en este curso?`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, matricular',
            rejectLabel: 'Cancelar',
            accept: () => this.procesarMatricula(),
        });
    }

    cancelarMatricula(): void {
        this.router.navigate([
            '/gestion-matricula-academica',
            'gestion-matricula-curso',
        ]);
    }

    private cargarEstudiantesDisponibles(asignaturaId: number): void {
        this.loading = true;
        this.matriculaCursoService
            .getEstudiantesDisponiblesPorAsignatura(asignaturaId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.typeResponse === 'SUCCESS') {
                        this.estudiantes = response.data || [];
                    } else {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Advertencia',
                            detail:
                                response.message ||
                                'No se pudieron cargar los estudiantes disponibles',
                        });
                    }
                    this.filtrarEstudiantes();
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error cargando estudiantes', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail:
                            err?.error?.message ??
                            err?.message ??
                            'Error al cargar los estudiantes',
                    });
                    this.loading = false;
                },
            });
    }

    private cargarEstudiantesMatricular(cursoId: number): void {
        this.loading = true;
        this.matriculaCursoService
            .getEstudiantesMatriculados(cursoId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.typeResponse === 'SUCCESS') {
                        const estudiantesData = response.data || [];
                        this.estudiantesMatricular = estudiantesData.map(
                            (item: EstudianteMatriculado) => ({
                                ...item.estudiante,
                                observaciones: item.observacion || '',
                                motivoError: undefined,
                                estadoMatricula: item.estado,
                            })
                        );
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
                    console.error(
                        'Error cargando estudiantes matriculados',
                        err
                    );
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail:
                            err?.error?.message ??
                            err?.message ??
                            'Error al cargar los estudiantes matriculados',
                    });
                    this.loading = false;
                },
            });
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
                        const asignaturaId = this.curso?.asignatura?.id;
                        if (asignaturaId) {
                            this.cargarEstudiantesDisponibles(asignaturaId);
                        } else {
                            this.messageService.add({
                                severity: 'warn',
                                summary: 'Advertencia',
                                detail: 'No se encontró la asignatura del curso para listar estudiantes disponibles',
                            });
                        }
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
                error: (err) => {
                    console.error('Error cargando curso', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al cargar la información del curso',
                    });
                    this.loading = false;
                },
            });
    }

    private validarYAgregarEstudiante(estudiante: EstudianteExtendido): void {
        const cursoId = this.cursoId;
        if (!cursoId) {
            return;
        }
        this.loading = true;
        this.matriculaCursoService
            .validarMatriculaEnCurso(estudiante.id, cursoId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.loading = false;
                    if (
                        response?.typeResponse === 'SUCCESS' &&
                        response.data === true
                    ) {
                        this.estudiantesMatricular.push({ ...estudiante });
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Estudiante agregado a la lista de matrícula',
                        });
                    } else {
                        const motivo =
                            response?.message ||
                            'No cumple requisitos para matricularse';
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Validación',
                            detail: motivo,
                        });
                    }
                },
                error: (err) => {
                    this.loading = false;
                    console.error('Error validando matrícula', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail:
                            err?.error?.message ??
                            err?.message ??
                            'Error al validar matrícula',
                    });
                },
            });
    }

    private procesarMatricula(): void {
        const cursoId = this.cursoId;
        if (!cursoId) {
            return;
        }
        const payload: MatriculaEstudiantesRequest = {
            cursoId,
            estudiantes: this.estudiantesMatricular.map((estudiante) => ({
                estudianteId: estudiante.id,
                observacion: estudiante.observaciones || '',
            })),
        };

        this.loading = true;
        this.matriculaCursoService
            .matricularEstudiantesEnCurso(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.loading = false;
                    if (response.typeResponse === 'SUCCESS') {
                        this.procesarRespuestaMatricula(
                            response.data,
                            response.message
                        );
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail:
                                response.message ||
                                'Error al realizar la matrícula',
                        });
                    }
                },
                error: (err) => {
                    this.loading = false;
                    console.error('Error en matrícula', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail:
                            err?.error?.message ??
                            err?.message ??
                            'Error al procesar la matrícula',
                    });
                },
            });
    }

    private procesarRespuestaMatricula(
        data: MatriculaResponseData,
        mensaje: string
    ): void {
        const realizadas = data.matriculasProcesadas || [];
        const noRealizadas = data.matriculasNoProcesadas || [];
        const eliminadas = data.matriculasEliminadas || [];

        this.actualizarMotivosError(noRealizadas);

        this.messageService.add({
            severity:
                realizadas.length > 0 && noRealizadas.length === 0
                    ? 'success'
                    : 'warn',
            summary:
                realizadas.length > 0 && noRealizadas.length === 0
                    ? 'Éxito'
                    : 'Advertencia',
            detail: mensaje,
            life: 3000,
        });

        const datosNavegacion = {
            matriculasProcesadas: realizadas,
            matriculasNoProcesadas: noRealizadas,
            matriculasEliminadas: eliminadas,
            origen: 'realizar-matricula',
        };

        setTimeout(() => {
            this.router.navigate(
                ['/gestion-matricula-academica', 'resultado-matricula-masiva'],
                { state: datosNavegacion }
            );
        }, 1000);
    }

    private actualizarMotivosError(noRealizadas: MatriculaNoRealizada[]): void {
        if (noRealizadas.length > 0) {
            for (const matricula of noRealizadas) {
                const estudiante = this.estudiantesMatricular.find(
                    (e) => e.id === matricula.estudiante?.id
                );
                if (estudiante) {
                    estudiante.motivoError = matricula.motivo;
                }
            }
        }
    }

    private estudianteYaSeleccionado(codigo: string): boolean {
        return this.estudiantesMatricular.some((e) => e.codigo === codigo);
    }

    esEstadoBloqueado(estado?: string): boolean {
        const estadoNormalizado = estado?.toUpperCase();
        return (
            estadoNormalizado === 'APROBADO' ||
            estadoNormalizado === 'RECHAZADO'
        );
    }
}
