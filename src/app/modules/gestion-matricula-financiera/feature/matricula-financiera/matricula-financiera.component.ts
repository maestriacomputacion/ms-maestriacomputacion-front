import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, takeUntil } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';

import { GestionMatriculaFinancieraFacadeService } from '../../data/facade.service';
import { Estudiante, PeriodoAcademico } from '../../models/domain-models';
import { getEstadoMatriculaLabel, getEstadoMatriculaSeverity } from '../../utils/estado-matricula.utils';
import { LoadingService } from 'src/app/shared/services/loading.service';

@Component({
    selector: 'app-matricula-financiera',
    templateUrl: './matricula-financiera.component.html',
    styleUrls: ['./matricula-financiera.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatriculaFinancieraComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();

    readonly busqueda$ = new Subject<string>();
    readonly estadoFiltro$ = new BehaviorSubject<string>('TODOS');
    readonly semestreFiltro$ = this.facadeService.semestreSeleccionadoFiltro$;
    readonly vm$ = this.facadeService.vm$.pipe(
        map(vm => ({
            ...vm,
            semestres: this.obtenerOpcionesSemestre(vm.estudiantes)
        }))
    );

    readonly estudiantesFiltrados$ = combineLatest({
        estudiantes: this.facadeService.estudiantes$,
        termino: this.busqueda$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            startWith('')
        ),
        estado: this.estadoFiltro$,
        semestre: this.semestreFiltro$
    }).pipe(
        map(({ estudiantes, termino, estado, semestre }) => {
            let resultado = estudiantes;
            if (termino.trim()) {
                const t = termino.toLowerCase();
                resultado = resultado.filter((e: Estudiante) =>
                    e.nombre.toLowerCase().includes(t) ||
                    e.apellido.toLowerCase().includes(t) ||
                    e.codigo.toLowerCase().includes(t)
                );
            }
            if (estado && estado !== 'TODOS') {
                resultado = resultado.filter((e: Estudiante) =>
                    estado === 'true'  ? e.estaPago === true :
                    estado === 'false' ? e.estaPago === false :
                    estado === 'null'  ? e.estaPago == null :
                    true
                );
            }
            if (semestre !== null && semestre !== 0) {
                resultado = resultado.filter((e: Estudiante) => e.semestreFinanciero === semestre);
            }
            return resultado;
        })
    );

    readonly estadosMatricula = [
        { label: 'Todos los estados', value: 'TODOS' },
        { label: 'PAGADO',            value: 'true'  },
        { label: 'NO PAGADO',         value: 'false' },
        { label: 'PENDIENTE',         value: 'null'  },
    ];

    constructor(
        private readonly facadeService: GestionMatriculaFinancieraFacadeService,
        private readonly messageService: MessageService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly cdr: ChangeDetectorRef,
        private readonly loadingService: LoadingService
    ) {}

    ngOnInit(): void {
        this.cargarPeriodosYEstudiantes();
    }

    private cargarPeriodosYEstudiantes(): void {
        this.loadingService.show('Cargando períodos académicos');
        this.facadeService.obtenerPeriodosAcademicos()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (periodos: PeriodoAcademico[]) => {
                    const periodoGuardado = this.facadeService.getPeriodoFiltro();
                    const periodo = periodoGuardado
                        ? periodos.find(p => p.año === periodoGuardado.año && p.periodo === periodoGuardado.periodo) ?? periodos[0]
                        : periodos[0];

                    if (periodo) {
                        this.facadeService.setPeriodoFiltro(periodo);
                        this.loadingService.show(`Cargando estudiantes del período ${this.getPeriodoDropdownLabel(periodo)}`);
                        this.facadeService.obtenerEstudiantes(periodo)
                            .pipe(takeUntil(this.destroy$))
                            .subscribe({
                                next: () => {
                                    this.loadingService.hide();
                                    this.cdr.markForCheck();
                                },
                                error: () => {
                                    this.loadingService.hide();
                                    this.mostrarError('No fue posible cargar las matrículas. Por favor, intente nuevamente.');
                                    this.cdr.markForCheck();
                                }
                            });
                    } else {
                        this.loadingService.hide();
                        this.cdr.markForCheck();
                    }
                },
                error: () => {
                    this.loadingService.hide();
                    this.mostrarError('No fue posible cargar los períodos académicos. Por favor, intente nuevamente.');
                    this.cdr.markForCheck();
                }
            });
    }

    onPeriodoChange(periodo: PeriodoAcademico | null): void {
        if (!periodo) return;
        this.loadingService.show(`Sincronizando período ${this.getPeriodoDropdownLabel(periodo)}`);
        this.facadeService.setPeriodoFiltro(periodo);
        this.facadeService.obtenerEstudiantes(periodo)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.loadingService.hide();
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.loadingService.hide();
                    this.mostrarError('No fue posible cargar las matrículas. Por favor, intente nuevamente.');
                    this.cdr.markForCheck();
                }
            });
    }

    onBusquedaChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.busqueda$.next(target.value);
    }

    onEstadoChange(valor: string): void {
        this.estadoFiltro$.next(valor);
    }

    onSemestreChange(valor: number): void {
        this.facadeService.setSemestreFiltro(valor);
    }

    verDetalle(estudiante: Estudiante): void {
        this.router.navigate(['detalle', estudiante.codigo], { relativeTo: this.route });
    }

    trackByEstudiante(index: number, estudiante: Estudiante): string {
        return estudiante.codigo;
    }

    getEstadoLabel(estaPago: boolean | undefined | null): string {
        return getEstadoMatriculaLabel(estaPago);
    }

    getEstadoPagoSeverity(estaPago: boolean | undefined | null): 'success' | 'warning' | 'danger' | 'info' {
        return getEstadoMatriculaSeverity(estaPago);
    }

    getPeriodoDropdownLabel(periodo: PeriodoAcademico | null): string {
        if (!periodo) return '';
        const anio = periodo.año ?? '';
        const tag = periodo.tagPeriodo ?? periodo.periodo ?? '';
        return `${anio} - ${tag}`;
    }

    private obtenerOpcionesSemestre(estudiantes: Estudiante[]): { label: string; value: number }[] {
        const semestresUnicos = [...new Set((estudiantes ?? []).map(e => e.semestreFinanciero))]
            .filter((semestre): semestre is number => semestre !== null && semestre !== undefined)
            .sort((a, b) => a - b);

        return [
            { label: 'Todos los semestres', value: 0 },
            ...semestresUnicos.map(s => ({ label: `Semestre ${s}`, value: s }))
        ];
    }

    private mostrarError(detalle: string): void {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
