import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import {
    MatriculaRealizada,
    MatriculaNoRealizada,
} from '../../models/matricula.model';

@Component({
    selector: 'app-resultado-matricula-masiva',
    templateUrl: './resultado-matricula-masiva.component.html',
    styleUrls: ['./resultado-matricula-masiva.component.scss'],
})
export class ResultadoMatriculaMasivaComponent implements OnInit {
    @Input() matriculasRealizadas: MatriculaRealizada[] = [];
    @Input() matriculasNoRealizadas: MatriculaNoRealizada[] = [];
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
            case 'realizar-matricula':
                return 'Matrícula por curso';
            default:
                return 'Operación';
        }
    }

    get resumen(): string {
        const ex = this.matriculasRealizadas?.length || 0;
        const ne = this.matriculasNoRealizadas?.length || 0;
        return `${ex} realizados • ${ne} no realizados`;
    }

    /** Asigna los datos recibidos por navigation state o history.state */
    private asignarDatosDeNavegacion(): void {
        const navigation = this.router.getCurrentNavigation();
        const state = navigation?.extras?.state ?? (history as any).state;
        if (state) {
            if (state.matriculasRealizadas) {
                this.matriculasRealizadas = state.matriculasRealizadas;
            }
            if (state.matriculasNoRealizadas) {
                this.matriculasNoRealizadas = state.matriculasNoRealizadas;
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
                if (this.origenNavegacion === 'matricula-masiva') {
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

    getDocentesNombres(docentes: any[]): string {
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
