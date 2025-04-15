import { Component, OnInit } from '@angular/core';
import { EstudianteService } from '../../services/estudiante.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import { errorMessage } from 'src/app/core/utils/message-util';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-buscador-estudiantes',
    templateUrl: './buscador-estudiantes.component.html',
    styleUrls: ['./buscador-estudiantes.component.scss'],
})
export class BuscadorEstudiantesComponent implements OnInit {
    estudiantes: any[] = [];
    estudianteSeleccionado: any;
    loading: boolean;

    constructor(
        private estudianteService: EstudianteService,
        private messageService: MessageService,
        private ref: DynamicDialogRef
    ) {}

    ngOnInit(): void {
        this.listEstudiantes();
    }

    listEstudiantes() {
        this.loading = true;
        this.estudianteService
            .listEstudiantes()
            .subscribe({
                next: (response) => {
                    this.estudiantes = response;
                },
                error: (error: any) => {
                    this.handlerResponseException(error);
                },
            })
            .add(() => (this.loading = false));

        this.estudianteSeleccionado = null;
    }

    filterEstudiantes(filter: string) {
        if (filter?.trim().length > 0) {
            this.estudianteService.listEstudiantes().subscribe({
                next: (response) => {
                    this.estudiantes = response.filter((e) =>
                        e.nombre.includes(filter.trim())
                    );
                },
                error: (error: any) => {
                    this.handlerResponseException(error);
                },
            });
        }
    }

    onCancel() {
        this.ref.close();
    }

    onSeleccionar() {
        if (this.estudianteSeleccionado) {
            this.ref.close(this.estudianteSeleccionado);
        }
    }

    handlerResponseException(response: any) {
        if (response.status != 501) return;
        const mapException = mapResponseException(response.error);
        mapException.forEach((value, _) => {
            this.messageService.add(errorMessage(value));
        });
    }
}
