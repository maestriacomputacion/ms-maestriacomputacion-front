import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import {
    MatriculaEliminada,
    MatriculaRealizada,
    MatriculaNoRealizada,
    DocenteBasico,
    MatriculaResultadoState,
} from '../../../models/matricula.model';

@Component({
    selector: 'app-resultado-matricula-masiva',
    templateUrl: './resultado-matricula-masiva.component.html',
    styleUrls: ['./resultado-matricula-masiva.component.scss'],
})
export class ResultadoMatriculaMasivaComponent implements OnInit {
    @Input() matriculasProcesadas: MatriculaRealizada[] = [];
    @Input() matriculasNoProcesadas: MatriculaNoRealizada[] = [];
    @Input() matriculasEliminadas: MatriculaEliminada[] = [];
    origenNavegacion: string = 'matricula-masiva';

    constructor(
        private readonly router: Router,
        private readonly confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.asignarDatosDeNavegacion();
    }

    get origenLabel(): string {
        switch (this.origenNavegacion) {
            case 'matricula-masiva':
                return 'Matrícula masiva';
            case 'matricula-previa':
                return 'Matrícula previa';
            case 'realizar-matricula':
                return 'Matrícula por curso';
            default:
                return 'Operación';
        }
    }

    get resumen(): string {
        const ex = this.matriculasProcesadas?.length || 0;
        const ne = this.matriculasNoProcesadas?.length || 0;
        const del = this.matriculasEliminadas?.length || 0;
        return `${ex} realizados • ${ne} no realizados • ${del} eliminados`;
    }

    /** Asigna los datos recibidos por navigation state o history.state */
    private asignarDatosDeNavegacion(): void {
        const navigation = this.router.getCurrentNavigation();
        const state =
            (navigation?.extras?.state as
                | MatriculaResultadoState
                | undefined) ??
            (history as { state?: MatriculaResultadoState }).state;

        if (state) {
            if (state.matriculasProcesadas) {
                this.matriculasProcesadas = state.matriculasProcesadas;
            }
            if (state.matriculasNoProcesadas) {
                this.matriculasNoProcesadas = state.matriculasNoProcesadas;
            }
            if (state.matriculasEliminadas) {
                this.matriculasEliminadas = state.matriculasEliminadas;
            }
            if (state.origen) {
                this.origenNavegacion = state.origen;
            }
        }
    }

    finalizar(event: Event): void {
        this.confirmationService.confirm({
            target: event.target,
            message: '¿Está seguro que desea finalizar y volver al listado?',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                if (
                    this.origenNavegacion === 'matricula-masiva' ||
                    this.origenNavegacion === 'matricula-previa'
                ) {
                    this.router.navigate([
                        '/gestion-matricula-academica',
                        'gestion-estudiantes',
                    ]);
                } else if (this.origenNavegacion === 'realizar-matricula') {
                    this.router.navigate([
                        '/gestion-matricula-academica',
                        'gestion-matricula-curso',
                    ]);
                }
            },
        });
    }

    getDocentesNombres(docentes?: DocenteBasico[] | null): string {
        if (!docentes || docentes.length === 0) return '-';
        return docentes
            .map((d) => {
                if (d.persona?.nombre && d.persona?.apellido) {
                    return `${d.persona.nombre} ${d.persona.apellido}`;
                }
                return d.codigo || '-';
            })
            .join(', ');
    }
}
