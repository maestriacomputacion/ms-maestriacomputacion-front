import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

    constructor(private readonly router: Router) {}

    ngOnInit(): void {
        this.asignarDatosDeNavegacion();
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
        }
    }
}
