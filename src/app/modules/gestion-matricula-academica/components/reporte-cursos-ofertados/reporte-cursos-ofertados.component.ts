import { Component, OnInit } from '@angular/core';

interface CursoOfertadoReporte {
    id: number;
    grupo: string;
    asignatura: string;
    docente: string;
    areaFormacion: string;
    tipoAsignatura: string;
}

@Component({
    selector: 'app-reporte-cursos-ofertados',
    templateUrl: './reporte-cursos-ofertados.component.html',
    styleUrls: ['./reporte-cursos-ofertados.component.scss'],
})
export class ReporteCursosOfertadosComponent implements OnInit {
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

    tiposAsignatura = [
        { label: 'Fundamentación', value: 'fundamentacion' },
        { label: 'Electiva', value: 'electiva' },
        { label: 'Complementariedad', value: 'complementariedad' },
        { label: 'Seminario de investigación', value: 'seminario' },
        { label: 'Propuesta de trabajo de grado', value: 'propuesta' },
        { label: 'Trabajo de grado I', value: 'tg1' },
        { label: 'Trabajo de grado II', value: 'tg2' },
    ];
    tiposSeleccionados: string[] = [];

    buscador = '';

    cursos: CursoOfertadoReporte[] = [
        {
            id: 1,
            grupo: 'A',
            asignatura: 'Metodología de la Investigación',
            docente: 'Andrés Pérez',
            areaFormacion: 'Fundamentación',
            tipoAsignatura: 'fundamentacion',
        },
        {
            id: 2,
            grupo: 'B',
            asignatura: 'Aprendizaje profundo',
            docente: 'Felipe Martínez',
            areaFormacion: 'Electiva',
            tipoAsignatura: 'electiva',
        },
        {
            id: 3,
            grupo: 'C',
            asignatura: 'Ingeniería de Software',
            docente: 'Laura Gómez',
            areaFormacion: 'Complementariedad',
            tipoAsignatura: 'complementariedad',
        },
        {
            id: 4,
            grupo: 'D',
            asignatura: 'Propuesta de Trabajo de Grado',
            docente: 'Andrés Castillo',
            areaFormacion: 'Propuesta de trabajo de grado',
            tipoAsignatura: 'propuesta',
        },
    ];
    cursosFiltrados: CursoOfertadoReporte[] = [];
    seleccionCursos: CursoOfertadoReporte[] = [];

    ngOnInit(): void {
        this.aplicarFiltros();
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
            const coincideTipo =
                this.tiposSeleccionados.length === 0 ||
                this.tiposSeleccionados.includes(curso.tipoAsignatura);
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
