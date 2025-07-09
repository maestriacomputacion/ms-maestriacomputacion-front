import { Component, OnInit } from '@angular/core';
import {
    MatriculaPreviaService,
    Estudiante,
    AsignaturaMatricular,
} from '../../services/matricula-previa.service';
import { ApiResponse } from '../../models/api-response.model';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-generar-matricula-previa',
    templateUrl: './generar-matricula-previa.component.html',
    styleUrls: ['./generar-matricula-previa.component.scss'],
})
export class GenerarMatriculaPreviaComponent implements OnInit {
    estudiante: Estudiante | null = null;
    asignaturas: AsignaturaMatricular[] = [];

    constructor(
        private readonly matriculaPreviaService: MatriculaPreviaService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit() {
        this.cargarDatosEstudiante();
        this.cargarAsignaturas();
    }

    cargarDatosEstudiante() {
        this.matriculaPreviaService
            .getEstudiante()
            .subscribe((resp: ApiResponse<Estudiante>) => {
                if (resp.typeResponse === 'SUCCESS') {
                    this.estudiante = resp.data;
                }
            });
    }

    cargarAsignaturas() {
        this.matriculaPreviaService
            .getAsignaturasMatricular()
            .subscribe((resp: ApiResponse<AsignaturaMatricular[]>) => {
                if (resp.typeResponse === 'SUCCESS') {
                    this.asignaturas = resp.data;
                }
            });
    }
}
