import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CursoCorreo } from '../../../models/correos.model';
import { CatalogoOption } from '../../../models/catalogo.model';
import { BackendCurso } from '../../../models/curso.model';
import { NotificacionPrematriculaTutor } from '../../../models/notificacion-prematricula.model';
import { CatalogoAcademicoService } from '../../../services/catalogo-academico.service';
import { CursoService } from '../../../services/curso.service';
import { CorreoMatriculaFinalService } from '../../../services/correo-matricula-final.service';

type ResumenEstudiante = {
    tutorNombre: string;
    tutorCodigo: string;
    estudianteNombre: string;
    estudianteCodigo: string;
    estudianteCorreo: string;
};

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
    enviando = false;

    resumenVisible = false;
    resumenMessage = '';
    resumenNotificaciones: NotificacionPrematriculaTutor[] = [];
    resumenEstudiantes: ResumenEstudiante[] = [];
    totalTutoresNotificados = 0;
    totalEstudiantesNotificados = 0;

    constructor(
        private readonly cursoService: CursoService,
        private readonly catalogoAcademicoService: CatalogoAcademicoService,
        private readonly correoMatriculaFinalService: CorreoMatriculaFinalService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.cargarAsignaturas();
        this.cargarCursos();
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

    enviarCorreo(): void {
        if (!this.seleccion.length) {
            return;
        }
        if (this.enviando) {
            return;
        }
        const cursoIds = Array.from(
            new Set(this.seleccion.map((curso) => curso.id))
        );
        this.enviando = true;
        this.correoMatriculaFinalService
            .enviarCorreoMatriculaFinalPorCursos({ cursoIds })
            .subscribe({
                next: (response) => {
                    if (response.typeResponse === 'SUCCESS') {
                        this.actualizarResumenNotificacion(
                            response.message,
                            response.data
                        );
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: response.message,
                        });
                        this.seleccion = [];
                        this.resumenVisible = true;
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: response.message,
                        });
                    }
                    this.enviando = false;
                },
                error: (err) => {
                    console.error(
                        'Error enviando correo de matricula final',
                        err
                    );
                    const detail =
                        err?.error?.message ||
                        err?.message ||
                        'Error enviando correo de matricula final';
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail,
                    });
                    this.enviando = false;
                },
            });
    }

    cerrarResumen(): void {
        this.resumenVisible = false;
    }

    private actualizarResumenNotificacion(
        message: string,
        data: NotificacionPrematriculaTutor[] | null | undefined
    ): void {
        const listado = data ?? [];
        const estudiantesListado = listado.reduce<ResumenEstudiante[]>(
            (acc, item) => {
                const estudiantes = item.estudiantes ?? [];
                const mapped = estudiantes.map((estudiante) => {
                    const nombre = `${estudiante.persona?.nombre ?? ''} ${
                        estudiante.persona?.apellido ?? ''
                    }`.trim();
                    return {
                        tutorNombre: item.nombre,
                        tutorCodigo: item.codigo,
                        estudianteNombre: nombre || 'Sin nombre',
                        estudianteCodigo: estudiante.codigo ?? '',
                        estudianteCorreo:
                            estudiante.correoUniversidad ??
                            estudiante.persona?.correoElectronico ??
                            '',
                    };
                });
                return acc.concat(mapped);
            },
            []
        );

        this.resumenMessage = message;
        this.resumenNotificaciones = listado;
        this.totalTutoresNotificados = listado.length;
        this.resumenEstudiantes = estudiantesListado;
        this.totalEstudiantesNotificados =
            estudiantesListado.length > 0
                ? estudiantesListado.length
                : listado.reduce(
                      (acc, item) =>
                          acc +
                          Number(item.totalEstudiantesConMatriculaActiva ?? 0),
                      0
                  );
    }

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
