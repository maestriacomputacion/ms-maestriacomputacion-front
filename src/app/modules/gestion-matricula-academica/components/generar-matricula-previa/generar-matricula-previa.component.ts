import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    MatriculaPreviaService,
    Estudiante,
    AsignaturaMatricular,
} from '../../services/matricula-previa.service';
import { ApiResponse } from '../../models/api-response.model';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EstudianteService } from 'src/app/modules/gestion-estudiantes/services/estudiante.service';
import { Estudiante as EstudianteModel } from 'src/app/modules/gestion-estudiantes/models/estudiante';

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
    estudianteId: number | null = null;
    loading: boolean = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly matriculaPreviaService: MatriculaPreviaService,
        private readonly estudianteService: EstudianteService,
        private readonly messageService: MessageService,
        private readonly confirmationService: ConfirmationService,
        private readonly route: ActivatedRoute,
        private readonly router: Router
    ) {
        this.observacionForm = this.fb.group({
            observacion: ['', Validators.required],
        });
    }

    ngOnInit() {
        // Obtener el ID del estudiante desde la ruta si existe
        this.route.params.subscribe((params) => {
            if (params['id']) {
                this.estudianteId = +params['id'];
                this.cargarDatosEstudiantePorId(this.estudianteId);
            } else {
                this.cargarDatosEstudiante();
            }
        });
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

    cargarDatosEstudiantePorId(id: number) {
        this.loading = true;
        // Obtener datos del estudiante y su estado para tener información completa
        this.estudianteService.getEstudiante(id).subscribe({
            next: (estudianteData: EstudianteModel) => {
                // Intentar obtener el estado del estudiante para tener nombres de director y co-director
                this.estudianteService.getEstadoEstudiante(id).subscribe({
                    next: (estadoEstudiante) => {
                        // Transformar el modelo de Estudiante a Estudiante del servicio de matrícula previa
                        this.estudiante = {
                            codigo: estudianteData.codigo || '',
                            nombre: estudianteData.persona?.nombre || '',
                            apellidos: estudianteData.persona?.apellido || '',
                            director:
                                estadoEstudiante.director ||
                                (estudianteData.idDirector
                                    ? 'Director asignado'
                                    : 'Sin director'),
                            coDirector:
                                estadoEstudiante.codirector ||
                                (estudianteData.idCodirector
                                    ? 'Co-Director asignado'
                                    : 'Sin co-director'),
                            semestreAcademico: String(
                                estadoEstudiante.semestreAcademico ||
                                    estudianteData.informacionMaestria
                                        ?.semestreAcademico ||
                                    0
                            ),
                        };
                        this.loading = false;
                    },
                    error: () => {
                        // Si falla obtener el estado, usar solo los datos básicos
                        this.estudiante = {
                            codigo: estudianteData.codigo || '',
                            nombre: estudianteData.persona?.nombre || '',
                            apellidos: estudianteData.persona?.apellido || '',
                            director: estudianteData.idDirector
                                ? 'Director asignado'
                                : 'Sin director',
                            coDirector: estudianteData.idCodirector
                                ? 'Co-Director asignado'
                                : 'Sin co-director',
                            semestreAcademico: String(
                                estudianteData.informacionMaestria
                                    ?.semestreAcademico || 0
                            ),
                        };
                        this.loading = false;
                    },
                });
            },
            error: (err) => {
                console.error('Error cargando estudiante', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail:
                        err?.error?.message ||
                        err?.message ||
                        'Error al cargar los datos del estudiante',
                });
                this.loading = false;
            },
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
