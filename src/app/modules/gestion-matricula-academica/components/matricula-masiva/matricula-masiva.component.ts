import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PeriodoAcademicoService } from '../../services/periodo-academico.service';
import { PeriodoAcademico } from '../../models/periodo-academico.model';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CursoService } from '../../services/curso.service';
import {
    MatriculaMasivaService,
    MatriculaBatchPayload,
} from '../../services/matricula-masiva.service';
import { FormBuilder } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-matricula-masiva',
    templateUrl: './matricula-masiva.component.html',
    styleUrls: ['./matricula-masiva.component.scss'],
})
export class MatriculaMasivaComponent implements OnInit {
    selectedEstudiantes: any[] = [];
    periodoActivo: PeriodoAcademico | null = null;
    areas: { label: string; value: string }[] = [];
    cursosPorArea: Record<string, any[]> = {};
    loadingCursosPorArea: Record<string, boolean> = {};
    cursosPorAreaAgrupados: Record<
        string,
        { asignatura: string; cursos: any[] }[]
    > = {};
    loading: boolean = false;
    cursosSeleccionados: any[] = [];
    resultadoDialogRef: any;

    constructor(
        private readonly router: Router,
        private readonly periodoService: PeriodoAcademicoService,
        private readonly messageService: MessageService,
        private readonly confirmationService: ConfirmationService,
        private readonly cursoService: CursoService,
        private readonly matriculaMasivaService: MatriculaMasivaService,
        private readonly fb: FormBuilder,
        private readonly dialogService: DialogService
    ) {}

    ngOnInit(): void {
        this.obtenerEstudiantesSeleccionados();
        this.cargarPeriodoAcademicoActivo();
        this.cargarAreasFormacion();
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
            target: event.target,
            message: `¿Matricular ${this.selectedEstudiantes.length} estudiante(s) en ${this.cursosSeleccionados.length} curso(s)?`,
            icon: 'pi pi-check',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                const payload: MatriculaBatchPayload = {
                    matriculaEstudianteCursos: this.selectedEstudiantes.map(
                        (est) => ({
                            estudianteId: est.id,
                            cursos: this.cursosSeleccionados.map((curso) => ({
                                cursoId: curso.id,
                            })),
                        })
                    ),
                };
                this.matriculaMasivaService.matricularBatch(payload).subscribe({
                    next: (resp) => {
                        if (resp?.typeResponse === 'SUCCESS') {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail:
                                    resp?.message ||
                                    'Matrícula masiva realizada correctamente.',
                            });
                            this.cursosSeleccionados = [];
                            const datosNavegacion = {
                                matriculasRealizadas:
                                    resp?.data?.matriculasRealizadas || [],
                                matriculasNoRealizadas:
                                    resp?.data?.matriculasNoRealizadas || [],
                            };
                            // Espera 1 segundo antes de navegar para mostrar el mensaje
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
                                    resp?.message ||
                                    'Error al realizar la matrícula masiva.',
                            });
                        }
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo realizar la matrícula masiva.',
                        });
                    },
                });
            },
        });
    }

    private obtenerEstudiantesSeleccionados(): void {
        const nav = this.router.getCurrentNavigation();
        if (nav?.extras?.state?.selectedEstudiantes) {
            this.selectedEstudiantes = nav.extras.state.selectedEstudiantes;
        } else if ((history as { state?: { selectedEstudiantes?: unknown } })?.state?.selectedEstudiantes) {
            const estudiantes = (history as { state?: { selectedEstudiantes?: unknown } }).state?.selectedEstudiantes;
            this.selectedEstudiantes = Array.isArray(estudiantes) ? estudiantes : [];
        } else {
            this.selectedEstudiantes = [];
        }
    }

    private cargarPeriodoAcademicoActivo(): void {
        this.periodoService.getPeriodoActivo().subscribe({
            next: (resp) => {
                if (resp?.typeResponse === 'SUCCESS' && resp.data) {
                    this.periodoActivo = resp.data;
                } else {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Aviso',
                        detail:
                            resp?.message || 'No se encontró periodo activo',
                    });
                }
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo obtener el periodo activo',
                });
            },
        });
    }

    private cargarAreasFormacion(): void {
        this.cursoService.getAreasFormacion().subscribe({
            next: (resp) => {
                if (resp?.typeResponse === 'SUCCESS') {
                    this.areas = resp.data || [];
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
        if (this.cursosPorArea[idArea]?.length) {
            return;
        }

        this.loadingCursosPorArea[idArea] = true;
        this.cursoService.getCursos({ idArea }).subscribe({
            next: (resp) => {
                if (resp?.typeResponse === 'SUCCESS') {
                    const items = resp.data || [];
                    this.cursosPorArea[idArea] = items;

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
        event: Event,
        cursoItem: any,
        area: { label: string; value: string } | null
    ): void {
        if (!cursoItem?.id) return;

        const existe = this.cursosSeleccionados.find(
            (c) => c.id === cursoItem.id
        );
        if (existe) {
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

        this.confirmationService.confirm({
            target: event.target,
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

    onEliminarCursoSeleccionado(event: Event, id: number): void {
        this.confirmationService.confirm({
            target: event.target,
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

    regresar(): void {
        this.router.navigate([
            '/gestion-matricula-academica',
            'gestion-estudiantes',
        ]);
    }

    onQuitarEstudiante(id: string): void {
        this.selectedEstudiantes = this.selectedEstudiantes.filter(
            (e) => e.id !== id
        );
    }

    confirmarQuitarEstudiante(event: Event, id: string): void {
        this.confirmationService.confirm({
            target: event.target as HTMLElement,
            message:
                '¿Está seguro que desea quitar este estudiante de la lista?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.onQuitarEstudiante(id);
            },
        });
    }
}
