import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CursoService } from '../../../services/curso.service';
import { CatalogoAcademicoService } from '../../../services/catalogo-academico.service';
import { CursoUI } from '../../../models/curso.model';
import { ApiResponse } from '../../../models/api-response.model';
import { PeriodoAcademicoService } from '../../../services/periodo-academico.service';
import { PeriodoAcademico } from '../../../models/periodo-academico.model';

@Component({
    selector: 'app-gestion-curso',
    templateUrl: './gestion-curso.component.html',
    styleUrls: ['./gestion-curso.component.scss'],
    providers: [MessageService, ConfirmationService],
})
export class GestionCursoComponent implements OnInit, OnDestroy {
    @Input() estado?: string;

    cursos: CursoUI[] = [];
    periodos: Array<{
        label: string;
        value: string;
        fechaInicio: string;
        fechaFin: string;
        estado?: string | null;
    }> = [];
    areasFormacion: Array<{ label: string; value: string }> = [];
    asignaturas: Array<{ label: string; value: string }> = [];

    periodoSeleccionado: string | null = null;
    areaSeleccionada: string | null = null;
    asignaturaSeleccionada: string | null = null;

    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly cursoService: CursoService,
        private readonly catalogoAcademicoService: CatalogoAcademicoService,
        private readonly periodoService: PeriodoAcademicoService,
        private readonly router: Router,
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadAreasFormacion();

        if (this.estado === 'gestion-matricula-curso') {
            this.loadPeriodoActivoYCursos();
        } else {
            this.loadPeriodos();
            this.loadPeriodoActivoYCursos();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadPeriodos(): void {
        this.periodoService
            .getPeriodos()
            .pipe(takeUntil(this.destroy$))
            .subscribe((response) => {
                if (response.typeResponse === 'SUCCESS') {
                    const periodos = response.data || [];

                    this.periodos = periodos.map(
                        (periodo: PeriodoAcademico) => ({
                            label: `${this.formatDateString(
                                periodo.fechaInicio
                            )} - ${this.formatDateString(periodo.fechaFin)}`,
                            value: String(periodo.id),
                            fechaInicio: this.formatDateString(
                                periodo.fechaInicio
                            ),
                            fechaFin: this.formatDateString(periodo.fechaFin),
                            estado: periodo.estado,
                        })
                    );
                }
            });
    }

    private loadPeriodoActivoYCursos(): void {
        this.periodoService
            .getPeriodoActivo()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.typeResponse === 'SUCCESS' && response.data) {
                        this.periodoSeleccionado = String(response.data.id);
                        this.loadCursos();
                    } else {
                        console.warn('No hay período activo');
                        this.loadCursos();
                    }
                },
                error: (err) => {
                    console.error('Error obteniendo período activo', err);
                    this.loadCursos();
                },
            });
    }

    private loadAreasFormacion(): void {
        this.catalogoAcademicoService
            .getAreasFormacion()
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (response: ApiResponse<{ label: string; value: string }[]>) => {
                    if (response.typeResponse === 'SUCCESS') {
                        this.areasFormacion = response.data;
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
            .pipe(takeUntil(this.destroy$))
            .subscribe((response: ApiResponse<CursoUI[]>) => {
                if (response.typeResponse === 'SUCCESS') {
                    this.cursos = response.data;
                }
            });
    }

    onFilterChange(): void {
        this.loadCursos();
    }

    onPeriodoSeleccionado(periodoId: string | null): void {
        this.periodoSeleccionado = periodoId;
        this.loadCursos();
    }

    /** Carga asignaturas cuando cambia el área seleccionada. */
    onAreaChange(nuevaArea: string | null): void {
        this.asignaturaSeleccionada = null;

        if (nuevaArea) {
            this.catalogoAcademicoService
                .getAsignaturasByArea(nuevaArea)
                .pipe(takeUntil(this.destroy$))
                .subscribe(
                    (
                        response: ApiResponse<
                            { label: string; value: string }[]
                        >
                    ) => {
                        this.asignaturas =
                            response.typeResponse === 'SUCCESS'
                                ? response.data
                                : [];
                        this.loadCursos();
                    }
                );
        } else {
            this.asignaturas = [];
            this.loadCursos();
        }
    }

    private formatDateString(dateStr: string): string {
        if (!dateStr) return '';
        const parts = dateStr.split('T')[0].split('-');
        if (parts.length !== 3) return dateStr;
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    }

    onAgregarCurso(): void {
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

    onEditarCurso(cursoOrId: CursoUI | number): void {
        const id = typeof cursoOrId === 'number' ? cursoOrId : cursoOrId?.id;
        if (id === undefined || id === null) return;
        this.router.navigate([
            '/gestion-matricula-academica',
            'editar-curso',
            id,
        ]);
    }

    /**
     * Maneja la confirmación de eliminación.
     */
    onEliminarCurso(eventOrId: Event | number, maybeId?: number): void {
        const id = typeof eventOrId === 'number' ? eventOrId : maybeId;
        const target =
            typeof eventOrId === 'object'
                ? (eventOrId.target as HTMLElement)
                : undefined;

        if (id === undefined || id === null) return;

        const curso = this.cursos.find((c) => c.id === id);
        const nombreCurso = curso
            ? `"${curso.asignatura}" (Grupo ${curso.grupo})`
            : 'este curso';

        this.confirmationService.confirm({
            target,
            message: `¿Está seguro de que desea eliminar el curso ${nombreCurso}?`,
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'No',
            accept: () => this.deleteCurso(id),
        });
    }

    private deleteCurso(id: number): void {
        this.cursoService
            .eliminarCurso(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.typeResponse === 'SUCCESS') {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: response.message,
                        });
                        this.cursos = this.cursos.filter(
                            (curso) => curso.id !== id
                        );
                    }
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err?.message || 'Error al eliminar el curso',
                    });
                },
            });
    }

    onAgregarEstudiantes(cursoId: number): void {
        this.router.navigate([
            '/gestion-matricula-academica',
            'realizar-matricula-curso',
            cursoId,
        ]);
    }
}
