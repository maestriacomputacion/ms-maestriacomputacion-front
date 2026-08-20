import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TutorService } from '../../../services/tutor.service';
import { EstudiantePorTutor } from '../../../models/estudiante-por-tutor.model';
import { AutenticacionService } from 'src/app/modules/gestion-autenticacion/services/autenticacion.service';
import { MatriculaPreviaService } from '../../../services/matricula-previa.service';
import { MATRICULA_ESTADOS } from '../../../constants/matricula-estados';

interface EstudianteListado {
    id: number;
    codigo: string;
    nombre: string;
    apellido: string;
    correoUniversitario: string;
    matriculasPendientes: number | null;
    matriculasPendientesCoordinador: number | null;
    totalMatriculas: number | null;
    seleccionado: boolean;
}

type AccionMasiva =
    'aceptar' | 'rechazar' | 'avalar' | 'no-avalar' | 'aprobar-eleccion-tutor';

@Component({
    selector: 'app-estudiantes-por-tutor',
    templateUrl: './estudiantes-por-tutor.component.html',
})
export class EstudiantesPorTutorComponent implements OnInit {
    loading: boolean = false;
    modalAccionVisible: boolean = false;
    periodo: number | null = null;
    anio: number | null = null;
    nombreTutor: string = '';
    codigoTutor: string = '';
    correoTutor: string = '';
    tutorId: number | null = null;
    roles: string[] = [];

    estudiantesListado: EstudianteListado[] = [];
    estudiantesFiltrados: EstudianteListado[] = [];

    constructor(
        private readonly messageService: MessageService,
        private readonly tutorService: TutorService,
        private readonly matriculaPreviaService: MatriculaPreviaService,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly authService: AutenticacionService
    ) {}

    ngOnInit(): void {
        this.initTutor();
    }

