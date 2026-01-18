import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import { MatriculaRealizada } from '../../../models/matricula.model';

@Component({
    selector: 'app-aprobar-matricula-estudiante',
    templateUrl: './aprobar-matricula-estudiante.component.html',
    styleUrls: ['./aprobar-matricula-estudiante.component.scss'],
})
export class AprobarMatriculaEstudianteComponent implements OnInit {
    loading: boolean = false;
    estudianteId: number | null = null;
    estudiante: Estudiante | null = null;
    matriculas: MatriculaRealizada[] = [];

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly messageService: MessageService,
        private readonly confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            if (params['id']) {
                this.estudianteId = +params['id'];
                this.cargarDatos();
            }
        });
    }

    private cargarDatos(): void {
        this.loading = true;

        // Datos quemados
        setTimeout(() => {
            this.estudiante = {
                id: this.estudianteId ?? 1,
                codigo: 'MC2024001',
                persona: {
                    nombre: 'Ana María',
                    apellido: 'González López',
                    identificacion: 1061234567,
                    correoElectronico: 'ana.gonzalez@unicauca.edu.co',
                },
                informacionMaestria: {
                    semestreAcademico: 3,
                    estadoMaestria: 'ACTIVO',
                },
            };

            this.matriculas = [
                {
                    id: 1,
                    estudiante: this.estudiante,
                    curso: {
                        id: 101,
                        grupo: 'A',
                        periodo: {
                            id: 1,
                            fechaInicio: '2025-01-15',
                            fechaFin: '2025-06-15',
                            fechaFinMatricula: '2025-01-30',
                            tagPeriodo: 1,
                            estado: 'ACTIVO',
                        },
                        asignatura: {
                            id: 1,
                            nombre: 'Arquitectura de Software',
                            codigo: 'AS101',
                            estado: true,
                            areaFormacion: 1,
                            creditos: 4,
                        },
                        docentes: [],
                        materiales: [],
                    },
                    periodo: {
                        id: 1,
                        fechaInicio: '2025-01-15',
                        fechaFin: '2025-06-15',
                        fechaFinMatricula: '2025-01-30',
                        tagPeriodo: 1,
                        estado: 'ACTIVO',
                    },
                    estado: 'PENDIENTE',
                    observacion: '',
                },
                {
                    id: 2,
                    estudiante: this.estudiante,
                    curso: {
                        id: 102,
                        grupo: 'B',
                        periodo: {
                            id: 1,
                            fechaInicio: '2025-01-15',
                            fechaFin: '2025-06-15',
                            fechaFinMatricula: '2025-01-30',
                            tagPeriodo: 1,
                            estado: 'ACTIVO',
                        },
                        asignatura: {
                            id: 2,
                            nombre: 'Investigación I',
                            codigo: 'INV101',
                            estado: true,
                            areaFormacion: 2,
                            creditos: 4,
                        },
                        docentes: [],
                        materiales: [],
                    },
                    periodo: {
                        id: 1,
                        fechaInicio: '2025-01-15',
                        fechaFin: '2025-06-15',
                        fechaFinMatricula: '2025-01-30',
                        tagPeriodo: 1,
                        estado: 'ACTIVO',
                    },
                    estado: 'PENDIENTE',
                    observacion: '',
                },
                {
                    id: 3,
                    estudiante: this.estudiante,
                    curso: {
                        id: 103,
                        grupo: 'A',
                        periodo: {
                            id: 1,
                            fechaInicio: '2025-01-15',
                            fechaFin: '2025-06-15',
                            fechaFinMatricula: '2025-01-30',
                            tagPeriodo: 1,
                            estado: 'ACTIVO',
                        },
                        asignatura: {
                            id: 3,
                            nombre: 'Minería de Datos',
                            codigo: 'MD101',
                            estado: true,
                            areaFormacion: 1,
                            creditos: 4,
                        },
                        docentes: [],
                        materiales: [],
                    },
                    periodo: {
                        id: 1,
                        fechaInicio: '2025-01-15',
                        fechaFin: '2025-06-15',
                        fechaFinMatricula: '2025-01-30',
                        tagPeriodo: 1,
                        estado: 'ACTIVO',
                    },
                    estado: 'APROBADA',
                    observacion: '',
                },
            ];

            this.loading = false;
        }, 300);
    }

    getNombreCompleto(): string {
        return (
            `${this.estudiante?.persona?.nombre ?? ''} ${this.estudiante?.persona?.apellido ?? ''}`.trim() ||
            'Sin nombre'
        );
    }

    onVolver(): void {
        this.router.navigate(['/gestion-matricula-academica', 'vista-tutor']);
    }

    onAprobar(event: Event, matricula: MatriculaRealizada): void {
        const target = event.target ?? event.currentTarget;
        this.confirmationService.confirm({
            target: target ?? undefined,
            message: '¿Está seguro de aprobar esta matrícula?',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Sí, aprobar',
            rejectLabel: 'Cancelar',
            accept: () => {
                matricula.estado = 'APROBADA';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Matrícula aprobada correctamente',
                });
            },
        });
    }

    onRechazar(event: Event, matricula: MatriculaRealizada): void {
        const target = event.target ?? event.currentTarget;
        this.confirmationService.confirm({
            target: target ?? undefined,
            message: '¿Está seguro de rechazar esta matrícula?',
            icon: 'pi pi-times-circle',
            acceptLabel: 'Sí, rechazar',
            rejectLabel: 'Cancelar',
            accept: () => {
                matricula.estado = 'RECHAZADA';
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Rechazada',
                    detail: 'Matrícula rechazada',
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
}
