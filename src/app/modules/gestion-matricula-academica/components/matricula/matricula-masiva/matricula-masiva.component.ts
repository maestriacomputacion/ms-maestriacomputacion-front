import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormBuilder } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PeriodoAcademicoService } from '../../../services/periodo-academico.service';
import { PeriodoAcademico } from '../../../models/periodo-academico.model';
import { CursoService } from '../../../services/curso.service';
import { CatalogoAcademicoService } from '../../../services/catalogo-academico.service';
import { MatriculaMasivaService } from '../../../services/matricula-masiva.service';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import { CursoUI } from '../../../models/curso.model';
import {
    CatalogoOption,
    TabChangeEvent,
    CursoAgrupado,
} from '../../../models/catalogo.model';
import {
    CursoSeleccionado,
    MatriculaBatchPayload,
} from '../../../models/matricula.model';

@Component({
    selector: 'app-matricula-masiva',
    templateUrl: './matricula-masiva.component.html',
    styleUrls: ['./matricula-masiva.component.scss'],
})
export class MatriculaMasivaComponent implements OnInit, OnDestroy {
    selectedEstudiantes: Estudiante[] = [];
    periodoActivo: PeriodoAcademico | null = null;
    areas: CatalogoOption[] = [];
    cursosPorArea: Record<string, CursoUI[]> = {};
    loadingCursosPorArea: Record<string, boolean> = {};
    cursosPorAreaAgrupados: Record<string, CursoAgrupado[]> = {};
    loading = false;
    cursosSeleccionados: CursoSeleccionado[] = [];

    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly router: Router,
        private readonly periodoService: PeriodoAcademicoService,
        private readonly messageService: MessageService,
        private readonly confirmationService: ConfirmationService,
        private readonly cursoService: CursoService,
        private readonly catalogoAcademicoService: CatalogoAcademicoService,
        private readonly matriculaMasivaService: MatriculaMasivaService,
        private readonly fb: FormBuilder,
        private readonly dialogService: DialogService
    ) {}

    ngOnInit(): void {
        this.obtenerEstudiantesSeleccionados();
        this.cargarPeriodoAcademicoActivo();
        this.cargarAreasFormacion();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onMatricularMasiva(event: Event): void {
        if (
            this.selectedEstudiantes.length === 0 ||
            this.cursosSeleccionados.length === 0
        ) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe seleccionar al menos un estudiante y un curso.',
            });
            return;
        }

        this.confirmationService.confirm({
            target: event.target as HTMLElement,
            message: `¿Matricular ${this.selectedEstudiantes.length} estudiante(s) en ${this.cursosSeleccionados.length} curso(s)?`,
            icon: 'pi pi-check',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => this.procesarMatriculaMasiva(),
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

    onAgregarCursoDesdeArea(event: Event, cursoItem: CursoUI): void {
        if (!cursoItem?.id) return;

        if (this.cursoYaSeleccionado(cursoItem.id)) {
            this.messageService.add({
                severity: 'info',
                summary: 'Información',
                detail: 'Este curso ya está en la lista',
            });
            return;
        }

        const nombreAsignatura = cursoItem.asignatura ?? '';
        const cursoMismaAsignatura = this.cursosSeleccionados.find(
            (c) =>
                c.nombreAsignatura?.includes(nombreAsignatura) &&
                nombreAsignatura !== ''
        );

        if (cursoMismaAsignatura) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: `Ya tiene seleccionado el grupo "${cursoMismaAsignatura.grupo}" de la asignatura "${nombreAsignatura}". Solo puede seleccionar un grupo por asignatura.`,
                life: 5000,
            });
            return;
        }

        this.confirmacionAgregarCurso(event, cursoItem);
    }

    onEliminarCursoSeleccionado(event: Event, id: number): void {
        this.confirmationService.confirm({
            target: event.target as HTMLElement,
            message: '¿Eliminar este curso de la lista?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.cursosSeleccionados = this.cursosSeleccionados.filter(
                    (c) => c.id !== id
                );
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Curso eliminado correctamente',
                });
            },
        });
    }

    confirmarQuitarEstudiante(event: Event, id: number | undefined): void {
        if (id === undefined || id === null) return;
        this.confirmationService.confirm({
            target: event.target as HTMLElement,
            message:
                '¿Está seguro que desea quitar este estudiante de la lista?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => this.onQuitarEstudiante(id),
        });
    }

    cargarCursosPorArea(idArea?: string | null): void {
        if (!idArea || this.cursosPorArea[idArea]?.length) {
            return;
        }

        if (!this.periodoActivo?.id) {
            console.warn('No hay período activo disponible para cargar cursos');
            return;
        }

        this.loadingCursosPorArea[idArea] = true;
        this.cursoService
            .getCursos({ idArea, idPeriodo: this.periodoActivo.id })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response?.typeResponse === 'SUCCESS') {
                        const items = response.data || [];
                        this.cursosPorArea[idArea] = items;
                        this.cursosPorAreaAgrupados[idArea] =
                            this.agruparCursosPorAsignatura(items);
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

    private obtenerEstudiantesSeleccionados(): void {
        const nav = this.router.getCurrentNavigation();
        if (nav?.extras?.state?.selectedEstudiantes) {
            this.selectedEstudiantes = nav.extras.state.selectedEstudiantes;
        } else if (
            (history as { state?: { selectedEstudiantes?: unknown } })?.state
                ?.selectedEstudiantes
        ) {
            const estudiantes = (
                history as { state?: { selectedEstudiantes?: unknown } }
            ).state?.selectedEstudiantes;
            this.selectedEstudiantes = Array.isArray(estudiantes)
                ? estudiantes
                : [];
        } else {
            this.selectedEstudiantes = [];
        }
    }

    private cargarPeriodoAcademicoActivo(): void {
        this.periodoService
            .getPeriodoActivo()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response?.typeResponse === 'SUCCESS' && response.data) {
                        this.periodoActivo = response.data;
                        if (this.areas.length > 0) {
                            this.cargarCursosPorArea(this.areas[0].value);
                        }
                    } else {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Aviso',
                            detail:
                                response?.message ||
                                'No se encontró período activo',
                        });
                    }
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo obtener el período activo',
                    });
                },
            });
    }

    private cargarAreasFormacion(): void {
        this.catalogoAcademicoService
            .getAreasFormacion()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response?.typeResponse === 'SUCCESS') {
                        this.areas = response.data || [];
                        if (this.areas.length > 0 && this.periodoActivo?.id) {
                            this.cargarCursosPorArea(this.areas[0].value);
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

    private procesarMatriculaMasiva(): void {
        const payload: MatriculaBatchPayload = {
            matriculaEstudianteCursos: this.selectedEstudiantes.map(
                (estudiante) => ({
                    estudianteId: estudiante.id,
                    cursos: this.cursosSeleccionados.map((curso) => ({
                        cursoId: curso.id,
                    })),
                })
            ),
        };

        this.matriculaMasivaService
            .matricularMasivo(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response?.typeResponse === 'SUCCESS') {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail:
                                response?.message ||
                                'Matrícula masiva realizada correctamente.',
                        });
                        this.cursosSeleccionados = [];

                        const datosNavegacion = {
                            matriculasProcesadas:
                                response?.data?.matriculasProcesadas || [],
                            matriculasNoProcesadas:
                                response?.data?.matriculasNoProcesadas || [],
                            matriculasEliminadas:
                                response?.data?.matriculasEliminadas || [],
                            origen: 'matricula-masiva',
                        };

                        setTimeout(() => {
                            this.router.navigate(
                                [
                                    '/gestion-matricula-academica',
                                    'resultado-matricula-masiva',
                                ],
                                { state: datosNavegacion }
                            );
                        }, 1000);
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail:
                                response?.message ||
                                'Error al realizar la matrícula masiva.',
                        });
                    }
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo realizar la matrícula masiva.',
                    });
                },
            });
    }

    private confirmacionAgregarCurso(event: Event, cursoItem: CursoUI): void {
        this.confirmationService.confirm({
            target: event.target as HTMLElement,
            message: `¿Agregar grupo "${cursoItem.grupo}" de "${cursoItem.asignatura}" a todos los estudiantes?`,
            icon: 'pi pi-question-circle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                const nuevoCurso = {
                    id: cursoItem.id,
                    grupo: cursoItem.grupo ?? '',
                    nombreAsignatura: cursoItem.asignatura ?? '',
                    docentes: cursoItem.docente ?? '',
                    salon: cursoItem.salon ?? '',
                };
                this.cursosSeleccionados.push(nuevoCurso);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Curso agregado para matrícula masiva',
                });
            },
        });
    }

    private agruparCursosPorAsignatura(items: CursoUI[]): CursoAgrupado[] {
        const map: Record<string, CursoAgrupado> = {};
        for (const item of items) {
            const key = item.asignatura ?? 'Sin nombre';
            if (!map[key]) {
                map[key] = { asignatura: key, cursos: [] };
            }
            map[key].cursos.push(item);
        }
        return Object.values(map);
    }

    private cursoYaSeleccionado(cursoId: number): boolean {
        return this.cursosSeleccionados.some((c) => c.id === cursoId);
    }

    private onQuitarEstudiante(id: number): void {
        this.selectedEstudiantes = this.selectedEstudiantes.filter(
            (e) => e.id !== id
        );
    }
}