    cargarEstudiantes(): void {
        if (!this.tutorId) {
            this.estudiantesListado = [];
            this.estudiantesFiltrados = [];
            return;
        }

        this.loading = true;
        this.tutorService.getEstudiantesPorTutor(this.tutorId).subscribe({
            next: (response) => {
                if (response.typeResponse === 'SUCCESS') {
                    const estudiantesResponse = response.data ?? [];
                    this.estudiantesListado =
                        this.mapEstudiantesListado(estudiantesResponse);
                    this.estudiantesFiltrados = [...this.estudiantesListado];
                } else {
                    this.estudiantesListado = [];
                    this.estudiantesFiltrados = [];
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail:
                            response.message ||
                            'No se pudieron cargar los estudiantes',
                    });
                }
                this.loading = false;
            },
            error: (err) => {
                console.error('Error cargando estudiantes', err);
                const detail =
                    err?.error?.message ||
                    err?.message ||
                    'Error al cargar los estudiantes';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail,
                });
                this.estudiantesListado = [];
                this.estudiantesFiltrados = [];
                this.loading = false;
            },
        });
    }

    seleccionarTodos(event: { checked: boolean }): void {
        const seleccionado = event.checked;
        this.estudiantesFiltrados.forEach(
            (estudiante) => (estudiante.seleccionado = seleccionado)
        );
    }

    verificarTodosSeleccionados(): boolean {
        return (
            this.estudiantesFiltrados.length > 0 &&
            this.estudiantesFiltrados.every((s) => s.seleccionado)
        );
    }

    verDetalleEstudiante(estudiante: EstudianteListado): void {
        const tutorId = this.tutorId ?? this.resolveTutorId();
        if (!tutorId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No se encontró el tutor seleccionado.',
            });
            return;
        }

        if (!estudiante?.id) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No se pudo abrir el detalle del estudiante.',
            });
            return;
        }

        this.router.navigate(
            [
                '/gestion-matricula-academica',
                'detalle-estudiante-tutor',
                tutorId,
                estudiante.id,
            ],
            {
                state: { estudiante },
            }
        );
    }

    tieneSeleccionadas(): boolean {
        return this.estudiantesListado.some((s) => s.seleccionado);
    }

    aplicarSugerencias(): void {
        const seleccionadas = this.estudiantesListado.filter(
            (s) => s.seleccionado
        );
        if (seleccionadas.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin selección',
                detail: 'Selecciona al menos un estudiante para aplicar.',
            });
            return;
        }

        this.modalAccionVisible = true;
    }

    getCantidadSeleccionadas(): number {
        return this.estudiantesListado.filter((s) => s.seleccionado).length;
    }

    confirmarAccion(accion: AccionMasiva): void {
        const seleccionadas = this.estudiantesListado.filter(
            (s) => s.seleccionado
        );
        if (seleccionadas.length === 0) {
            this.modalAccionVisible = false;
            return;
        }

        const estado = this.getEstadoPorAccion(accion);
        if (!estado) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No se pudo determinar el estado para aplicar.',
            });
            this.modalAccionVisible = false;
            return;
        }

        const estudiantesIds = seleccionadas
            .map((s) => s.id)
            .filter((id) => id > 0);
        if (estudiantesIds.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No se encontraron estudiantes válidos.',
            });
            this.modalAccionVisible = false;
            return;
        }

        const acciones: Record<AccionMasiva, string> = {
            aceptar: 'Aprobar',
            rechazar: 'Rechazar',
            avalar: 'Avalar',
            'no-avalar': 'No avalar',
            'aprobar-eleccion-tutor': 'Aprobar elección del tutor',
        };

        this.loading = true;
        this.matriculaPreviaService
            .cambiarEstadoMatriculaMasivo({
                estudiantesIds,
                nuevoEstado: estado,
            })
            .subscribe({
                next: (response) => {
                    if (response.typeResponse === 'SUCCESS') {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail:
                                response.message ||
                                `${acciones[accion]} aplicado a ${estudiantesIds.length} estudiantes.`,
                        });
                        this.cargarEstudiantes();
                        return;
                    }

                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail:
                            response.message ||
                            'No se pudo actualizar el estado de las matrículas.',
                    });
                    this.loading = false;
                },
                error: (err) => {
                    console.error(
                        'Error cambiando estado masivo de matrículas',
                        err
                    );
                    const detail =
                        err?.error?.message ||
                        err?.message ||
                        'Error al actualizar el estado de las matrículas.';
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail,
                    });
                    this.loading = false;
                },
            });
        this.modalAccionVisible = false;
    }

    esCoordinador(): boolean {
        return this.roles.includes('ROLE_COORDINADOR');
    }

    esDocente(): boolean {
        return this.roles.includes('ROLE_DOCENTE');
    }

    getTooltipOpciones(_estudiante: EstudianteListado): string {
        return 'Ver detalle';
    }

    getIconoOpciones(_estudiante: EstudianteListado): string {
        return 'pi pi-eye';
    }

    private initTutor(): void {
        const tutorIdParam = this.resolveTutorId();
        this.roles = this.authService.getRole() ?? [];

        if (this.esCoordinador()) {
            if (!tutorIdParam) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'Debe seleccionar un tutor para continuar.',
                });
                return;
            }

            this.tutorId = tutorIdParam;
            this.loadTutorInfo();
            this.cargarEstudiantes();
            return;
        }

        if (this.esDocente()) {
            this.resolveDocentePorEmail(tutorIdParam);
            return;
        }

        this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'No tiene permisos para acceder a esta vista.',
        });
    }

    private loadTutorInfo(): void {
        if (!this.tutorId) {
            return;
        }

        this.tutorService.getTutores().subscribe({
            next: (response) => {
                if (response.typeResponse !== 'SUCCESS') {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail:
                            response.message ||
                            'No se pudo cargar la información del tutor',
                    });
                    return;
                }

                const tutor = (response.data ?? []).find(
                    (item) => item.docenteId === this.tutorId
                );
                if (!tutor) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: 'No se encontró información del tutor.',
                    });
                    return;
                }

                this.nombreTutor = tutor.nombre;
                this.codigoTutor = tutor.codigo || '';
                this.correoTutor = tutor.correo || '';
            },
            error: (err) => {
                console.error('Error cargando tutor', err);
                const detail =
                    err?.error?.message ||
                    err?.message ||
                    'Error al cargar la información del tutor';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail,
                });
            },
        });
    }

    private mapEstudiantesListado(
        estudiantes: EstudiantePorTutor[]
    ): EstudianteListado[] {
        return estudiantes.map((item) => {
            const estudiante = item?.estudiante;
            const persona = estudiante?.persona;

            return {
                id: estudiante?.id ?? 0,
                codigo: estudiante?.codigo ?? '',
                nombre: persona?.nombre ?? '',
                apellido: persona?.apellido ?? '',
                correoUniversitario: estudiante?.correoUniversidad ?? '',
                matriculasPendientes:
                    item?.totalMatriculasPendientesTutor ?? null,
                matriculasPendientesCoordinador:
                    item?.totalMatriculasPendienteCordinador ?? null,
                totalMatriculas: item?.totalMatriculas ?? null,
                seleccionado: false,
            };
        });
    }

    private resolveTutorId(): number | null {
        const tutorIdParam =
            this.route.snapshot.paramMap.get('tutorId') ??
            this.route.snapshot.queryParamMap.get('tutorId');
        return tutorIdParam ? Number(tutorIdParam) : null;
    }

    private resolveDocentePorEmail(tutorIdParam: number | null): void {
        const email = this.authService.getEmail();
        if (!email) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No se encontró el correo del docente.',
            });
            return;
        }

        this.tutorService.getDocentePorEmail(email).subscribe({
            next: (response) => {
                if (response.typeResponse !== 'SUCCESS') {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail:
                            response.message ||
                            'No se pudo obtener la información del docente.',
                    });
                    return;
                }

                const docente = response.data;
                if (!docente?.id) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: 'No se encontró el docente asociado.',
                    });
                    return;
                }

                const docenteId = Number(docente.id);
                const persona = docente.persona;
                const nombre = `${persona?.nombre ?? ''} ${
                    persona?.apellido ?? ''
                }`.trim();

                this.tutorId = docenteId;
                this.nombreTutor = nombre || 'Sin nombre';
                this.codigoTutor = docente.codigo || '';
                this.correoTutor = persona?.correoElectronico ?? '';

                if (tutorIdParam && tutorIdParam !== docenteId) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: 'Solo puedes acceder a tu información.',
                    });
                    this.router.navigate(
                        [
                            '/gestion-matricula-academica',
                            'estudiantes-por-tutor',
                            docenteId,
                        ],
                        { replaceUrl: true }
                    );
                }

                this.cargarEstudiantes();
            },
            error: (err) => {
                console.error('Error cargando docente por email', err);
                const detail =
                    err?.error?.message ||
                    err?.message ||
                    'Error al obtener la información del docente.';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail,
                });
            },
        });
    }

    private getEstadoPorAccion(accion: AccionMasiva): string | null {
        const estados: Record<AccionMasiva, string> = {
            aceptar: MATRICULA_ESTADOS.APROBADA,
            rechazar: MATRICULA_ESTADOS.RECHAZADA,
            avalar: MATRICULA_ESTADOS.TUTOR_AVALADA,
            'no-avalar': MATRICULA_ESTADOS.TUTOR_NO_AVALADA,
            'aprobar-eleccion-tutor': MATRICULA_ESTADOS.APROBADA,
        };

        return estados[accion] ?? null;
    }
}
