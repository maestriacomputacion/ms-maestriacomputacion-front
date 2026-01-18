import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { EstudianteAcademicoService } from '../../../services/estudiante-academico.service';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import { EstudianteBusqueda } from '../../../models/estudiante-busqueda.model';
import { ApiResponse } from '../../../models/api-response.model';

@Component({
    selector: 'app-buscador-estudiantes-academico',
    templateUrl: './buscador-estudiantes-academico.component.html',
    styleUrls: ['./buscador-estudiantes-academico.component.scss'],
})
export class BuscadorEstudiantesAcademicoComponent implements OnInit {
    estudiantes: EstudianteBusqueda[] = [];
    estudiantesFiltrados: EstudianteBusqueda[] = [];
    estudianteSeleccionado: EstudianteBusqueda | null = null;
    loading: boolean = false;

    constructor(
        private readonly estudianteAcademicoService: EstudianteAcademicoService,
        private readonly messageService: MessageService,
        private readonly ref: DynamicDialogRef
    ) {}

    ngOnInit(): void {
        this.listarEstudiantes();
    }

    listarEstudiantes(): void {
        this.loading = true;
        this.estudianteAcademicoService.getEstudiantesActivos().subscribe({
            next: (response: ApiResponse<Estudiante[]>) => {
                if (response?.typeResponse === 'SUCCESS') {
                    this.estudiantes = (response.data || [])
                        .map((estudiante) =>
                            this.mapToEstudianteBusqueda(estudiante)
                        )
                        .filter((item): item is EstudianteBusqueda => !!item);
                } else {
                    this.estudiantes = [];
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail:
                            response?.message ||
                            'No se pudieron cargar los estudiantes',
                    });
                }
                this.estudiantesFiltrados = [...this.estudiantes];
                this.loading = false;
            },
            error: (error: HttpErrorResponse) => {
                console.error('Error cargando estudiantes', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail:
                        error?.error?.message ||
                        error?.message ||
                        'Error al cargar los estudiantes',
                });
                this.estudiantes = [];
                this.estudiantesFiltrados = [];
                this.loading = false;
            },
        });
    }

    filtrarEstudiantes(filter: string): void {
        const term = (filter || '').trim().toLowerCase();
        if (!term) {
            this.estudiantesFiltrados = [...this.estudiantes];
            return;
        }

        this.estudiantesFiltrados = this.estudiantes.filter((estudiante) =>
            this.esCoincidente(estudiante, term)
        );
    }

    onCancel(): void {
        this.ref.close();
    }

    onSeleccionar(): void {
        if (this.estudianteSeleccionado) {
            this.ref.close(this.estudianteSeleccionado);
        }
    }

    private esCoincidente(
        estudiante: EstudianteBusqueda,
        term: string
    ): boolean {
        const nombre = String(estudiante.nombre || '').toLowerCase();
        const apellido = String(estudiante.apellido || '').toLowerCase();
        const identificacion = String(
            estudiante.identificacion || ''
        ).toLowerCase();
        const codigo = String(estudiante.codigo || '').toLowerCase();
        return (
            nombre.includes(term) ||
            apellido.includes(term) ||
            identificacion.includes(term) ||
            codigo.includes(term)
        );
    }

    private mapToEstudianteBusqueda(
        estudiante: Estudiante
    ): EstudianteBusqueda | null {
        if (!estudiante) return null;
        return {
            id: estudiante.id,
            codigo: estudiante.codigo,
            identificacion: estudiante.persona?.identificacion
                ? String(estudiante.persona.identificacion)
                : undefined,
            nombre: estudiante.persona?.nombre,
            apellido: estudiante.persona?.apellido,
            persona: estudiante.persona
                ? {
                      nombre: estudiante.persona.nombre,
                      apellido: estudiante.persona.apellido,
                      tipoIdentificacion: estudiante.persona.tipoIdentificacion,
                  }
                : undefined,
        };
    }
}
