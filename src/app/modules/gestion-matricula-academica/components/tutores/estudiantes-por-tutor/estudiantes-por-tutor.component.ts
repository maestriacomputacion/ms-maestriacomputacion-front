import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TutorService } from '../../../services/tutor.service';
import { EstudiantePorTutor } from '../../../models/estudiante-por-tutor.model';
import { AutenticacionService } from 'src/app/modules/gestion-autenticacion/services/autenticacion.service';

interface EstudianteListado {
    id: number;
    codigo: string;
    nombre: string;
    apellido: string;
    correoUniversitario: string;
    matriculasPendientes: number | null;
    totalMatriculas: number | null;
    seleccionado: boolean;
}

@Component({
    selector: 'app-estudiantes-por-tutor',
    templateUrl: './estudiantes-por-tutor.component.html',
    styleUrls: ['./estudiantes-por-tutor.component.scss'],
})
export class EstudiantesPorTutorComponent implements OnInit {
    loading: boolean = false;
    periodo: number | null = null;
    anio: number | null = null;
    nombreTutor: string = '';
    codigoTutor: string = '';
    correoTutor: string = '';
    tutorId: number | null = null;

    estudiantesListado: EstudianteListado[] = [];
    estudiantesFiltrados: EstudianteListado[] = [];

    constructor(
        private readonly messageService: MessageService,
        private readonly tutorService: TutorService,
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
                detail: 'No se encontro el tutor seleccionado.',
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
                summary: 'Sin seleccion',
                detail: 'Selecciona al menos un estudiante para aplicar.',
            });
            return;
        }

        this.messageService.add({
            severity: 'success',
            summary: 'Seleccion aplicada',
            detail: `Se aplico a ${seleccionadas.length} estudiantes.`,
        });
    }

    private initTutor(): void {
        const tutorIdParam = this.resolveTutorId();
        const roles = this.authService.getRole() ?? [];

        if (roles.includes('ROLE_COORDINADOR')) {
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

        if (roles.includes('ROLE_DOCENTE')) {
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
                            'No se pudo cargar la informacion del tutor',
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
                        detail: 'No se encontro informacion del tutor.',
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
                    'Error al cargar la informacion del tutor';
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
                matriculasPendientes: item?.totalMatriculasPendientes ?? null,
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
                detail: 'No se encontro el correo del docente.',
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
                            'No se pudo obtener la informacion del docente.',
                    });
                    return;
                }

                const docente = response.data;
                if (!docente?.id) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: 'No se encontro el docente asociado.',
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
                        detail: 'Solo puedes acceder a tu informacion.',
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
                    'Error al obtener la informacion del docente.';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail,
                });
            },
        });
    }
}
