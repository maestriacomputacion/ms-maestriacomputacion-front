import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PeriodoAcademicoService } from '../../services/periodo-academico.service';
import { CursoService } from '../../services/curso.service';
import { ApiResponse } from '../../models/api-response.model';
import {
    MatriculaRealizada,
    CursoDetallado,
    PeriodoBasico,
    MatriculaResumen,
} from '../../models/matricula.model';
import { BuscadorEstudiantesComponent } from 'src/app/shared/components/buscador-estudiantes/buscador-estudiantes.component';

@Component({
    selector: 'app-listado-matriculas',
    templateUrl: './listado-matriculas.component.html',
    styleUrls: ['./listado-matriculas.component.scss'],
})
export class ListadoMatriculasComponent implements OnInit {
    loading = false;

    periodosOptions: { label: string; value: string }[] = [];
    asignaturasOptions: { label: string; value: string }[] = [];
    estadoOptions: { label: string; value: string }[] = [
        { label: 'Todos', value: '' },
        { label: 'Aprobada', value: 'APROBADA' },
        { label: 'Pendiente', value: 'PENDIENTE' },
        { label: 'Rechazada', value: 'RECHAZADA' },
    ];

    selectedPeriodo: string | null = null;
    selectedAsignatura: string | null = null;
    selectedEstado: string | null = null;
    selectedEstudiante: {
        id?: number;
        codigo?: string;
        nombre?: string;
    } | null = null;

    matriculas: MatriculaRealizada[] = [];
    cursosBackend: CursoDetallado[] = [];
    resumenFiltrado: MatriculaResumen[] = [];
    globalSearch: string = '';

    refDialog: DynamicDialogRef | null = null;

    constructor(
        private readonly periodoService: PeriodoAcademicoService,
        private readonly cursoService: CursoService,
        private readonly router: Router,
        private readonly dialogService: DialogService
    ) {}

    ngOnInit(): void {
        this.cargarFiltrosBase();
        this.cargarDatosMock();
        this.aplicarFiltros();
    }

