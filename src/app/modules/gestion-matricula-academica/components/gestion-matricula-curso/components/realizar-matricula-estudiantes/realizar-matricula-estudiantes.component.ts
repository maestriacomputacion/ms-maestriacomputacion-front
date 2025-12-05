// ...existing code...
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CursoService } from '../../../../services/curso.service';
import { BackendCurso } from '../../../../models/curso.model';
import {
    MatriculaEstudiantesRequest,
    MatriculaResponseData,
} from '../../../../models/matricula.model';
import { EstudianteService } from 'src/app/modules/gestion-estudiantes/services/estudiante.service';
import { Estudiante as EstudianteBase } from 'src/app/modules/gestion-estudiantes/models/estudiante';

@Component({
    selector: 'app-realizar-matricula-estudiantes',
    templateUrl: './realizar-matricula-estudiantes.component.html',
    styleUrls: ['./realizar-matricula-estudiantes.component.scss'],
})
export class RealizarMatriculaEstudiantesComponent implements OnInit {
    cursoId: number | null = null;
    curso: BackendCurso | null = null;
    loading = false;

    // Extiende el modelo para permitir observaciones y motivos de error
    estudiantes: (EstudianteBase & {
        observaciones?: string;
        motivoError?: string;
    })[] = [];
    estudiantesFiltrados: (EstudianteBase & {
        observaciones?: string;
        motivoError?: string;
    })[] = [];
    public busquedaEstudiante: string = '';
    estudiantesMatricular: (EstudianteBase & {
        observaciones?: string;
        motivoError?: string;
    })[] = [];

