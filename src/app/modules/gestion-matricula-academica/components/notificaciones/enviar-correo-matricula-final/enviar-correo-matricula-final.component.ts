import { Component, OnInit } from '@angular/core';
import { CursoCorreo } from '../../../models/correos.model';
import { CatalogoOption } from '../../../models/catalogo.model';
import { BackendCurso } from '../../../models/curso.model';
import { CatalogoAcademicoService } from '../../../services/catalogo-academico.service';
import { CursoService } from '../../../services/curso.service';

@Component({
    selector: 'app-enviar-correo-matricula-final',
    templateUrl: './enviar-correo-matricula-final.component.html',
    styleUrls: ['./enviar-correo-matricula-final.component.scss'],
})
export class EnviarCorreoMatriculaFinalComponent implements OnInit {
    asignaturasOptions: CatalogoOption[] = [];
    asignaturasSeleccionadas: string[] = [];

    cursos: CursoCorreo[] = [];
    cursosFiltrados: CursoCorreo[] = [];
    seleccion: CursoCorreo[] = [];

    constructor(
        private readonly cursoService: CursoService,
        private readonly catalogoAcademicoService: CatalogoAcademicoService
    ) {}

    ngOnInit(): void {
        this.cargarAsignaturas();
        this.cargarCursos();
    }

    toggleAsignatura(asignaturaId: string): void {
        if (this.asignaturasSeleccionadas.includes(asignaturaId)) {
            this.asignaturasSeleccionadas = this.asignaturasSeleccionadas.filter(
                (id) => id !== asignaturaId
            );
        } else {
            this.asignaturasSeleccionadas = [
                ...this.asignaturasSeleccionadas,
                asignaturaId,
            ];
        }
        this.aplicarFiltros();
    }

    limpiarFiltros(): void {
        this.asignaturasSeleccionadas = [];
        this.aplicarFiltros();
    }

    aplicarFiltros(): void {
        this.cursosFiltrados = this.cursos.filter((curso) => {
            if (!this.asignaturasSeleccionadas.length) {
                return true;
            }
            return this.asignaturasSeleccionadas.includes(
                String(curso.asignaturaId)
            );
        });
    }

    enviarCorreo(): void {}

    private cargarCursos(): void {
        this.cursoService.getCursosMatriculaAprobada().subscribe((response) => {
            this.cursos = (response.data ?? []).map((curso) =>
                this.mapCursoCorreo(curso)
            );
            this.aplicarFiltros();
        });
    }

    private cargarAsignaturas(): void {
        this.catalogoAcademicoService.getAsignaturas().subscribe((response) => {
            this.asignaturasOptions = response.data ?? [];
        });
    }

    private mapCursoCorreo(curso: BackendCurso): CursoCorreo {
        const docente = (curso.docentes ?? [])
            .map((item) => {
                const persona = item.persona;
                if (persona) {
                    return `${persona.nombre ?? ''} ${
                        persona.apellido ?? ''
                    }`.trim();
                }
                return item.codigo ?? '';
            })
            .filter((value) => !!value)
            .join(', ');

        return {
            id: Number(curso.id),
            grupo: curso.grupo,
            asignaturaId: Number(curso.asignatura?.id ?? 0),
            asignatura: curso.asignatura?.nombre ?? '',
            docente,
            tipo: curso.asignatura?.tipo ?? '',
        };
    }
}
