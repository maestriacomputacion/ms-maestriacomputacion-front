import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CursoOfertadoReporte } from '../../models/correos.model';
import { CursoService } from '../../services/curso.service';
import { PeriodoAcademicoService } from '../../services/periodo-academico.service';
import { HttpClient } from '@angular/common/http';
import { matricula_academica } from 'src/environments/environment';
import { BackendCurso } from '../../models/curso.model';
import { ApiResponse } from '../../models/api-response.model';

@Component({
    selector: 'app-reporte-cursos-ofertados',
    templateUrl: './reporte-cursos-ofertados.component.html',
    styleUrls: ['./reporte-cursos-ofertados.component.scss'],
})
export class ReporteCursosOfertadosComponent implements OnInit, OnDestroy {
    periodoNumero = 1;
    periodoAnio = new Date().getFullYear();
    periodos = [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
    ];
    anios = Array.from({ length: 6 }, (_, index) => {
        const year = new Date().getFullYear() + index;
        return { label: `${year}`, value: year };
    });

    tiposAsignatura: Array<{ label: string; value: string }> = [];
    tiposSeleccionados: string[] = [];

    buscador = '';

    cursos: CursoOfertadoReporte[] = [];
    cursosFiltrados: CursoOfertadoReporte[] = [];
    seleccionCursos: CursoOfertadoReporte[] = [];

    periodoActivoId: string | null = null;

    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly cursoService: CursoService,
        private readonly periodoService: PeriodoAcademicoService,
        private readonly http: HttpClient
    ) {}

    ngOnInit(): void {
        this.cargarAsignaturas();
        this.cargarPeriodoActivoYCursos();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private cargarAsignaturas(): void {
        this.cursoService
            .getAsignaturas()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.typeResponse === 'SUCCESS') {
                        this.tiposAsignatura = response.data || [];
                    }
                },
                error: (err) => {
                    console.error('Error cargando asignaturas', err);
                },
            });
    }

    private cargarPeriodoActivoYCursos(): void {
        this.periodoService
            .getPeriodoActivo()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.typeResponse === 'SUCCESS' && response.data) {
                        this.periodoActivoId = String(response.data.id);
                        this.cargarCursos();
                    } else {
                        console.warn(
                            'No hay período activo, cargando todos los cursos'
                        );
                        this.cargarCursos();
                    }
                },
                error: (err) => {
                    console.error('Error obteniendo período activo', err);
                    this.cargarCursos();
                },
            });
    }

    private cargarCursos(): void {
        const params: any = {};
        if (this.periodoActivoId) {
            params.idPeriodo = this.periodoActivoId;
        }

        const url = `${matricula_academica.api_url}cursos`;
        this.http
            .get<ApiResponse<BackendCurso[]>>(url, { params })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.typeResponse === 'SUCCESS') {
                        // Transformar BackendCurso a CursoOfertadoReporte
                        this.cursos = (response.data || []).map((curso) => ({
                            id: curso.id,
                            grupo: curso.grupo,
                            asignatura: curso.asignatura?.nombre || '',
                            idAsignatura: curso.asignatura?.id,
                            docente: (curso.docentes || [])
                                .map((d) => {
                                    const nombreCompleto = d.persona
                                        ? `${d.persona.nombre ?? ''} ${
                                              d.persona.apellido ?? ''
                                          }`.trim()
                                        : '';
                                    return nombreCompleto || d.codigo || '';
                                })
                                .filter((v: string) => !!v)
                                .join(', '),
                            areaFormacion: '',
                            tipoAsignatura: '',
                        }));
                        this.aplicarFiltros();
                    }
                },
                error: (err) => {
                    console.error('Error cargando cursos', err);
                },
            });
    }

    onBuscar(term: string): void {
        this.buscador = term;
        this.aplicarFiltros();
    }

    toggleTipoSeleccionado(tipo: string): void {
        if (this.tiposSeleccionados.includes(tipo)) {
            this.tiposSeleccionados = this.tiposSeleccionados.filter(
                (item) => item !== tipo
            );
        } else {
            this.tiposSeleccionados = [...this.tiposSeleccionados, tipo];
        }
        this.aplicarFiltros();
    }

    limpiarFiltros(): void {
        this.tiposSeleccionados = [];
        this.buscador = '';
        this.aplicarFiltros();
    }

    aplicarFiltros(): void {
        const termino = this.buscador.toLowerCase();

        this.cursosFiltrados = this.cursos.filter((curso) => {
            // Filtrar por asignaturas seleccionadas (por ID)
            const coincideTipo =
                this.tiposSeleccionados.length === 0 ||
                (curso.idAsignatura &&
                    this.tiposSeleccionados.includes(
                        String(curso.idAsignatura)
                    ));

            // Filtrar por búsqueda de texto
            const coincideBusqueda =
                !termino ||
                curso.grupo.toLowerCase().includes(termino) ||
                curso.asignatura.toLowerCase().includes(termino) ||
                curso.docente.toLowerCase().includes(termino) ||
                curso.areaFormacion.toLowerCase().includes(termino);

            return coincideTipo && coincideBusqueda;
        });
    }
}
