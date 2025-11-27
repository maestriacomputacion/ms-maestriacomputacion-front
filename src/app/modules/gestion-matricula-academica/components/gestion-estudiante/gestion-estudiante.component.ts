import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { EstudianteService } from 'src/app/modules/gestion-estudiantes/services/estudiante.service';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';

@Component({
    selector: 'app-gestion-estudiante',
    templateUrl: './gestion-estudiante.component.html',
    styleUrls: ['./gestion-estudiante.component.scss'],
})
export class GestionEstudianteComponent implements OnInit {
    estudiantes: Estudiante[] = [];
    loading: boolean = false;

    constructor(
        private readonly estudianteService: EstudianteService,
        private readonly router: Router,
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadEstudiantes();
    }

    private loadEstudiantes(): void {
        this.loading = true;
        this.estudianteService.listEstudiantes().subscribe({
            next: (estudiantes: Estudiante[]) => {
                this.estudiantes = estudiantes || [];
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
                this.loading = false;
            },
        });
    }

    onVerEstudiante(estudianteOrId: Estudiante | number): void {
        const id =
            typeof estudianteOrId === 'number'
                ? estudianteOrId
                : estudianteOrId?.id;
        if (id === undefined || id === null) return;
        this.router.navigate([
            '/gestion-matricula-academica',
            'ver-estudiante',
            id,
        ]);
    }

    onEditarEstudiante(id: number): void {
        this.router.navigate([
            '/gestion-matricula-academica',
            'editar-estudiante',
            id,
        ]);
    }

    onGenerarMatriculaPrevia(id: number): void {
        if (id === undefined || id === null) return;
        this.router.navigate([
            '/gestion-matricula-academica',
            'generar-matricula-previa',
            id,
        ]);
    }

    onEliminarEstudiante(eventOrId: Event | number, maybeId?: number): void {
        const id = typeof eventOrId === 'number' ? eventOrId : maybeId;
        const target =
            typeof eventOrId === 'object'
                ? (eventOrId.target as any)
                : undefined;
        if (id === undefined || id === null) return;

        this.confirmationService.confirm({
            target,
            message: '¿Está seguro de que desea eliminar este estudiante?',
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'No',
            accept: () => this.deleteEstudiante(id),
        });
    }

    private deleteEstudiante(id: number): void {
        this.estudianteService.deleteEstudiante(id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Estudiante eliminado correctamente',
                });
                this.loadEstudiantes();
            },
            error: (err) => {
                const detail =
                    err?.error?.message ||
                    err?.message ||
                    'Error al eliminar el estudiante';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail,
                });
            },
        });
    }

    getNombreCompleto(estudiante: Estudiante): string {
        return (
            `${estudiante.persona?.nombre ?? ''} ${
                estudiante.persona?.apellido ?? ''
            }`.trim() || 'Sin nombre'
        );
    }

    formatEstadoMaestria(estado?: string | null): string {
        if (!estado) return 'N/A';

        // Mapear valores conocidos a etiquetas legibles
        const mapa: Record<string, string> = {
            ACTIVO: 'Activo',
            MATRICULADO: 'Matriculado',
            GRADUADO: 'Graduado',
            RETIRADO: 'Retirado',
            SUSPENDIDO: 'Suspendido',
        };

        return mapa[estado] ?? estado;
    }

    estadoTagClass(estado?: string | null): string {
        if (!estado) return 'p-tag p-tag-secondary';

        const success = ['ACTIVO', 'MATRICULADO'].includes(estado);
        const danger = ['RETIRADO', 'SUSPENDIDO'].includes(estado);

        if (success) return 'p-tag p-tag-success';
        if (danger) return 'p-tag p-tag-danger';
        return 'p-tag p-tag-info';
    }

    getLabelEstudianteDoctorado(estudiante: Estudiante): string {
        const val = estudiante.informacionMaestria?.esEstudianteDoctorado;
        if (val === null || val === undefined) return 'N/A';
        return val ? 'Sí' : 'No';
    }
}
