import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { GestionMatriculaFinancieraFacadeService } from '../../data/facade.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { Estudiante, PeriodoAcademico } from '../../models/domain-models';

interface MatriculaFinancieraVM {
    estudiantes: Estudiante[];
    estudiantesFiltrados: Estudiante[];
    periodos: PeriodoAcademico[];
    periodosDropdown: { label: string; value: PeriodoAcademico }[];
    periodoSeleccionado: PeriodoAcademico | null;
    semestreSeleccionado: number | null;
    semestres: { label: string; value: number }[];
    loading: boolean;
    error: any;
}

@Component({
    selector: 'app-matricula-financiera',
    templateUrl: './matricula-financiera.component.html',
    styleUrls: ['./matricula-financiera.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatriculaFinancieraComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>();

    vm$: Observable<MatriculaFinancieraVM>;

    semestres: { label: string; value: number }[] = [];

    constructor(
        private facadeService: GestionMatriculaFinancieraFacadeService,
        private messageService: MessageService,
        private router: Router,
        private route: ActivatedRoute,
        private loadingService: LoadingService
    ) {
        this.vm$ = combineLatest({
            estudiantes: this.facadeService.estudiantes$,
            periodos: this.facadeService.periodos$,
            periodoSeleccionado: this.facadeService.periodoSeleccionadoFiltro$,
            semestreSeleccionado: this.facadeService.semestreSeleccionadoFiltro$,
            loading: this.facadeService.loading$,
            error: this.facadeService.error$
        }).pipe(
            map(({ estudiantes, periodos, periodoSeleccionado, semestreSeleccionado, loading, error }) => ({
                estudiantes,
                estudiantesFiltrados: this.filtrarEstudiantes(estudiantes, semestreSeleccionado),
                periodos,
                periodosDropdown: periodos.map(periodo => ({
                    label: this.obtenerEtiquetaPeriodo(periodo),
                    value: periodo
                })),
                periodoSeleccionado,
                semestreSeleccionado,
                semestres: this.obtenerOpcionesSemestre(estudiantes),
                loading,
                error
            }))
        );
    }

    ngOnInit(): void {
        this.cargarPeriodos();
    }

    cargarPeriodos(): void {
        this.loadingService.show('Cargando períodos académicos');
        this.facadeService.obtenerPeriodosAcademicos()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (periodos) => {
                    const periodoGuardado = this.facadeService.getPeriodoFiltro();
                    const semestreGuardado = this.facadeService.getSemestreFiltro();

                    if (periodoGuardado && periodos.some(p => p.año === periodoGuardado.año && p.periodo === periodoGuardado.periodo)) {
                        this.facadeService.setPeriodoFiltro(periodoGuardado);
                    } else if (periodos.length > 0) {
                        this.facadeService.setPeriodoFiltro(periodos[0]);
                    }

                    if (semestreGuardado !== null) {
                        this.facadeService.setSemestreFiltro(semestreGuardado);
                    }

                    const periodoSeleccionado = this.facadeService.getPeriodoFiltro();
                    if (periodoSeleccionado) {
                        this.cargarEstudiantes(periodoSeleccionado);
                    } else {
                        this.loadingService.hide();
                    }
                },
                error: (_err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudieron cargar los períodos académicos. Intente nuevamente más tarde.'
                    });
                    this.loadingService.hide();
                }
            });
    }

    cargarEstudiantes(periodo: PeriodoAcademico): void {
        this.loadingService.show('Cargando lista de estudiantes');
        this.facadeService.obtenerEstudiantes(periodo)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (estudiantes) => {
                    const estudiantesOrdenados = (estudiantes ?? []).sort((a, b) => (b.semestreFinanciero || 0) - (a.semestreFinanciero || 0));
                    this.extraerSemestres(estudiantesOrdenados);
                    this.loadingService.hide();
                },
                error: (_err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudieron cargar los estudiantes. Intente nuevamente más tarde.'
                    });
                    this.loadingService.hide();
                }
            });
    }

    extraerSemestres(estudiantes: Estudiante[]): void {
        this.semestres = this.obtenerOpcionesSemestre(estudiantes);

        const semestreGuardado = this.facadeService.getSemestreFiltro();
        if (semestreGuardado === null) {
            this.facadeService.setSemestreFiltro(0);
        }
    }

    onPeriodoChange(periodo: PeriodoAcademico | null): void {
        if (periodo) {
            this.facadeService.setPeriodoFiltro(periodo);
            this.cargarEstudiantes(periodo);
        }
    }

    onFiltroChange(semestre: number | null): void {
        if (semestre !== null) {
            this.facadeService.setSemestreFiltro(semestre);
        }
    }

    verDetalle(estudiante: Estudiante): void {
        this.router.navigate(['detalle', estudiante.codigo], { relativeTo: this.route });
    }

    getInputValue(event: Event): string {
        return (event.target as HTMLInputElement).value;
    }

    private filtrarEstudiantes(estudiantes: Estudiante[], semestreSeleccionado: number | null): Estudiante[] {
        return (estudiantes ?? []).filter(estudiante =>
            semestreSeleccionado === null ||
            semestreSeleccionado === 0 ||
            estudiante.semestreFinanciero === semestreSeleccionado
        );
    }

    private obtenerOpcionesSemestre(estudiantes: Estudiante[]): { label: string; value: number }[] {
        const semestresUnicos = [...new Set((estudiantes ?? []).map(e => e.semestreFinanciero))]
            .filter((semestre): semestre is number => semestre !== null && semestre !== undefined)
            .sort((a, b) => a - b);

        return [
            { label: 'Todos', value: 0 },
            ...semestresUnicos.map(s => ({ label: `${s}`, value: s }))
        ];
    }

    private obtenerEtiquetaPeriodo(periodo: PeriodoAcademico): string {
        const anio = (periodo as any)['a\u00f1o'] ?? (periodo.fechaInicio ? new Date(periodo.fechaInicio).getFullYear() : '');
        const tagPeriodo = periodo.tagPeriodo ?? periodo.periodo ?? '';
        return `${anio} - ${tagPeriodo}`;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

}
