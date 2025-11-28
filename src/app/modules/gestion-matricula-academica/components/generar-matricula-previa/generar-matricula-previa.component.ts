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
import { CursoService } from '../../services/curso.service';

@Component({
    selector: 'app-generar-matricula-previa',
    templateUrl: './generar-matricula-previa.component.html',
    styleUrls: ['./generar-matricula-previa.component.scss'],
})
export class GenerarMatriculaPreviaComponent implements OnInit {
    estudiante: Estudiante | null = null;
    asignaturas: AsignaturaMatricular[] = [];
    areas: { label: string; value: string }[] = [];
    cursosPorArea: Record<string, any[]> = {};
    loadingCursosPorArea: Record<string, boolean> = {};
    cursosPorAreaAgrupados: Record<
        string,
        { asignatura: string; cursos: any[] }[]
    > = {};
    displayObservacionModal = false;
    observacionForm: FormGroup;
    asignaturaSeleccionadaId: number | null = null;
    estudianteId: number | null = null;
    loading: boolean = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly matriculaPreviaService: MatriculaPreviaService,
        private readonly estudianteService: EstudianteService,
        private readonly cursoService: CursoService,
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
        this.cargarAreasFormacion();
    }

    private cargarAreasFormacion(): void {
        this.cursoService.getAreasFormacion().subscribe({
            next: (resp) => {
                if (resp?.typeResponse === 'SUCCESS') {
                    this.areas = resp.data || [];
                    // Cargar la primera área automáticamente para asegurar que la petición se realiza
                    if (this.areas.length > 0) {
                        const first = this.areas[0].value;
                        this.cargarCursosPorArea(first);
                    }
                } else {
                    this.areas = [];
                }
            },
            error: (err) => {
                console.error('Error cargando áreas de formación', err);
                this.areas = [];
            },
        });
    }

    cargarCursosPorArea(idArea?: string | null): void {
        if (!idArea) return;
        // Si ya está cargado, no volver a pedir
        if (this.cursosPorArea[idArea]?.length) {
            return;
        }

        this.loadingCursosPorArea[idArea] = true;
        this.cursoService.getCursos({ idArea }).subscribe({
            next: (resp) => {
                if (resp?.typeResponse === 'SUCCESS') {
                    // `resp.data` viene ya transformado a CursoUI por el servicio
                    const items = resp.data || [];
                    this.cursosPorArea[idArea] = items;

                    // Agrupar por nombre de asignatura para renderizar una tabla por asignatura
                    const map: Record<
                        string,
                        { asignatura: string; cursos: any[] }
                    > = {};
                    for (const it of items) {
                        const key = it.asignatura ?? 'Sin nombre';
                        if (!map[key]) {
                            map[key] = { asignatura: key, cursos: [] };
                        }
                        map[key].cursos.push(it);
                    }
                    this.cursosPorAreaAgrupados[idArea] = Object.values(map);
                } else {
                    this.cursosPorArea[idArea] = [];
                    this.cursosPorAreaAgrupados[idArea] = [];
                }
                this.loadingCursosPorArea[idArea] = false;
            },
            error: (err) => {
                console.error('Error cargando cursos por área', err);
                this.cursosPorArea[idArea] = [];
                this.loadingCursosPorArea[idArea] = false;
            },
        });
    }

    onTabChange(event: any): void {
        try {
            const idx = event?.index ?? 0;
            const area = this.areas?.[idx];
            if (area?.value) {
                this.cargarCursosPorArea(area.value);
            }
        } catch (e) {
            console.error('onTabChange error', e);
        }
    }

    onAgregarCursoDesdeArea(
        cursoItem: any,
        area: { label: string; value: string } | null
    ): void {
        if (!cursoItem || !cursoItem.id) return;

        const existe = this.asignaturas.find((a) => a.id === cursoItem.id);
        if (existe) {
            this.messageService.add({
                severity: 'info',
                summary: 'Información',
                detail: 'Este curso ya está en la lista de matricular',
            });
            return;
        }

        const areaLabel = area?.label ? ` {${area.label}}` : '';
        const nueva = {
            id: cursoItem.id,
            grupo: cursoItem.grupo ?? '',
            nombreAsignatura: (cursoItem.asignatura ?? '') + areaLabel,
            docentes: cursoItem.docente ?? '',
            opciones: 'Matricular',
            observacion: '',
        } as any;

        this.asignaturas.push(nueva);
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Curso agregado a la lista de matricular',
        });
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
