import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TutorService } from '../../services/tutor.service';
import { EstudiantePorTutor } from '../../models/estudiante-por-tutor.model';

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
    periodo: number = 2;
    anio: number = 2025;
    nombreTutor: string = 'Daniel Paz';
    codigoTutor: string = '';
    correoTutor: string = '';
    tutorId: number | null = null;

    estudiantesListado: EstudianteListado[] = [];
    estudiantesFiltrados: EstudianteListado[] = [];

    constructor(
        private readonly messageService: MessageService,
        private readonly tutorService: TutorService,
        private readonly route: ActivatedRoute,
        private readonly router: Router
    ) {}

    ngOnInit(): void {
        this.setTutorData();
        this.loadTutorInfo();
        this.cargarEstudiantes();
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
        if (this.esOpcionesInformativa(estudiante)) {
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
                estudiante.id,
            ],
            {
                queryParams: {
                    tutorId: this.tutorId ?? undefined,
                },
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

    getTooltipOpciones(estudiante: EstudianteListado): string {
        if (estudiante?.totalMatriculas === 0) {
            return 'Matriculas resueltas';
        }

        return 'Ver detalle';
    }

    getIconoOpciones(estudiante: EstudianteListado): string {
        if (estudiante?.totalMatriculas === 0) {
            return 'pi pi-info-circle';
        }

        return 'pi pi-eye';
    }

    esOpcionesInformativa(estudiante: EstudianteListado): boolean {
        return estudiante?.totalMatriculas === 0;
    }

    private setTutorData(): void {
        const tutorIdParam = this.route.snapshot.paramMap.get('tutorId');

        this.tutorId = tutorIdParam ? Number(tutorIdParam) : null;

        if (!this.tutorId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No se encontro el tutor seleccionado.',
            });
        }
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
}
