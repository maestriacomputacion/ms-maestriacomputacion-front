import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PeriodoAcademicoService } from '../../../services/periodo-academico.service';
import { CatalogoAcademicoService } from '../../../services/catalogo-academico.service';
import { MatriculaResumenService } from '../../../services/matricula-resumen.service';
import { ApiResponse } from '../../../models/api-response.model';
import {
    PeriodoBasico,
    MatriculaResumen,
    MatriculaResumenBackend,
} from '../../../models/matricula.model';
import { PeriodoAcademico } from '../../../models/periodo-academico.model';
import { EstudianteBusqueda } from '../../../models/estudiante-busqueda.model';
import { BuscadorEstudiantesAcademicoComponent } from '../../estudiantes/buscador-estudiantes-academico/buscador-estudiantes-academico.component';
import { MATRICULA_ESTADO_OPTIONS } from '../../../constants/matricula-estados';

@Component({
    selector: 'app-listado-matriculas',
    templateUrl: './listado-matriculas.component.html',
    styleUrls: ['./listado-matriculas.component.scss'],
})
export class ListadoMatriculasComponent implements OnInit {
    loading = false;

    periodosOptions: {
        label: string;
        value: string;
        fechaInicio: string;
        fechaFin: string;
    }[] = [];
    asignaturasOptions: { label: string; value: string }[] = [];
    estadoOptions: { label: string; value: string }[] =
        MATRICULA_ESTADO_OPTIONS;

    selectedPeriodoId: string | null = null;
    selectedAsignatura: string | null = null;
    selectedEstado: string | null = null;
    selectedEstudiante: {
        id?: number;
        codigo?: string;
        nombre?: string;
    } | null = null;

    resumenMatriculas: MatriculaResumen[] = [];
    resumenFiltrado: MatriculaResumen[] = [];
    globalSearch: string = '';

    refDialog: DynamicDialogRef | null = null;

    constructor(
        private readonly periodoService: PeriodoAcademicoService,
        private readonly catalogoAcademicoService: CatalogoAcademicoService,
        private readonly matriculaResumenService: MatriculaResumenService,
        private readonly router: Router,
        private readonly dialogService: DialogService
    ) {}

    ngOnInit(): void {
        this.cargarFiltrosBase();
    }

    cargarFiltrosBase(): void {
        this.periodoService.getPeriodos().subscribe({
            next: (resp: ApiResponse<PeriodoAcademico[]>) => {
                const periodos = resp.data || [];
                this.periodosOptions = periodos.map((p) => ({
                    label: this.formatearPeriodoLabel(p),
                    value: String(p.id),
                    fechaInicio: this.formatearFecha(p.fechaInicio),
                    fechaFin: this.formatearFecha(p.fechaFin),
                }));
                const periodoActivo = periodos.find(
                    (p) => p.estado === 'ACTIVO'
                );
                let periodoDefaultId: string | null = null;
                if (periodoActivo) {
                    periodoDefaultId = String(periodoActivo.id);
                } else if (periodos.length > 0) {
                    periodoDefaultId = String(periodos[0].id);
                }
                if (periodoDefaultId) {
                    setTimeout(() => {
                        this.selectedPeriodoId = periodoDefaultId;
                        this.aplicarFiltros();
                    }, 0);
                }
            },
        });

        this.catalogoAcademicoService.getAsignaturas().subscribe({
            next: (resp) => {
                this.asignaturasOptions = [
                    { label: 'Todas', value: '' },
                ].concat(resp.data || []);
            },
            error: () => {
                this.asignaturasOptions = [{ label: 'Todas', value: '' }];
            },
        });
    }

    aplicarFiltros(): void {
        if (!this.selectedPeriodoId) {
            this.resumenFiltrado = [];
            return;
        }
        this.cargarMatriculasPorPeriodo(
            this.selectedPeriodoId,
            this.selectedEstudiante?.id,
            this.selectedAsignatura || undefined
        );
    }

