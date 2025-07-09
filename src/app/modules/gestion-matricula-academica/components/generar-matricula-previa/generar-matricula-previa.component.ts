import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    MatriculaPreviaService,
    Estudiante,
    AsignaturaMatricular,
} from '../../services/matricula-previa.service';
import { ApiResponse } from '../../models/api-response.model';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-generar-matricula-previa',
    templateUrl: './generar-matricula-previa.component.html',
    styleUrls: ['./generar-matricula-previa.component.scss'],
})
export class GenerarMatriculaPreviaComponent implements OnInit {
    estudiante: Estudiante | null = null;
    asignaturas: AsignaturaMatricular[] = [];
    displayObservacionModal = false;
    observacionForm: FormGroup;
    asignaturaSeleccionadaId: number | null = null;

    constructor(
        private readonly fb: FormBuilder,
        private readonly matriculaPreviaService: MatriculaPreviaService,
        private readonly messageService: MessageService,
        private readonly confirmationService: ConfirmationService
    ) {
        this.observacionForm = this.fb.group({
            observacion: ['', Validators.required],
        });
    }

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

    onAgregarObservacion(id: number) {
        this.asignaturaSeleccionadaId = id;
        const asignatura = this.asignaturas.find((a) => a.id === id);

        this.observacionForm.patchValue({
            observacion: asignatura?.observacion || '',
        });

        this.displayObservacionModal = true;
    }

    onGuardarObservacion() {
        if (this.observacionForm.valid && this.asignaturaSeleccionadaId) {
            const asignaturaIndex = this.asignaturas.findIndex(
                (a) => a.id === this.asignaturaSeleccionadaId
            );

            if (asignaturaIndex !== -1) {
                this.asignaturas[asignaturaIndex].observacion =
                    this.observacionForm.value.observacion;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Observación guardada correctamente',
                });

                this.displayObservacionModal = false;
                this.observacionForm.reset();
                this.asignaturaSeleccionadaId = null;
            }
        }
    }

    onCancelarObservacion() {
        this.displayObservacionModal = false;
        this.observacionForm.reset();
        this.asignaturaSeleccionadaId = null;
    }

    onEliminarAsignatura(id: number) {
        this.confirmationService.confirm({
            message: '¿Está seguro de que desea eliminar esta asignatura?',
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                const asignaturaIndex = this.asignaturas.findIndex(
                    (a) => a.id === id
                );

                if (asignaturaIndex !== -1) {
                    this.asignaturas.splice(asignaturaIndex, 1);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Asignatura eliminada correctamente',
                    });
                }
            },
        });
    }
}
