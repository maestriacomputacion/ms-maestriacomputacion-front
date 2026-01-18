import { Component, OnInit } from '@angular/core';
import { CursoCorreo } from '../../../models/correos.model';

@Component({
    selector: 'app-enviar-correo-matricula-final',
    templateUrl: './enviar-correo-matricula-final.component.html',
    styleUrls: ['./enviar-correo-matricula-final.component.scss'],
})
export class EnviarCorreoMatriculaFinalComponent implements OnInit {
    periodos = [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
    ];
    anios = Array.from({ length: 6 }, (_, idx) => {
        const year = new Date().getFullYear() + idx;
        return { label: `${year}`, value: year };
    });
    periodoSeleccionado = 1;
    anioSeleccionado = this.anios[0].value;

    tiposAsignatura = [
        { label: 'Fundamentación', value: 'fundamentacion' },
        { label: 'Electiva', value: 'electiva' },
        { label: 'Complementación', value: 'complementacion' },
        { label: 'Seminario de investigación', value: 'seminario' },
        { label: 'Propuesta de trabajo de grado', value: 'propuesta' },
        { label: 'Trabajo de grado I', value: 'tg1' },
        { label: 'Trabajo de grado II', value: 'tg2' },
    ];
    tiposSeleccionados: string[] = [];

    cursos: CursoCorreo[] = [
        {
            id: 1,
            grupo: 'A',
            asignatura: 'Metodología de la Investigación',
            docente: 'Andrés Pérez',
            tipo: 'fundamentacion',
        },
        {
            id: 2,
            grupo: 'B',
            asignatura: 'Aprendizaje profundo',
            docente: 'Felipe Martínez',
            tipo: 'electiva',
        },
        {
            id: 3,
            grupo: 'C',
            asignatura: 'Ingeniería de la colaboración',
            docente: 'Laura Gómez',
            tipo: 'complementacion',
        },
        {
            id: 4,
            grupo: 'D',
            asignatura: 'Propuesta de Trabajo de Grado',
            docente: 'Patricia García',
            tipo: 'propuesta',
        },
    ];
    cursosFiltrados: CursoCorreo[] = [];
    seleccion: CursoCorreo[] = [];

    ngOnInit(): void {
        this.aplicarFiltros();
    }

    toggleTipo(tipo: string): void {
        if (this.tiposSeleccionados.includes(tipo)) {
            this.tiposSeleccionados = this.tiposSeleccionados.filter(
                (t) => t !== tipo
            );
        } else {
            this.tiposSeleccionados = [...this.tiposSeleccionados, tipo];
        }
        this.aplicarFiltros();
    }

    limpiarFiltros(): void {
        this.tiposSeleccionados = [];
        this.aplicarFiltros();
    }

    aplicarFiltros(): void {
        this.cursosFiltrados = this.cursos.filter((curso) => {
            if (!this.tiposSeleccionados.length) {
                return true;
            }
            return this.tiposSeleccionados.includes(curso.tipo);
        });
    }

    enviarCorreo(): void {}
}
