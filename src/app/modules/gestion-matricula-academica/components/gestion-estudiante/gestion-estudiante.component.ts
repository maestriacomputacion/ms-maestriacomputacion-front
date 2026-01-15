import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EstudianteService } from 'src/app/modules/gestion-estudiantes/services/estudiante.service';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';

@Component({
    selector: 'app-gestion-estudiante',
    templateUrl: './gestion-estudiante.component.html',
    styleUrls: ['./gestion-estudiante.component.scss'],
})
export class GestionEstudianteComponent implements OnInit {
    estudiantes: Estudiante[] = [];
    selectedEstudiantes: Estudiante[] = [];
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

    onGenerarMatriculaPrevia(id: number): void {
        if (id === undefined || id === null) return;
        this.router.navigate([
            '/gestion-matricula-academica',
            'generar-matricula-previa',
            id,
        ]);
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

    /** Acción provisional para iniciar matrícula masiva con los estudiantes seleccionados. */
    onMatriculaMasiva(): void {
        if (!this.selectedEstudiantes || this.selectedEstudiantes.length === 0)
            return;
        // Navegar a la vista de matrícula masiva pasando la información seleccionada
        const estudiantes = this.selectedEstudiantes.map((e) => ({ ...e }));
        this.router.navigate(
            ['/gestion-matricula-academica', 'matricula-masiva'],
            {
                state: { selectedEstudiantes: estudiantes },
            }
        );
    }

    getNombreCompleto(estudiante: Estudiante): string {
        return (
            `${estudiante.persona?.nombre ?? ''} ${
                estudiante.persona?.apellido ?? ''
            }`.trim() || 'Sin nombre'
        );
    }
}
