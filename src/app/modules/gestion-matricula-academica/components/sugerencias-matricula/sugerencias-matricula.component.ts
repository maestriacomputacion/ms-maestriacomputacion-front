import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TutorService } from '../../services/tutor.service';
import { Estudiante } from '../../../gestion-estudiantes/models/estudiante';

interface EstudianteListado {
    id: number;
    codigo: string;
    nombre: string;
    apellido: string;
    correoUniversitario: string;
    estadoPrematricula: string;
    cantidadCursos: number | null;
    seleccionado: boolean;
}

@Component({
    selector: 'app-sugerencias-matricula',
    templateUrl: './sugerencias-matricula.component.html',
    styleUrls: ['./sugerencias-matricula.component.scss'],
})
export class SugerenciasMatriculaComponent implements OnInit {
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
        private readonly route: ActivatedRoute
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

    aprobarEstudiante(estudiante: EstudianteListado): void {
        this.messageService.add({
            severity: 'success',
            summary: 'Aprobado',
            detail: `Estudiante ${estudiante.nombre} ${estudiante.apellido} aprobado`,
        });
    }

    rechazarEstudiante(estudiante: EstudianteListado): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Rechazado',
            detail: `Estudiante ${estudiante.nombre} ${estudiante.apellido} rechazado`,
        });
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

    private setTutorData(): void {
        const tutorIdParam = this.route.snapshot.queryParamMap.get('tutorId');

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
        estudiantes: Estudiante[]
    ): EstudianteListado[] {
        return estudiantes.map((estudiante) => {
            const persona = estudiante.persona;

            return {
                id: estudiante.id ?? 0,
                codigo: estudiante.codigo ?? '',
                nombre: persona?.nombre ?? '',
                apellido: persona?.apellido ?? '',
                correoUniversitario: estudiante.correoUniversidad ?? '',
                estadoPrematricula: '',
                cantidadCursos: null,
                seleccionado: false,
            };
        });
    }
}
