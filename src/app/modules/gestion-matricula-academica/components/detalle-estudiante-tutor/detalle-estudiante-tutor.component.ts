import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import { MatriculaRealizada } from '../../models/matricula.model';
import { MatriculaPreviaService } from '../../services/matricula-previa.service';

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
        private readonly confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.estudianteId = this.getEstudianteId();
        this.tutorId = this.getTutorId();
        this.setEstudianteDesdeNavegacion();

        if (!this.estudianteId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No se encontro el estudiante seleccionado.',
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
        this.confirmationService.confirm({
            target: target ?? undefined,
            message: '¿Está seguro de aprobar este curso?',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Sí, aprobar',
            rejectLabel: 'Cancelar',
            accept: () => {
                this.actualizarEstado(matricula, 'APROBADA');
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Curso aprobado correctamente',
                });
            },
        });
    }

    onRechazar(event: Event, matricula: MatriculaListado): void {
        const target = event.target ?? event.currentTarget;
        this.confirmationService.confirm({
            target: target ?? undefined,
            message: '¿Está seguro de rechazar este curso?',
            icon: 'pi pi-times-circle',
            acceptLabel: 'Sí, rechazar',
            rejectLabel: 'Cancelar',
            accept: () => {
                this.actualizarEstado(matricula, 'RECHAZADA');
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Rechazada',
                    detail: 'Curso rechazado',
                });
            },
        });
    }

    formatEstado(estado: string): string {
        if (!estado) return 'N/A';
        return estado.charAt(0) + estado.slice(1).toLowerCase();
    }

    getSeverityEstado(estado: string): string {
        switch (estado) {
            case 'APROBADA':
                return 'success';
            case 'PENDIENTE':
                return 'warning';
            case 'RECHAZADA':
                return 'danger';
            default:
                return 'info';
        }
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
        const tutorId = this.route.snapshot.queryParamMap.get('tutorId');
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
            'PENDIENTE';

        return {
            ...matricula,
            estadoMatricula: (estadoMatriculaRaw || 'PENDIENTE').toUpperCase(),
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
}
