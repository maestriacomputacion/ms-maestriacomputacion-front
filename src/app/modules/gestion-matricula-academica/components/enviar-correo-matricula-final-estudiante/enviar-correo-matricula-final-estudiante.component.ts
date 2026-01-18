import { Component, OnInit } from '@angular/core';
import { EstudianteCorreo } from '../../models/correos.model';
import { CorreoMatriculaFinalService } from '../../services/correo-matricula-final.service';

@Component({
    selector: 'app-enviar-correo-matricula-final-estudiante',
    templateUrl: './enviar-correo-matricula-final-estudiante.component.html',
    styleUrls: ['./enviar-correo-matricula-final-estudiante.component.scss'],
})
export class EnviarCorreoMatriculaFinalEstudianteComponent implements OnInit {
    estudiantes: EstudianteCorreo[] = [];
    estudiantesFiltrados: EstudianteCorreo[] = [];
    seleccionParaEnviar: EstudianteCorreo[] = [];

    busqueda = '';

    constructor(
        private readonly correoMatriculaFinalService: CorreoMatriculaFinalService
    ) {}

    ngOnInit(): void {
        this.cargarEstudiantes();
    }

    onBuscar(term: string): void {
        this.busqueda = term;
        this.aplicarFiltro();
    }

    aplicarFiltro(): void {
        const t = this.busqueda.toLowerCase();
        const idsSeleccionados = new Set(
            this.seleccionParaEnviar.map((e) => e.id)
        );
        this.estudiantesFiltrados = this.estudiantes.filter((e) => {
            if (idsSeleccionados.has(e.id)) {
                return false;
            }
            return (
                !t ||
                e.codigo.toLowerCase().includes(t) ||
                e.nombre.toLowerCase().includes(t) ||
                e.correo.toLowerCase().includes(t)
            );
        });
    }

    removerEnvio(estudiante: EstudianteCorreo): void {
        this.seleccionParaEnviar = this.seleccionParaEnviar.filter(
            (e) => e.id !== estudiante.id
        );
        this.aplicarFiltro();
    }

    seleccionar(estudiante: EstudianteCorreo): void {
        if (this.estaSeleccionado(estudiante.id)) {
            return;
        }
        this.seleccionParaEnviar = [...this.seleccionParaEnviar, estudiante];
        this.aplicarFiltro();
    }

    estaSeleccionado(estudianteId: number): boolean {
        return this.seleccionParaEnviar.some((e) => e.id === estudianteId);
    }

    enviarCorreos(): void {
        if (!this.seleccionParaEnviar.length) {
            return;
        }

        const estudiantesId = this.seleccionParaEnviar.map((e) => e.id);
        this.correoMatriculaFinalService
            .enviarCorreoMatriculaFinal({ estudiantesId })
            .subscribe();
    }

    private cargarEstudiantes(): void {
        this.correoMatriculaFinalService
            .getEstudiantesConMatriculaFinal()
            .subscribe((response) => {
                this.estudiantes = response.data ?? [];
                this.aplicarFiltro();
            });
    }
}
