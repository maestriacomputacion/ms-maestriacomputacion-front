import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    periodos: { label: string; value: string }[] = [];
    periodoSeleccionado: string | null = null;

    areasFormacion: { label: string; value: string }[] = [];
    areaSeleccionada: string | null = null;

    asignaturas: { label: string; value: string }[] = [];
    asignaturaSeleccionada: string | null = null;

    constructor(
        private readonly fb: FormBuilder,
        private readonly cursoService: CursoService,
        private readonly periodoService: PeriodoAcademicoService,
        private readonly router: Router,
        private readonly route: ActivatedRoute
    ) {
        this.form = this.fb.group({
            grupo: ['', Validators.required],
            asignatura: ['', Validators.required],
            docente: ['', Validators.required],
            fecha: ['', Validators.required],
        });
    }

    ngOnInit() {
        // cargar periodos para el filtro
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

    onAgregarCurso() {
        // Navegar al formulario de registro de curso usando ruta absoluta para evitar problemas
        // con navegación relativa y estrategias de ubicación (hash)
        this.router.navigate([
            '/gestion-matricula-academica',
            'registrar-curso',
        ]);
    }

    onEditarCurso(id: number) {
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

    actualizarCurso(id: number, value: CursoUI) {
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

    cancelarModal() {
        this.displayModal = false;
    }

    onEliminarCurso(id: number) {
        this.cursos = this.cursos.filter((c) => c.id !== id);
    }
}