    public displayObservacionModal: boolean = false;
    public observacionTemporal: string = '';
    public estudianteSeleccionadoObs:
        | (EstudianteBase & { observaciones?: string; motivoError?: string })
        | null = null;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly cursoService: CursoService,
        private readonly messageService: MessageService,
        private readonly confirmationService: ConfirmationService,
        private readonly estudianteService: EstudianteService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            if (params['id']) {
                this.cursoId = +params['id'];
                this.cargarCurso(this.cursoId);
            }
        });
        this.cargarEstudiantes();
    }
    cargarEstudiantes(): void {
        this.loading = true;
        this.estudianteService.listEstudiantes().subscribe({
            next: (estudiantes: EstudianteBase[]) => {
                this.estudiantes = estudiantes || [];
                this.filtrarEstudiantes();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error cargando estudiantes', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail:
                        err?.error?.message ||
                        err?.message ||
                        'Error al cargar los estudiantes',
                });
                this.loading = false;
            },
        });
    }

    filtrarEstudiantes(): void {
        const texto = this.busquedaEstudiante.trim().toLowerCase();
        if (!texto) {
            this.estudiantesFiltrados = [...this.estudiantes];
            return;
        }
        this.estudiantesFiltrados = this.estudiantes.filter((e) => {
            const codigo = e.codigo?.toLowerCase() || '';
            const nombre = (
                e.persona?.nombre +
                ' ' +
                e.persona?.apellido
            ).toLowerCase();
            const correo = e.persona?.correoElectronico?.toLowerCase() || '';
            return (
                codigo.includes(texto) ||
                nombre.includes(texto) ||
                correo.includes(texto)
            );
        });
    }

    cargarCurso(id: number): void {
        this.loading = true;
        this.cursoService.getCursoById(id).subscribe({
            next: (resp) => {
                if (resp.typeResponse === 'SUCCESS') {
                    this.curso = resp.data;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail:
                            resp.message ||
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

    seleccionarEstudiante(codigo: string): void {
        const estudiante = this.estudiantes.find((e) => e.codigo === codigo);
        if (!estudiante) return;
        const yaSeleccionado = this.estudiantesMatricular.some(
            (e) => e.codigo === codigo
        );
        if (yaSeleccionado) {
            this.messageService.add({
                severity: 'info',
                summary: 'Información',
                detail: 'El estudiante ya está en la lista de matrícula',
            });
            return;
        }
        // Validar en backend antes de agregar
        if (!this.cursoId) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'ID de curso no disponible para validar',
            });
            return;
        }

        this.loading = true;
        this.cursoService
            .validarMatricula(estudiante.id, this.cursoId)
            .subscribe({
                next: (resp) => {
                    this.loading = false;
                    // Backend devuelve ApiResponse<boolean> en data
                    if (
                        resp?.typeResponse === 'SUCCESS' &&
                        resp.data === true
                    ) {
                        // Clonar para evitar referencias compartidas
                        this.estudiantesMatricular.push({ ...estudiante });
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Estudiante agregado a la lista de matrícula',
                        });
                    } else {
                        // Mostrar mensaje del backend (mensaje general sobre por qué no puede matricularse)
                        const motivo =
                            resp?.message ||
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
                            err?.error?.message ||
                            err?.message ||
                            'Error al validar matrícula',
                    });
                },
            });
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

        this.confirmationService.confirm({
            target: event?.target,
            message: `¿Está seguro de matricular ${this.estudiantesMatricular.length} estudiante(s) en este curso?`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, matricular',
            rejectLabel: 'Cancelar',
            accept: () => {
                this.procesarMatricula();
            },
        });
    }

    private procesarMatricula(): void {
        const payload: MatriculaEstudiantesRequest = {
            matriculaEstudianteCursos: this.estudiantesMatricular.map(
                (est) => ({
                    estudianteId: est.id,
                    cursos: [
                        {
                            cursoId: this.cursoId,
                            observacion: est.observaciones || '',
                        },
                    ],
                })
            ),
        };

        this.loading = true;
        this.cursoService.matricularEstudiantes(payload).subscribe({
            next: (resp) => {
                this.loading = false;
                if (resp.typeResponse === 'SUCCESS') {
                    this.procesarRespuestaMatricula(resp.data, resp.message);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail:
                            resp.message || 'Error al realizar la matrícula',
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
                        err?.error?.message ||
                        err?.message ||
                        'Error al procesar la matrícula',
                });
            },
        });
    }

    private procesarRespuestaMatricula(
        data: MatriculaResponseData,
        mensaje: string
    ): void {
        const realizadas = data.matriculasRealizadas || [];
        const noRealizadas = data.matriculasNoRealizadas || [];

        // Actualizar motivos de error en la tabla
        if (noRealizadas.length > 0) {
            for (const matricula of noRealizadas) {
                const estudiante = this.estudiantesMatricular.find(
                    (e) => e.id === matricula.estudianteId
                );
                if (estudiante) {
                    estudiante.motivoError = matricula.motivo;
                }
            }
        }

        // Mostrar mensaje y navegar a resultado
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
            matriculasRealizadas: realizadas,
            matriculasNoRealizadas: noRealizadas,
            origen: 'realizar-matricula',
        };

        // Navegar a la vista de resultados después de mostrar el mensaje
        setTimeout(() => {
            this.router.navigate(
                ['/gestion-matricula-academica', 'resultado-matricula-masiva'],
                {
                    state: datosNavegacion,
                }
            );
        }, 1000);
    }

    cancelarMatricula(): void {
        this.router.navigate([
            '/gestion-matricula-academica',
            'gestion-matricula-curso',
        ]);
    }

    getDocentesFormateados(): string {
        if (!this.curso?.docentes?.length) return '-';
        return this.curso.docentes
            .map((d) => {
                const nombreCompleto = `${d.nombre ?? ''} ${
                    d.apellido ?? ''
                }`.trim();
                return nombreCompleto || d.codigo || d.correoElectronico || '-';
            })
            .join(', ');
    }

    getTagPeriodo(): string {
        return this.curso?.periodo?.tagPeriodo?.toString() ?? '-';
    }

    getFechasPeriodo(): string {
        if (!this.curso?.periodo) return '-';
        const fechaInicio = this.formatDate(this.curso.periodo.fechaInicio);
        const fechaFin = this.formatDate(this.curso.periodo.fechaFin);
        return `${fechaInicio} - ${fechaFin}`;
    }

    private formatDate(dateStr: string | null | undefined): string {
        if (!dateStr) return '-';
        const parts = dateStr.split('T')[0].split('-');
        if (parts.length !== 3) return dateStr;
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    }
}