    private cargarMatriculasPorPeriodo(
        periodoId: string,
        estudianteId?: number,
        asignatura?: string
    ): void {
        this.loading = true;
        this.matriculaResumenService
            .getMatriculasResumen(periodoId, estudianteId, asignatura)
            .subscribe({
                next: (resp: ApiResponse<MatriculaResumenBackend[]>) => {
                    if (resp?.typeResponse === 'SUCCESS') {
                        this.resumenMatriculas = (resp.data || []).map((item) =>
                            this.mapToResumen(item)
                        );
                    } else {
                        this.resumenMatriculas = [];
                    }
                    this.aplicarFiltrosLocales();
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error cargando matrículas', err);
                    this.resumenMatriculas = [];
                    this.aplicarFiltrosLocales();
                    this.loading = false;
                },
            });
    }

    private mapToResumen(item: MatriculaResumenBackend): MatriculaResumen {
        const descripcion = this.formatearPeriodoDescripcion(item.periodo);
        return {
            cursoId: item.idCurso,
            periodoId: item.periodo?.id,
            periodoDescripcion: descripcion,
            asignatura: item.asignatura,
            grupo: item.grupo,
            estado: item.estado,
            cantidadEstudiantes: item.cantidadEstudiante,
        };
    }

    private formatearPeriodoLabel(
        periodo: PeriodoBasico | PeriodoAcademico
    ): string {
        return this.formatearPeriodoDescripcion(periodo);
    }

    private formatearPeriodoDescripcion(
        periodo?: PeriodoBasico | PeriodoAcademico | null
    ): string {
        if (!periodo) return 'Período -';
        const fechaInicio = this.formatearFecha(periodo.fechaInicio);
        const fechaFin = this.formatearFecha(periodo.fechaFin);
        const rango = `${fechaInicio} - ${fechaFin}`;
        return periodo.estado === 'ACTIVO' ? `${rango} (activo)` : rango;
    }

    private formatearFecha(fecha?: string | null): string {
        if (!fecha) return '-';
        const parts = String(fecha).split('T')[0].split('-');
        if (parts.length !== 3) return String(fecha);
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    }

    private aplicarFiltrosLocales(): void {
        let data = [...this.resumenMatriculas];
        data = this.aplicarFiltrosEstado(data);
        data = this.aplicarBusquedaGlobal(data);
        this.resumenFiltrado = data;
    }

    private aplicarFiltrosEstado(data: MatriculaResumen[]): MatriculaResumen[] {
        if (!this.selectedEstado || this.selectedEstado === '') return data;
        return data.filter((d) => d.estado === this.selectedEstado);
    }

    private aplicarBusquedaGlobal(
        data: MatriculaResumen[]
    ): MatriculaResumen[] {
        if (!this.globalSearch || this.globalSearch.trim().length === 0)
            return data;
        const t = this.globalSearch.trim().toLowerCase();
        return data.filter(
            (d) =>
                (d.asignatura || '').toLowerCase().includes(t) ||
                (d.grupo || '').toLowerCase().includes(t) ||
                (d.periodoDescripcion || '').toLowerCase().includes(t)
        );
    }

    limpiarFiltros(): void {
        this.selectedAsignatura = null;
        this.selectedEstado = null;
        this.selectedEstudiante = null;
        this.globalSearch = '';
        this.aplicarFiltros();
    }

    abrirBuscadorEstudiantes(): void {
        this.refDialog = this.dialogService.open(
            BuscadorEstudiantesAcademicoComponent,
            {
                header: 'Buscar estudiante',
                width: '60%',
            }
        );
        this.refDialog.onClose.subscribe(
            (result: EstudianteBusqueda | null) => {
                if (result) {
                    this.selectedEstudiante = {
                        id: result.id,
                        codigo: result.identificacion || result.codigo,
                        nombre: `${result.nombre ?? result.persona?.nombre ?? ''} ${
                            result.apellido ?? result.persona?.apellido ?? ''
                        }`.trim(),
                    };
                    this.aplicarFiltros();
                }
            }
        );
    }

    onPeriodoSeleccionado(periodoId: string | null): void {
        this.selectedPeriodoId = periodoId;
        this.aplicarFiltros();
    }

    irAGestionMatriculaCurso(cursoId?: number): void {
        if (!cursoId) return;
        this.router.navigate([
            '/gestion-matricula-academica/cancelar-matricula-curso/',
            cursoId,
        ]);
    }
}
