import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { CursoService } from '../../services/curso.service';
import { CursoUI } from '../../models/curso.model';
import { ApiResponse } from '../../models/api-response.model';
import { PeriodoAcademicoService } from '../../services/periodo-academico.service';
import { PeriodoAcademico } from '../../models/periodo-academico.model';

@Component({
    selector: 'app-gestion-curso',
    templateUrl: './gestion-curso.component.html',
    styleUrls: ['./gestion-curso.component.scss'],
})
export class GestionCursoComponent implements OnInit {
    @Input() estado: string | undefined;

    cursos: CursoUI[] = [];

    periodos: Array<{ label: string; value: string }> = [];
    periodoSeleccionado: string | null = null;

    areasFormacion: Array<{ label: string; value: string }> = [];
    areaSeleccionada: string | null = null;

    asignaturas: Array<{ label: string; value: string }> = [];
    asignaturaSeleccionada: string | null = null;

    constructor(
        private readonly cursoService: CursoService,
        private readonly periodoService: PeriodoAcademicoService,
        private readonly router: Router,
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit() {
        // Cargar periodos para el filtro
        this.periodoService.getPeriodos().subscribe((resp) => {
            if (resp.typeResponse === 'SUCCESS') {
                this.periodos = (resp.data || []).map(
                    (p: PeriodoAcademico) => ({
                        label: `${this.formatDateString(
                            p.fechaInicio
                        )} - ${this.formatDateString(p.fechaFin)}`,
                        value: String(p.id),
                    })
                );
            }
        });
        this.loadCursos();
        // Cargar áreas de formación
        this.cursoService
            .getAreasFormacion()
            .subscribe(
                (resp: ApiResponse<{ label: string; value: string }[]>) => {
                    if (resp.typeResponse === 'SUCCESS') {
                        this.areasFormacion = resp.data;
                    }
                }
            );
    }

    private loadCursos(): void {
        this.cursoService
            .getCursos({
                idPeriodo: this.periodoSeleccionado,
                idAsignatura: this.asignaturaSeleccionada,
                idArea: this.areaSeleccionada,
            })
            .subscribe((resp: ApiResponse<CursoUI[]>) => {
                if (resp.typeResponse === 'SUCCESS') {
                    this.cursos = resp.data;
                }
            });
    }

    onFilterChange(): void {
        this.loadCursos();
    }

    /** Carga asignaturas cuando cambia el área seleccionada. */
    onAreaChange(nuevaArea: string | null): void {
        // Asegurar que `areaSeleccionada` refleja el nuevo valor
        this.areaSeleccionada = nuevaArea;
        // Cargar asignaturas si hay área, de lo contrario limpiar
        if (this.areaSeleccionada) {
            this.cursoService
                .getAsignaturasByArea(this.areaSeleccionada)
                .subscribe(
                    (resp: ApiResponse<{ label: string; value: string }[]>) => {
                        if (resp.typeResponse === 'SUCCESS') {
                            this.asignaturas = resp.data;
                        } else {
                            this.asignaturas = [];
                        }
                    }
                );
        } else {
            this.asignaturas = [];
        }
        this.loadCursos();
    }
    private formatDateString(dateStr: string): string {
        if (!dateStr) return '';
        const parts = dateStr.split('T')[0].split('-');
        if (parts.length !== 3) return dateStr;
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    }

    onAgregarCurso(): void {
        // Navegar al formulario de registro
        this.router.navigate([
            '/gestion-matricula-academica',
            'registrar-curso',
        ]);
    }

    onVerCurso(cursoOrId: CursoUI | number): void {
        const id = typeof cursoOrId === 'number' ? cursoOrId : cursoOrId?.id;
        if (id === undefined || id === null) return;
        this.router.navigate(['/gestion-matricula-academica', 'ver-curso', id]);
    }

    onEditarCurso(id: number): void {
        // Navegar a la ruta de edición
        this.router.navigate([
            '/gestion-matricula-academica',
            'editar-curso',
            id,
        ]);
    }

    /**
     * Maneja la confirmación de eliminación. Se acepta llamada con (event, id)
     * o con solo el id (por compatibilidad).
     */
    onEliminarCurso(eventOrId: Event | number, maybeId?: number): void {
        const id = typeof eventOrId === 'number' ? eventOrId : maybeId;
        const target =
            typeof eventOrId === 'object'
                ? (eventOrId.target as any)
                : undefined;
        if (id === undefined || id === null) return;

        this.confirmationService.confirm({
            target,
            message: '¿Está seguro de que desea eliminar este curso?',
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'No',
            accept: () => this.deleteCurso(id),
        });
    }

    private deleteCurso(id: number): void {
        this.cursoService.eliminarCurso(id).subscribe({
            next: (resp) => {
                if (resp.typeResponse === 'SUCCESS') {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: resp.message,
                    });
                    this.cursos = this.cursos.filter((c) => c.id !== id);
                }
            },
            error: (err) => {
                const detail = err?.message || 'Error al eliminar el curso';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail,
                });
            },
        });
    }

    onAgregarEstudiantes(cursoId: number): void {
        console.log('Agregar estudiantes al curso ID:', cursoId);
    }
}
