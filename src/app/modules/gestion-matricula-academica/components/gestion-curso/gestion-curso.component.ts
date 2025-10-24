import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    cursos: CursoUI[] = [];
    displayModal = false;
    editMode = false;
    editCursoId: number | null = null;
    form: FormGroup;

    // Filtros
    periodos: Array<{ label: string; value: string }> = [];
    periodoSeleccionado: string | null = null;

    areasFormacion: Array<{ label: string; value: string }> = [];
    areaSeleccionada: string | null = null;

    asignaturas: Array<{ label: string; value: string }> = [];
    asignaturaSeleccionada: string | null = null;

    constructor(
        private readonly fb: FormBuilder,
        private readonly cursoService: CursoService,
        private readonly periodoService: PeriodoAcademicoService,
        private readonly router: Router,
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService
    ) {
        this.form = this.fb.group({
            grupo: ['', Validators.required],
            asignatura: ['', Validators.required],
            docente: ['', Validators.required],
            fecha: ['', Validators.required],
        });
    }

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
        this.cursoService
            .getCursos()
            .subscribe((resp: ApiResponse<CursoUI[]>) => {
                if (resp.typeResponse === 'SUCCESS') {
                    this.cursos = resp.data;
                }
            });
        this.cursoService
            .getAreasFormacion()
            .subscribe(
                (resp: ApiResponse<{ label: string; value: string }[]>) => {
                    if (resp.typeResponse === 'SUCCESS') {
                        this.areasFormacion = resp.data;
                    }
                }
            );
        this.cursoService
            .getAsignaturas()
            .subscribe(
                (resp: ApiResponse<{ label: string; value: string }[]>) => {
                    if (resp.typeResponse === 'SUCCESS') {
                        this.asignaturas = resp.data;
                    }
                }
            );
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

    onEditarCurso(id: number): void {
        const curso = this.cursos.find((c) => c.id === id);
        if (!curso) return;
        this.form.patchValue({
            grupo: curso.grupo,
            asignatura: curso.asignatura,
            docente: curso.docente,
            fecha: curso.fecha,
        });
        this.editMode = true;
        this.editCursoId = id;
        this.displayModal = true;
    }
    actualizarCurso(id: number, value: CursoUI): void {
        const idx = this.cursos.findIndex((c) => c.id === id);
        if (idx > -1) {
            this.cursos[idx] = {
                ...this.cursos[idx],
                grupo: value.grupo,
                asignatura: value.asignatura,
                docente: value.docente,
                fecha: value.fecha,
            };
        }
    }

    cancelarModal(): void {
        this.displayModal = false;
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
}
