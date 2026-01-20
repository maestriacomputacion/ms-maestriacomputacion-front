import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatriculaPreviaService } from '../../../services/matricula-previa.service';
import {
    Estudiante,
    AsignaturaMatricular,
} from '../../../models/matricula-previa.model';
import { ApiResponse } from '../../../models/api-response.model';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EstudianteAcademicoService } from '../../../services/estudiante-academico.service';
import { CursoService } from '../../../services/curso.service';
import { CatalogoAcademicoService } from '../../../services/catalogo-academico.service';
import { MatriculaCursoService } from '../../../services/matricula-curso.service';
import { CursoUI } from '../../../models/curso.model';
import {
    CatalogoOption,
    TabChangeEvent,
    CursoAgrupado,
} from '../../../models/catalogo.model';
import { Estudiante as EstudianteModel } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import {
    MatriculaRealizada,
    DocenteBasico,
} from '../../../models/matricula.model';

@Component({
    selector: 'app-generar-matricula-previa',
    templateUrl: './generar-matricula-previa.component.html',
    styleUrls: ['./generar-matricula-previa.component.scss'],
})
export class GenerarMatriculaPreviaComponent implements OnInit {
    estudiante: Estudiante | null = null;
    asignaturas: AsignaturaMatricular[] = [];
    asignaturasIniciales: AsignaturaMatricular[] = [];
    areas: CatalogoOption[] = [];
    cursosPorArea: Record<string, CursoUI[]> = {};
    loadingCursosPorArea: Record<string, boolean> = {};
    cursosPorAreaAgrupados: Record<string, CursoAgrupado[]> = {};
    displayObservacionModal = false;
    observacionForm: FormGroup;
    asignaturaSeleccionadaId: number | null = null;
    estudianteId: number | null = null;
    loading: boolean = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly matriculaPreviaService: MatriculaPreviaService,
        private readonly estudianteAcademicoService: EstudianteAcademicoService,
        private readonly cursoService: CursoService,
        private readonly catalogoAcademicoService: CatalogoAcademicoService,
        private readonly matriculaCursoService: MatriculaCursoService,
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
                this.cargarAsignaturas();
            } else {
                this.cargarDatosEstudiante();
            }
        });
        this.cargarAreasFormacion();
    }

    get huboCambios(): boolean {
        // Si no hay asignaturas iniciales, significa que es una matrícula nueva
        if (this.asignaturasIniciales.length === 0) {
            return this.asignaturas.length > 0;
        }

        // Verificar si la cantidad cambió
        if (this.asignaturas.length !== this.asignaturasIniciales.length) {
            return true;
        }

        // Verificar si hay IDs diferentes
        const idsActuales = this.asignaturas
            .map((a) => a.id)
            .sort((a, b) => a - b);
        const idsIniciales = this.asignaturasIniciales
            .map((a) => a.id)
            .sort((a, b) => a - b);

        return !idsActuales.every((id, index) => id === idsIniciales[index]);
    }

    get textoBotonMatricular(): string {
        // Verificar si hay matrículas nuevas (IDs que no estaban en las iniciales)
        const idsIniciales = new Set(
            this.asignaturasIniciales.map((a) => a.id)
        );
        const hayMatriculasNuevas = this.asignaturas.some(
            (a) => !idsIniciales.has(a.id)
        );

        // Si hay matrículas nuevas, mostrar "Matricular"
        if (hayMatriculasNuevas) {
            return 'Matricular';
        }
        // Solo eliminó o modificó observaciones, mostrar "Guardar"
        return 'Guardar';
    }

    get iconoBotonMatricular(): string {
        // Verificar si hay matrículas nuevas
        const idsIniciales = new Set(
            this.asignaturasIniciales.map((a) => a.id)
        );
        const hayMatriculasNuevas = this.asignaturas.some(
            (a) => !idsIniciales.has(a.id)
        );

        return hayMatriculasNuevas ? 'pi pi-check' : 'pi pi-save';
    }

    private cargarAreasFormacion(): void {
        this.catalogoAcademicoService.getAreasFormacion().subscribe({
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

        if (!this.estudianteId) {
            console.warn('No se puede cargar cursos sin estudianteId');
            return;
        }

        this.loadingCursosPorArea[idArea] = true;
        this.cursoService
            .getCursosDisponiblesPorEstudiante(this.estudianteId, { idArea })
            .subscribe({
                next: (resp) => {
                    if (resp?.typeResponse === 'SUCCESS') {
                        // `resp.data` viene ya transformado a CursoUI por el servicio
                        const items = resp.data || [];
                        this.cursosPorArea[idArea] = items;

                        // Agrupar por nombre de asignatura para renderizar una tabla por asignatura
                        const map: Record<string, CursoAgrupado> = {};
                        for (const it of items) {
                            const key = it.asignatura ?? 'Sin nombre';
                            if (!map[key]) {
                                map[key] = { asignatura: key, cursos: [] };
                            }
                            map[key].cursos.push(it);
                        }
                        this.cursosPorAreaAgrupados[idArea] =
                            Object.values(map);
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

    onTabChange(event: TabChangeEvent): void {
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
        event: Event,
        cursoItem: CursoUI,
        _area: { label: string; value: string } | null
    ): void {
        if (!cursoItem?.id) return;

        const existe = this.asignaturas.find((a) => a.id === cursoItem.id);
        if (existe) {
            this.messageService.add({
                severity: 'info',
                summary: 'Información',
                detail: 'Este curso ya está en la lista de matricular',
            });
            return;
        }

        const nombreAsignatura = cursoItem.asignatura ?? '';

        // Verificar si ya existe un curso de la misma asignatura
        const cursoMismaAsignatura = this.asignaturas.find(
            (a) =>
                a.nombreAsignatura?.includes(nombreAsignatura) &&
                nombreAsignatura !== ''
        );

        if (cursoMismaAsignatura) {
            // Ya existe un curso de esta asignatura, mostrar advertencia
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: `Ya tiene seleccionado el grupo "${cursoMismaAsignatura.grupo}" de la asignatura "${nombreAsignatura}". Solo puede seleccionar un grupo por asignatura.`,
                life: 5000,
            });
            return;
        }

        // No existe curso de esta asignatura: validar en backend antes de confirmar agregar
        if (!this.estudianteId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No se encontró el estudiante para validar la matrícula',
            });
            return;
        }

        this.loading = true;
        this.matriculaCursoService
            .validarMatriculaEnCurso(this.estudianteId, cursoItem.id)
            .subscribe({
                next: (resp) => {
                    this.loading = false;
                    if (
                        resp?.typeResponse === 'SUCCESS' &&
                        resp.data === true
                    ) {
                        // Mostrar confirmación antes de agregar
                        this.confirmationService.confirm({
                            target: event.target,
                            message: `¿Agregar grupo "${cursoItem.grupo}" de "${nombreAsignatura}"?`,
                            icon: 'pi pi-question-circle',
                            acceptLabel: 'Sí',
                            rejectLabel: 'No',
                            accept: () => {
                                const nueva: AsignaturaMatricular = {
                                    id: cursoItem.id,
                                    grupo: cursoItem.grupo ?? '',
                                    nombreAsignatura: nombreAsignatura,
                                    docentes: cursoItem.docente ?? '',
                                    opciones: 'Matricular',
                                    observacion: '',
                                };

                                this.asignaturas.push(nueva);
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Éxito',
                                    detail: 'Curso agregado a la lista de matricular',
                                });
                            },
                        });
                    } else {
                        // Mostrar el mensaje devuelto por el backend cuando no es válido
                        const motivo =
                            resp?.message ||
                            'No es posible matricular en este curso';
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Validación',
                            detail: motivo,
                        });
                    }
                },
                error: (err) => {
                    this.loading = false;
                    console.error('Error validando curso', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail:
                            err?.error?.message ||
                            err?.message ||
                            'Error al validar el curso',
                    });
                },
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
        this.estudianteAcademicoService.getEstudiantePorId(id).subscribe({
            next: (resp) => {
                if (resp?.typeResponse === 'SUCCESS' && resp.data) {
                    this.estudiante = this.mapEstudianteApi(resp.data);
                }
                this.loading = false;
            },
            error: (err) => {
                this.loading = false;
                this.manejarErrorCargaEstudiante(err);
            },
        });
    }

    private manejarErrorCargaEstudiante(err: {
        error?: { message?: string };
        message?: string;
    }): void {
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
    }

    private mapEstudianteApi(data: EstudianteModel): Estudiante {
        return {
            codigo: data.codigo ?? '',
            nombre: data.persona?.nombre ?? '',
            apellidos: data.persona?.apellido ?? '',
            director: data.idDirector ? 'Director asignado' : 'Sin director',
            coDirector: data.idCodirector
                ? 'Co-Director asignado'
                : 'Sin co-director',
            semestreAcademico: String(
                data.informacionMaestria?.semestreAcademico ?? 0
            ),
        };
    }

    cargarAsignaturas() {
        if (!this.estudianteId) {
            // Si no hay estudianteId, iniciar con lista vacía
            this.asignaturas = [];
            return;
        }

        // Cargar las matrículas existentes del estudiante
        this.loading = true;
        this.matriculaPreviaService
            .getMatriculasEstudiante(this.estudianteId)
            .subscribe({
                next: (resp: ApiResponse<MatriculaRealizada[]>) => {
                    if (resp.typeResponse === 'SUCCESS' && resp.data) {
                        // Transformar los datos al formato AsignaturaMatricular
                        this.asignaturas = resp.data.map(
                            (matricula): AsignaturaMatricular => ({
                                id: matricula.curso?.id || 0,
                                grupo: matricula.curso?.grupo || '',
                                nombreAsignatura:
                                    matricula.curso?.asignatura?.nombre || '',
                                docentes: this.formatearDocentes(
                                    matricula.curso?.docentes || []
                                ),
                                opciones: 'Matriculado',
                                observacion: matricula.observacion || '',
                                estadoMatricula: matricula.estado,
                            })
                        );
                        // Guardar copia de las asignaturas iniciales
                        this.asignaturasIniciales = this.asignaturas.map(
                            (asignatura) => ({ ...asignatura })
                        );
                    } else {
                        this.asignaturas = [];
                        this.asignaturasIniciales = [];
                    }
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error cargando matrículas', err);
                    this.asignaturas = [];
                    this.loading = false;
                },
            });
    }

    private formatearDocentes(docentes: DocenteBasico[]): string {
        if (!docentes || docentes.length === 0) return '-';
        return docentes
            .map((doc) => {
                const nombre = doc.persona?.nombre || '';
                const apellido = doc.persona?.apellido || '';
                return `${nombre} ${apellido}`.trim();
            })
            .filter(Boolean)
            .join(', ');
    }

    onAgregarObservacion(id: number) {
        const asignatura = this.asignaturas.find((a) => a.id === id);
        if (this.esEstadoBloqueado(asignatura?.estadoMatricula)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Acción no permitida',
                detail: 'No se puede editar la observación cuando la matrícula está APROBADA o RECHAZADA',
            });
            return;
        }
        this.asignaturaSeleccionadaId = id;

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

    onEliminarAsignatura(event: Event, id: number) {
        const asignatura = this.asignaturas.find((a) => a.id === id);
        if (this.esEstadoBloqueado(asignatura?.estadoMatricula)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Acción no permitida',
                detail: 'No se puede eliminar una matrícula APROBADA o RECHAZADA',
            });
            return;
        }
        this.confirmationService.confirm({
            target: event.target,
            message: '¿Eliminar esta asignatura?',
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

    onGuardarMatricula(event: Event) {
        if (!this.estudianteId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No se encontró el estudiante.',
            });
            return;
        }

        if (!this.huboCambios) {
            this.messageService.add({
                severity: 'info',
                summary: 'Información',
                detail: 'No hay cambios para guardar.',
            });
            return;
        }

        const mensajeConfirmacion =
            this.asignaturas.length === 0
                ? '¿Está seguro de eliminar todas las matrículas de este estudiante?'
                : `¿Guardar matrícula con ${this.asignaturas.length} asignatura(s)?`;

        this.confirmationService.confirm({
            target: event.target,
            message: mensajeConfirmacion,
            icon: 'pi pi-save',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                const payload = {
                    estudianteId: this.estudianteId,
                    cursos: this.asignaturas.map((asignatura) => ({
                        cursoId: asignatura.id,
                        observacion: asignatura.observacion,
                    })),
                };

                this.matriculaPreviaService
                    .matricularEstudiante(payload)
                    .subscribe({
                        next: (resp) => {
                            if (resp.typeResponse === 'SUCCESS') {
                                const procesadas =
                                    resp.data?.matriculasProcesadas || [];
                                const noProcesadas =
                                    resp.data?.matriculasNoProcesadas || [];
                                const eliminadas =
                                    resp.data?.matriculasEliminadas || [];

                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Éxito',
                                    detail:
                                        resp.message ||
                                        'Matrícula procesada correctamente.',
                                    life: 3000,
                                });

                                const datosNavegacion = {
                                    matriculasProcesadas: procesadas,
                                    matriculasNoProcesadas: noProcesadas,
                                    matriculasEliminadas: eliminadas,
                                    origen: 'matricula-previa',
                                };

                                // Navegar a la vista de resultados
                                setTimeout(() => {
                                    this.router.navigate(
                                        [
                                            '/gestion-matricula-academica',
                                            'resultado-matricula-masiva',
                                        ],
                                        {
                                            state: datosNavegacion,
                                        }
                                    );
                                }, 1000);
                            } else {
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Error',
                                    detail:
                                        resp.message ||
                                        'Error al guardar la matrícula.',
                                });
                            }
                        },
                        error: (err) => {
                            console.error('Error al guardar matrícula', err);
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail:
                                    err?.error?.message ||
                                    err?.message ||
                                    'Error al guardar la matrícula.',
                            });
                        },
                    });
            },
        });
    }

    esEstadoBloqueado(estado?: string): boolean {
        const estadoNormalizado = estado?.toUpperCase();
        return (
            estadoNormalizado === 'APROBADO' ||
            estadoNormalizado === 'RECHAZADO'
        );
    }
}
