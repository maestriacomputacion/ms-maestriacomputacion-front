import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CursoOfertadoReporte } from '../../../models/correos.model';
import { CatalogoAcademicoService } from '../../../services/catalogo-academico.service';
import { PeriodoAcademicoService } from '../../../services/periodo-academico.service';
import { HttpClient } from '@angular/common/http';
import { matricula_academica } from 'src/environments/environment';
import { BackendCurso } from '../../../models/curso.model';
import { ApiResponse } from '../../../models/api-response.model';
import { CursoService } from '../../../services/curso.service';

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
    mostrarDialogoReporte = false;
    formatoReporte: 'pdf' | 'xlsx' = 'pdf';
    generandoReporte = false;
    private readonly tiempoMinimoSpinnerMs = 1200;
    private spinnerTimeoutId: number | null = null;

    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly catalogoAcademicoService: CatalogoAcademicoService,
        private readonly periodoService: PeriodoAcademicoService,
        private readonly cursoService: CursoService,
        private readonly http: HttpClient
    ) {}

    ngOnInit(): void {
        this.cargarAsignaturas();
        this.cargarPeriodoActivoYCursos();
    }

    ngOnDestroy(): void {
        if (this.spinnerTimeoutId !== null) {
            clearTimeout(this.spinnerTimeoutId);
            this.spinnerTimeoutId = null;
        }
        this.destroy$.next();
        this.destroy$.complete();
    }

    private cargarAsignaturas(): void {
        this.catalogoAcademicoService
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
        const params: { idPeriodo?: string } = {};
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

    abrirDialogoReporte(): void {
        this.mostrarDialogoReporte = true;
    }

    cerrarDialogoReporte(): void {
        this.mostrarDialogoReporte = false;
    }

    generarReporte(): void {
        if (this.generandoReporte) {
            return;
        }
        const asignaturaIds = this.tiposSeleccionados
            .map(Number)
            .filter((id) => !Number.isNaN(id));
        const cursosIds = this.seleccionCursos
            .map((curso) => Number(curso.id))
            .filter((id) => !Number.isNaN(id));

        const payload = { asignaturaIds, cursosIds };

        this.generandoReporte = true;
        const inicioCarga = Date.now();
        this.cursoService
            .descargarReporteCursosOfertados(this.formatoReporte, payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.aplicarTiempoMinimoSpinner(() => {
                        const contentDisposition =
                            response.headers.get('content-disposition') ??
                            response.headers.get('Content-Disposition');
                        const nombreArchivo =
                            this.obtenerNombreArchivo(contentDisposition) ??
                            this.nombreArchivoConFecha();
                        if (!response.body) {
                            console.error(
                                'Respuesta vacia al generar reporte',
                                response
                            );
                            this.generandoReporte = false;
                            return;
                        }
                        const url = globalThis.URL.createObjectURL(
                            response.body
                        );
                        const enlace = document.createElement('a');
                        enlace.href = url;
                        enlace.download = nombreArchivo;
                        enlace.click();
                        globalThis.URL.revokeObjectURL(url);
                        this.generandoReporte = false;
                        this.cerrarDialogoReporte();
                    }, inicioCarga);
                },
                error: (err) => {
                    this.aplicarTiempoMinimoSpinner(() => {
                        console.error('Error generando reporte', err);
                        this.generandoReporte = false;
                    }, inicioCarga);
                },
            });
    }

    private aplicarTiempoMinimoSpinner(
        accion: () => void,
        inicioCarga: number
    ): void {
        const transcurrido = Date.now() - inicioCarga;
        const espera = Math.max(0, this.tiempoMinimoSpinnerMs - transcurrido);
        if (this.spinnerTimeoutId !== null) {
            clearTimeout(this.spinnerTimeoutId);
        }
        this.spinnerTimeoutId = globalThis.setTimeout(() => {
            this.spinnerTimeoutId = null;
            accion();
        }, espera) as unknown as number;
    }

    private obtenerNombreArchivo(
        contentDisposition: string | null
    ): string | null {
        if (!contentDisposition) {
            return null;
        }
        const match = /filename="([^"]+)"/i.exec(contentDisposition);
        if (match?.[1]) {
            return match[1];
        }
        const simpleMatch = /filename=([^;]+)/i.exec(contentDisposition);
        return simpleMatch?.[1]?.trim() ?? null;
    }

    private nombreArchivoConFecha(): string {
        const ahora = new Date();
        const pad = (value: number): string => String(value).padStart(2, '0');
        const fecha = `${ahora.getFullYear()}${pad(ahora.getMonth() + 1)}${pad(
            ahora.getDate()
        )}`;
        const hora = `${pad(ahora.getHours())}${pad(ahora.getMinutes())}${pad(
            ahora.getSeconds()
        )}`;
        return `reporte_curso_${fecha}_${hora}`;
    }
}
