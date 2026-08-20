import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Estudiante, PeriodoAcademico } from '../../models/domain-models';
import { GestionMatriculaFinancieraFacadeService } from '../../data/facade.service';
import { RadicarService } from '../../../gestion-solicitudes/services/radicar.service';
import { AutenticacionService } from '../../../gestion-autenticacion/services/autenticacion.service';
import { LoadingService } from 'src/app/shared/services/loading.service';

interface ResumenMatriculaVM {
  estudiante: Estudiante | null;
  periodoActual: PeriodoAcademico | null;
  loading: boolean;
  error: any;
}

@Component({
  selector: 'app-resumen-matricula-estudiante',
  templateUrl: './resumen-matricula-estudiante.component.html',
  styleUrls: ['./resumen-matricula-estudiante.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class ResumenMatriculaEstudianteComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  vm$: Observable<ResumenMatriculaVM>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private facadeService: GestionMatriculaFinancieraFacadeService,
    private radicarService: RadicarService,
    private messageService: MessageService,
    private autenticacionService: AutenticacionService,
    private loadingService: LoadingService
  ) {
    this.vm$ = combineLatest({
      estudiante: this.facadeService.estudianteSeleccionado$,
      periodoActual: this.facadeService.periodoSeleccionadoFiltro$,
      loading: this.facadeService.loading$,
      error: this.facadeService.error$
    });
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.loadingService.show('Cargando información...');
    
    // 1. Primero cargamos los periodos para saber en cuál estamos
    this.facadeService.obtenerPeriodosAcademicos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (periodos) => {
          if (periodos && periodos.length > 0) {
            // Tomamos el primer periodo (que suele ser el activo según la lógica del back)
            const periodoActual = periodos[0];
            this.facadeService.setPeriodoFiltro(periodoActual);
          }
          
          // 2. Luego identificamos al estudiante y cargamos su detalle
          this.route.paramMap
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
              const idRuta = params.get('id');
              const id = idRuta?.trim()
                ? idRuta
                : this.autenticacionService.getLoggedInUser()?.academicCode ?? null;

              if (!id) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Sin identificador',
                  detail: 'No se pudo determinar el estudiante. Inicie sesión nuevamente.'
                });
                this.loadingService.hide();
                return;
              }
              this.cargarEstudiante(id);
            });
        },
        error: () => {
          this.messageService.add({
            severity: 'warn',
            summary: 'Periodo no cargado',
            detail: 'No se pudo determinar el periodo académico actual.'
          });
          this.loadingService.hide();
        }
      });
  }

  cargarEstudiante(id: string): void {
    this.facadeService.obtenerEstudiante(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (!data) {
            this.messageService.add({
              severity: 'info',
              summary: 'Sin registro',
              detail: 'No se encontró un registro de matrícula para el periodo actual.'
            });
          }
          this.loadingService.hide();
        },
        error: (err) => {
          // Si es un 404 u otro error, permitimos que el estudiante vea el botón de revisión
          this.messageService.add({
            severity: 'error',
            summary: 'Error de consulta',
            detail: 'Hubo un problema al consultar tu matrícula. Si el error persiste, solicita una revisión.'
          });
          this.loadingService.hide();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Navega al módulo de Gestión de Solicitudes con el tipo "Revisión de matrícula"
   * (código RE_MATR) preseleccionado en el formulario de radicación.
   * Antes de navegar, restablece cualquier estado previo del servicio de radicación.
   */
  solicitarRevision(): void {
    this.radicarService.restrablecerValores();
    this.radicarService.codigoSolicitudPreseleccionado = 'RE_MATR';
    this.router.navigate(['/gestionsolicitudes/portafolio/radicar']);
  }

  getPeriodoLabel(periodo: PeriodoAcademico | null): string {
    if (!periodo) return '';
    const anio = periodo.año ?? periodo.tagPeriodo ?? '';
    const periodoNum = periodo.periodo ?? periodo.tagPeriodo ?? '';
    return `${anio}-${periodoNum}`;
  }
}
