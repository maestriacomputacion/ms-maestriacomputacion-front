import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GestionInformacionPresupuestariaFacadeService } from '../../data/facade.service';
import { PeriodoFinancieroDTORespuesta } from '../../dto/periodo-financiero.dto';

export type PeriodoSelectorModo = 'todos' | 'activos' | 'finalizados' | 'activos-y-finalizados' | 'activos-y-proyeccion' | 'anios-activos-y-finalizados' | 'anios-para-reporte-grupos';

@Component({
  selector: 'app-periodo-financiero-selector',
  templateUrl: './periodo-financiero-selector.component.html',
  styleUrls: ['./periodo-financiero-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeriodoFinancieroSelectorComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  @Input() modo: PeriodoSelectorModo = 'todos';
  @Input() mensajeVacio: string = 'No hay períodos académicos disponibles.';

  @Output() periodoSeleccionado = new EventEmitter<PeriodoFinancieroDTORespuesta>();
  @Output() esUltimoPeriodoChange = new EventEmitter<boolean>();
  @Output() sinPeriodosChange = new EventEmitter<boolean>();
  @Output() errorCargaChange = new EventEmitter<boolean>();

  periodos: PeriodoFinancieroDTORespuesta[] = [];
  currentIndex: number = 0;
  periodoActualTexto: string = '';
  hayAnterior: boolean = false;
  haySiguiente: boolean = false;
  loading: boolean = false;
  errorCarga: string | null = null;

  constructor(
    private facadeService: GestionInformacionPresupuestariaFacadeService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.cargarPeriodos();
  }

  cargarPeriodos(): void {
    this.loading = true;
    this.errorCarga = null;

    const fuente$: Observable<PeriodoFinancieroDTORespuesta[]> =
      this.modo === 'activos'                    ? this.facadeService.obtenerPeriodosActivos() :
      this.modo === 'finalizados'                ? this.facadeService.obtenerPeriodosFinalizados() :
      this.modo === 'activos-y-finalizados'      ? this.facadeService.obtenerPeriodosActivosYFinalizados() :
      this.modo === 'activos-y-proyeccion'        ? this.facadeService.obtenerPeriodosActivosYProyeccion() :
      this.modo === 'anios-activos-y-finalizados' ? this.facadeService.obtenerPeriodosActivosYFinalizados() :
      this.modo === 'anios-para-reporte-grupos'   ? this.facadeService.obtenerAniosParaReportePorGrupos() :
                                                 this.facadeService.obtenerPeriodosFinancieros();

    fuente$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (periodos) => {
        if (this.modo === 'anios-activos-y-finalizados' || this.modo === 'anios-para-reporte-grupos') {
          const vistos = new Set<number>();
          this.periodos = periodos.filter(p => {
            const anio = p.anio ?? p.año ?? 0;
            if (vistos.has(anio)) return false;
            vistos.add(anio);
            return true;
          });
        } else {
          this.periodos = periodos;
        }
        if (this.periodos.length > 0) {
          this.currentIndex = 0;
          this.actualizarPeriodoActual();
        }
        this.sinPeriodosChange.emit(this.periodos.length === 0);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading periods', err);
        this.errorCarga = 'No fue posible cargar los períodos académicos. Por favor, verifique su conexión e intente nuevamente.';
        this.sinPeriodosChange.emit(false);
        this.errorCargaChange.emit(true);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  actualizarPeriodoActual(): void {
    const periodo = this.periodos[this.currentIndex];
    if (this.modo === 'anios-activos-y-finalizados' || this.modo === 'anios-para-reporte-grupos') {
      this.periodoActualTexto = `${periodo.año ?? periodo.anio}`;
    } else {
      this.periodoActualTexto = `${periodo.año ?? periodo.anio} - ${periodo.periodo ?? periodo.tagPeriodo}`;
    }
    this.actualizarEstadoFlechas();
    this.periodoSeleccionado.emit(periodo);
    this.esUltimoPeriodoChange.emit(this.currentIndex === this.periodos.length - 1);
  }

  actualizarEstadoFlechas(): void {
    this.hayAnterior = this.currentIndex > 0;
    this.haySiguiente = this.currentIndex < this.periodos.length - 1;
  }

  irPeriodoAnterior(): void {
    if (this.hayAnterior) {
      this.currentIndex--;
      this.actualizarPeriodoActual();
    }
  }

  irPeriodoSiguiente(): void {
    if (this.haySiguiente) {
      this.currentIndex++;
      this.actualizarPeriodoActual();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
