import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import {
    MATRICULA_ESTADO_OPTIONS,
    MATRICULA_ESTADOS,
} from '../../../constants/matricula-estados';
import { MatriculaRealizada } from '../../../models/matricula.model';
import { MatriculaPreviaService } from '../../../services/matricula-previa.service';
import { AutenticacionService } from 'src/app/modules/gestion-autenticacion/services/autenticacion.service';

interface EstudianteResumen {
    id: number;
    codigo: string;
    nombre: string;
    apellido: string;
    correoUniversitario: string;
}

interface MatriculaListado extends MatriculaRealizada {
    estadoMatricula: string;
}

@Component({
    selector: 'app-detalle-estudiante-tutor',
    templateUrl: './detalle-estudiante-tutor.component.html',
    styleUrls: ['./detalle-estudiante-tutor.component.scss'],
})
export class DetalleEstudianteTutorComponent implements OnInit {
    loading: boolean = false;
    estudianteId: number | null = null;
    tutorId: number | null = null;
    estudiante: Estudiante | null = null;
    estudianteResumen: EstudianteResumen | null = null;
    matriculas: MatriculaListado[] = [];

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly matriculaPreviaService: MatriculaPreviaService,
        private readonly messageService: MessageService,
        private readonly confirmationService: ConfirmationService,
        private readonly authService: AutenticacionService
    ) {}

    ngOnInit(): void {
        this.estudianteId = this.getEstudianteId();
        this.tutorId = this.getTutorId();
        this.setEstudianteDesdeNavegacion();

        if (!this.estudianteId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No se encontró el estudiante seleccionado.',
            });
            return;
        }

        this.cargarMatriculas();
    }

    onVolver(): void {
        if (this.tutorId) {
            this.router.navigate([
                '/gestion-matricula-academica',
                'estudiantes-por-tutor',
                this.tutorId,
            ]);
            return;
        }

        this.router.navigate([
            '/gestion-matricula-academica',
            'listado-tutores',
        ]);
    }

    onAprobar(event: Event, matricula: MatriculaListado): void {
        const target = event.target ?? event.currentTarget;
        const estado = this.getEstadoAprobacion();
        this.confirmationService.confirm({
            target: target ?? undefined,
            message: '¿Está seguro de aprobar este curso?',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Sí, aprobar',
            rejectLabel: 'Cancelar',
            accept: () => {
                this.cambiarEstadoMatricula(matricula, estado, {
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Curso aprobado correctamente',
                });
            },
        });
    }

    onRechazar(event: Event, matricula: MatriculaListado): void {
        const target = event.target ?? event.currentTarget;
        const estado = this.getEstadoRechazo();
        this.confirmationService.confirm({
            target: target ?? undefined,
            message: '¿Está seguro de rechazar este curso?',
            icon: 'pi pi-times-circle',
            acceptLabel: 'Sí, rechazar',
            rejectLabel: 'Cancelar',
            accept: () => {
                this.cambiarEstadoMatricula(matricula, estado, {
                    severity: 'warn',
                    summary: 'Rechazada',
                    detail: 'Curso rechazado',
                });
            },
        });
    }

    formatEstado(estado: string): string {
        if (!estado) return 'N/A';

        const match = MATRICULA_ESTADO_OPTIONS.find(
            (option) => option.value === estado
        );
        if (match?.label) {
            return match.label;
        }

        const normalized = estado.split('_').join(' ').toLowerCase();
        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    }

    getSeverityEstado(estado: string): string {
        switch (estado) {
            case MATRICULA_ESTADOS.APROBADA:
                return 'success';
            case MATRICULA_ESTADOS.PENDIENTE:
                return 'warning';
            case MATRICULA_ESTADOS.RECHAZADA:
                return 'danger';
            default:
                return 'info';
        }
    }

    mostrarAcciones(matricula: MatriculaListado): boolean {
        if (!this.esDocente()) {
            return true;
        }

        const estado = this.normalizarEstado(matricula?.estadoMatricula);
        return estado !== MATRICULA_ESTADOS.APROBADA;
    }

    getCodigo(): string {
        return (
            this.estudiante?.codigo ||
            this.estudianteResumen?.codigo ||
            'Sin dato'
        );
    }

    getNombreCompleto(): string {
        const nombre =
            this.estudiante?.persona?.nombre ??
            this.estudianteResumen?.nombre ??
            '';
        const apellido =
            this.estudiante?.persona?.apellido ??
            this.estudianteResumen?.apellido ??
            '';
        const completo = `${nombre} ${apellido}`.trim();
        return completo || 'Sin nombre';
    }

    getIdentificacion(): string {
        const identificacion = this.estudiante?.persona?.identificacion;
        return identificacion ? String(identificacion) : 'Sin dato';
    }

    getCorreo(): string {
        return (
            this.estudiante?.persona?.correoElectronico ??
            this.estudianteResumen?.correoUniversitario ??
            'Sin dato'
        );
    }

    getSemestre(): string {
        const semestre =
            this.estudiante?.informacionMaestria?.semestreAcademico;
        return semestre !== undefined &&
            semestre !== null &&
            `${semestre}` !== ''
            ? String(semestre)
            : 'Sin dato';
    }

    private getEstudianteId(): number | null {
        const estudianteId = this.route.snapshot.paramMap.get('estudianteId');
        return estudianteId ? Number(estudianteId) : null;
    }

    private getTutorId(): number | null {
        const tutorId =
            this.route.snapshot.paramMap.get('tutorId') ??
            this.route.snapshot.queryParamMap.get('tutorId');
        return tutorId ? Number(tutorId) : null;
    }

    private setEstudianteDesdeNavegacion(): void {
        const navigationState =
            this.router.getCurrentNavigation()?.extras?.state ?? history.state;
        const { estudiante } = (navigationState || {}) as {
            estudiante?: EstudianteResumen;
        };

        if (estudiante) {
            this.estudianteResumen = estudiante;
        }
    }

    private cargarMatriculas(): void {
        if (!this.estudianteId) return;

        this.loading = true;
        this.matriculaPreviaService
            .getMatriculasEstudiante(this.estudianteId)
            .subscribe({
                next: (response) => {
                    if (response.typeResponse === 'SUCCESS') {
                        const data = response.data ?? [];
                        this.matriculas = data.map((item) =>
                            this.mapMatriculaListado(item)
                        );
                        this.estudiante = this.obtenerEstudianteDesdeMatriculas(
                            this.matriculas
                        );
                    } else {
                        this.matriculas = [];
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Advertencia',
                            detail:
                                response.message ||
                                'No se pudieron cargar las matrículas',
                        });
                    }
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error cargando matrículas', err);
                    const detail =
                        err?.error?.message ||
                        err?.message ||
                        'Error al cargar las matrículas';
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail,
                    });
                    this.matriculas = [];
                    this.loading = false;
                },
            });
    }

    private mapMatriculaListado(
        matricula: MatriculaRealizada
    ): MatriculaListado {
        const estadoMatriculaRaw =
            (matricula as { estado_matricula?: string }).estado_matricula ??
            matricula.estado ??
            MATRICULA_ESTADOS.PENDIENTE;

        return {
            ...matricula,
            estadoMatricula: (
                estadoMatriculaRaw || MATRICULA_ESTADOS.PENDIENTE
            ).toUpperCase(),
        };
    }

    private obtenerEstudianteDesdeMatriculas(
        matriculas: MatriculaListado[]
    ): Estudiante | null {
        return matriculas[0]?.estudiante ?? null;
    }

    private actualizarEstado(
        matricula: MatriculaListado,
        nuevoEstado: string
    ): void {
        matricula.estadoMatricula = nuevoEstado;
        matricula.estado = nuevoEstado;
        const raw = matricula as { estado_matricula?: string };
        if (raw.estado_matricula !== undefined) {
            raw.estado_matricula = nuevoEstado;
        }
    }

    private cambiarEstadoMatricula(
        matricula: MatriculaListado,
        estadoAccion: string,
        mensajes: { severity: string; summary: string; detail: string }
    ): void {
        if (!matricula.id) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se encontró la matrícula seleccionada.',
            });
            return;
        }

        this.loading = true;
        this.matriculaPreviaService
            .cambiarEstadoMatricula(matricula.id, estadoAccion)
            .pipe(finalize(() => (this.loading = false)))
            .subscribe({
                next: (response) => {
                    if (response.typeResponse === 'SUCCESS') {
                        const estadoBackend =
                            this.normalizarEstado(response.data?.estado) ??
                            this.normalizarEstado(
                                (response.data as { estado_matricula?: string })
                                    ?.estado_matricula
                            ) ??
                            this.normalizarEstado(estadoAccion);
                        if (estadoBackend) {
                            this.actualizarEstado(matricula, estadoBackend);
                        }
                        this.messageService.add({
                            ...mensajes,
                            detail: response.message || mensajes.detail,
                        });
                        return;
                    }

                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail:
                            response.message ||
                            'No se pudo actualizar el estado de la matrícula',
                    });
                },
                error: (err) => {
                    console.error('Error cambiando estado de matrícula', err);
                    const detail =
                        err?.error?.message ||
                        err?.message ||
                        'Error al actualizar el estado de la matrícula';
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail,
                    });
                },
            });
    }

    private normalizarEstado(estado?: string | null): string | null {
        return estado ? estado.toUpperCase() : null;
    }

    private getEstadoAprobacion(): string {
        if (this.esDocente()) {
            return MATRICULA_ESTADOS.TUTOR_AVALADA;
        }

        return MATRICULA_ESTADOS.APROBADA;
    }

    private getEstadoRechazo(): string {
        if (this.esDocente()) {
            return MATRICULA_ESTADOS.TUTOR_NO_AVALADA;
        }

        return MATRICULA_ESTADOS.RECHAZADA;
    }

    private esDocente(): boolean {
        const roles = this.authService.getRole() ?? [];
        return (
            roles.includes('ROLE_DOCENTE') &&
            !roles.includes('ROLE_COORDINADOR')
        );
    }
}
