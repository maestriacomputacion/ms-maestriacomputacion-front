import { Component, OnInit } from '@angular/core';
import { EstudianteCorreo } from '../../models/correos.model';

@Component({
    selector: 'app-enviar-correo-matricula-final-estudiante',
    templateUrl: './enviar-correo-matricula-final-estudiante.component.html',
    styleUrls: ['./enviar-correo-matricula-final-estudiante.component.scss'],
})
export class EnviarCorreoMatriculaFinalEstudianteComponent implements OnInit {
    estudiantes: EstudianteCorreo[] = [
        {
            id: 1,
            codigo: '2-121215',
            nombre: 'Camilo Ruiz Daza',
            correo: 'cruiz@unicuacua.edu.co',
        },
        {
            id: 2,
            codigo: '2-121216',
            nombre: 'Daniela Velasco González',
            correo: 'dvelasco@unicuacua.edu.co',
        },
        {
            id: 3,
            codigo: '2-121217',
            nombre: 'Luis Fernando Orozco',
            correo: 'lforozco@unicuacua.edu.co',
        },
    ];
    estudiantesFiltrados: EstudianteCorreo[] = [];
    seleccion: EstudianteCorreo[] = [];
    seleccionParaEnviar: EstudianteCorreo[] = [];

    busqueda = '';

    ngOnInit(): void {
        this.aplicarFiltro();
    }

    onBuscar(term: string): void {
        this.busqueda = term;
        this.aplicarFiltro();
    }

    aplicarFiltro(): void {
        const t = this.busqueda.toLowerCase();
        this.estudiantesFiltrados = this.estudiantes.filter(
            (e) =>
                !t ||
                e.codigo.toLowerCase().includes(t) ||
                e.nombre.toLowerCase().includes(t) ||
                e.correo.toLowerCase().includes(t)
        );
    }

    remover(estudiante: EstudianteCorreo): void {
        this.seleccion = this.seleccion.filter((e) => e.id !== estudiante.id);
    }

    removerEnvio(estudiante: EstudianteCorreo): void {
        this.seleccionParaEnviar = this.seleccionParaEnviar.filter(
            (e) => e.id !== estudiante.id
        );
    }

    agregarAEnvio(): void {
        const ids = this.seleccionParaEnviar.map((e) => e.id);
        const nuevos = this.seleccion.filter((e) => !ids.includes(e.id));
        this.seleccionParaEnviar = [...this.seleccionParaEnviar, ...nuevos];
    }

    enviarCorreos(): void {}
}