    cargarFiltrosBase(): void {
        this.periodoService.getPeriodos().subscribe({
            next: (resp: ApiResponse<any[]>) => {
                this.periodosOptions = [{ label: 'Todos', value: '' }].concat(
                    (resp.data || []).map((p) => ({
                        label: this.formatearPeriodoLabel(p),
                        value: p.descripcion || `Periodo ${p.tagPeriodo}`,
                    }))
                );
            },
        });

        this.cursoService.getAsignaturas().subscribe({
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

    cargarDatosMock(): void {
        const periodoBase: PeriodoBasico = {
            id: 1,
            fechaInicio: '2025-01-15',
            fechaFin: '2025-06-15',
            fechaFinMatricula: '2025-01-30',
            tagPeriodo: 1,
            descripcion: '2025-1',
            estado: 'ACTIVO',
        };

        const cursoA: CursoDetallado = {
            id: 101,
            grupo: 'A',
            periodo: periodoBase,
            periodoDescripcion: '2025-1',
            asignatura: {
                id: 1,
                nombre: 'Arquitectura de Software',
                codigo: 'ARQS01',
                estado: true,
                areaFormacion: 1,
                creditos: 3,
            },
            docentes: [],
            materiales: [],
        };

        const cursoB: CursoDetallado = {
            id: 102,
            grupo: 'B',
            periodo: periodoBase,
            periodoDescripcion: '2025-1',
            asignatura: {
                id: 2,
                nombre: 'Investigación I',
                codigo: 'INV01',
                estado: true,
                areaFormacion: 1,
                creditos: 3,
            },
            docentes: [],
            materiales: [],
        };

        const cursoC: CursoDetallado = {
            id: 103,
            grupo: 'A',
            periodo: periodoBase,
            periodoDescripcion: '2025-1',
            asignatura: {
                id: 3,
                nombre: 'Minería de Datos',
                codigo: 'MD01',
                estado: true,
                areaFormacion: 1,
                creditos: 3,
            },
            docentes: [],
            materiales: [],
        };

        const estudiantes = [
            { id: 1, codigo: 'MC2024001', nombre: 'Ana María González' },
            { id: 2, codigo: 'MC2024002', nombre: 'Juan Pérez' },
            { id: 3, codigo: 'MC2024003', nombre: 'Luisa Martínez' },
        ];

        this.matriculas = [
            {
                id: 1,
                estudiante: {
                    id: estudiantes[0].id,
                    codigo: estudiantes[0].codigo,
                    persona: { nombre: 'Ana María', apellido: 'González' },
                },
                curso: cursoA,
                periodo: periodoBase,
                estado: 'APROBADA',
                observacion: '',
            },
            {
                id: 2,
                estudiante: {
                    id: estudiantes[1].id,
                    codigo: estudiantes[1].codigo,
                    persona: { nombre: 'Juan', apellido: 'Pérez' },
                },
                curso: cursoA,
                periodo: periodoBase,
                estado: 'APROBADA',
                observacion: '',
            },
            {
                id: 3,
                estudiante: {
                    id: estudiantes[2].id,
                    codigo: estudiantes[2].codigo,
                    persona: { nombre: 'Luisa', apellido: 'Martínez' },
                },
                curso: cursoA,
                periodo: periodoBase,
                estado: 'PENDIENTE',
                observacion: '',
            },
            {
                id: 4,
                estudiante: {
                    id: estudiantes[0].id,
                    codigo: estudiantes[0].codigo,
                    persona: { nombre: 'Ana María', apellido: 'González' },
                },
                curso: cursoB,
                periodo: periodoBase,
                estado: 'RECHAZADA',
                observacion: '',
            },
            {
                id: 5,
                estudiante: {
                    id: estudiantes[1].id,
                    codigo: estudiantes[1].codigo,
                    persona: { nombre: 'Juan', apellido: 'Pérez' },
                },
                curso: cursoB,
                periodo: periodoBase,
                estado: 'PENDIENTE',
                observacion: '',
            },
            {
                id: 6,
                estudiante: {
                    id: estudiantes[2].id,
                    codigo: estudiantes[2].codigo,
                    persona: { nombre: 'Luisa', apellido: 'Martínez' },
                },
                curso: cursoC,
                periodo: periodoBase,
                estado: 'APROBADA',
                observacion: '',
            },
        ];

        this.cursosBackend = [cursoA, cursoB, cursoC];
    }

    aplicarFiltros(): void {
        const grouped = this.agruparMatriculas();
        let data = this.construirResumen(grouped);
        data = this.aplicarFiltrosPeriodo(data);
        data = this.aplicarFiltrosAsignatura(data);
        data = this.aplicarFiltrosEstado(data);
        data = this.aplicarFiltrosEstudiante(data, grouped);
        data = this.aplicarBusquedaGlobal(data);
        this.resumenFiltrado = data;
    }

    private agruparMatriculas(): Map<
        number,
        {
            resumen: MatriculaResumen;
            estados: Set<string>;
            estudiantes: Set<number>;
        }
    > {
        const grouped = new Map<
            number,
            {
                resumen: MatriculaResumen;
                estados: Set<string>;
                estudiantes: Set<number>;
            }
        >();
        for (const m of this.matriculas) {
            const key = m.curso?.id || 0;
            if (!grouped.has(key)) {
                grouped.set(key, {
                    resumen: {
                        cursoId: key,
                        periodoDescripcion: m.curso?.periodoDescripcion || '—',
                        asignatura: m.curso?.asignatura?.nombre || '—',
                        grupo: m.curso?.grupo || '—',
                        estado: m.estado || '—',
                        cantidadEstudiantes: 0,
                    },
                    estados: new Set<string>(),
                    estudiantes: new Set<number>(),
                });
            }
            const item = grouped.get(key);
            if (!item) continue;
            item.resumen.cantidadEstudiantes += 1;
            if (m.estado) item.estados.add(m.estado);
            const estId = (m.estudiante as any)?.id;
            if (estId) item.estudiantes.add(estId);
        }
        return grouped;
    }

    private construirResumen(
        grouped: Map<
            number,
            {
                resumen: MatriculaResumen;
                estados: Set<string>;
                estudiantes: Set<number>;
            }
        >
    ): MatriculaResumen[] {
        return Array.from(grouped.values()).map(({ resumen, estados }) => ({
            ...resumen,
            estado: estados.size > 1 ? 'MIXTO' : Array.from(estados)[0] || '—',
        }));
    }

    private formatearPeriodoLabel(periodo: PeriodoBasico): string {
        const fechaInicio = periodo.fechaInicio || '—';
        const fechaFin = periodo.fechaFin || '—';
        const tag =
            periodo.tagPeriodo !== undefined && periodo.tagPeriodo !== null
                ? String(periodo.tagPeriodo)
                : 'Sin tag';
        return `${fechaInicio} - ${fechaFin} (${tag})`;
    }

    private aplicarFiltrosPeriodo(
        data: MatriculaResumen[]
    ): MatriculaResumen[] {
        if (!this.selectedPeriodo || this.selectedPeriodo === '') return data;
        return data.filter((d) =>
            d.periodoDescripcion?.includes(this.selectedPeriodo || '')
        );
    }

    private aplicarFiltrosAsignatura(
        data: MatriculaResumen[]
    ): MatriculaResumen[] {
        if (!this.selectedAsignatura || this.selectedAsignatura === '')
            return data;
        const label = this.getAsignaturaLabel(
            this.selectedAsignatura
        ).toLowerCase();
        return data.filter((d) =>
            String(d.asignatura).toLowerCase().includes(label)
        );
    }

    private aplicarFiltrosEstado(data: MatriculaResumen[]): MatriculaResumen[] {
        if (!this.selectedEstado || this.selectedEstado === '') return data;
        return data.filter((d) => d.estado === this.selectedEstado);
    }

    private aplicarFiltrosEstudiante(
        data: MatriculaResumen[],
        grouped: Map<
            number,
            {
                resumen: MatriculaResumen;
                estados: Set<string>;
                estudiantes: Set<number>;
            }
        >
    ): MatriculaResumen[] {
        if (!this.selectedEstudiante?.id) return data;
        return data.filter((d) => {
            const original = Array.from(grouped.values()).find(
                (v) => v.resumen.cursoId === d.cursoId
            );
            return original
                ? original.estudiantes.has(this.selectedEstudiante!.id!)
                : false;
        });
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
        this.selectedPeriodo = null;
        this.selectedAsignatura = null;
        this.selectedEstado = null;
        this.selectedEstudiante = null;
        this.globalSearch = '';
        this.aplicarFiltros();
    }

    abrirBuscadorEstudiantes(): void {
        this.refDialog = this.dialogService.open(BuscadorEstudiantesComponent, {
            header: 'Buscar estudiante',
            width: '60%',
        });
        this.refDialog.onClose.subscribe((result: any) => {
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
        });
    }

    getAsignaturaLabel(value: string | null): string {
        if (!value) return '';
        const found = this.asignaturasOptions.find((a) => a.value === value);
        return found?.label || String(value);
    }

    irAGestionMatriculaCurso(): void {
        this.router.navigate([
            '/gestion-matricula-academica/gestion-matricula-curso',
        ]);
    }

}
