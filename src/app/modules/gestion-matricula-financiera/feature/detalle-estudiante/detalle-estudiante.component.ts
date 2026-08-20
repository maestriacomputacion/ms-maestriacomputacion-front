import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Estudiante, PeriodoAcademico } from '../../models/domain-models';
import { GestionMatriculaFinancieraFacadeService } from '../../data/facade.service';
import { LoadingService } from 'src/app/shared/services/loading.service';

interface DetalleEstudianteVM {
    estudiante: Estudiante | null;
    periodo: PeriodoAcademico | null;
    periodos: PeriodoAcademico[];
    loading: boolean;
    error: any;
}

@Component({
  selector: 'app-detalle-estudiante',
  templateUrl: './detalle-estudiante.component.html',
  styleUrls: ['./detalle-estudiante.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class DetalleEstudianteComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  vm$: Observable<DetalleEstudianteVM>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private facadeService: GestionMatriculaFinancieraFacadeService,
    private messageService: MessageService,
    private loadingService: LoadingService
  ) {
    this.vm$ = combineLatest({
      estudiante: this.facadeService.estudianteSeleccionado$,
      periodo: this.facadeService.periodoSeleccionadoFiltro$,
      periodos: this.facadeService.periodos$,
      loading: this.facadeService.loading$,
      error: this.facadeService.error$
    });
  }

  ngOnInit(): void {
    // Cargar periodos si no están en el facade (para etiquetar el periodo del detalle)
    if (!this.facadeService.getPeriodosSync()?.length) {
      this.facadeService.obtenerPeriodosAcademicos().pipe(takeUntil(this.destroy$)).subscribe();
    }

    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params.get('id');
        if (!id || id.trim() === '') {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'El identificador del estudiante no es válido.'
          });
          this.router.navigate(['/gestion-matricula-financiera']);
          return;
        }
        this.cargarEstudiante(id);
      });
  }

  cargarEstudiante(id: string): void {
    this.loadingService.show(`Cargando detalle del estudiante ${id}`);
    this.facadeService.obtenerEstudiante(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (!data) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se encontró información para el estudiante solicitado.'
            });
            this.router.navigate(['/gestion-matricula-financiera']);
            return;
          }
          this.loadingService.hide();
        },
        error: (_err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar la información del estudiante. Volviendo a la lista.'
          });
          this.loadingService.hide();
          this.router.navigate(['/gestion-matricula-financiera']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  volver(): void {
    this.router.navigate(['/gestion-matricula-financiera']);
  }

  /** Etiqueta del periodo al que pertenece el detalle: el seleccionado en el listado,
   *  o el periodo activo si no hay filtro (mismo criterio que usa el backend). */
  getPeriodoLabel(periodo: PeriodoAcademico | null, periodos: PeriodoAcademico[]): string {
    const p = periodo ?? periodos.find(per => per.estado === 'ACTIVO') ?? periodos[0];
    if (!p) return '';
    const anio = p.año ?? p.tagPeriodo ?? '';
    const periodoNum = p.periodo ?? p.tagPeriodo ?? '';
    return `${anio}-${periodoNum}`;
  }
}
