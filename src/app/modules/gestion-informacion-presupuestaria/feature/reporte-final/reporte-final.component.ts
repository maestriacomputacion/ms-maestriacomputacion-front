import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { GestionInformacionPresupuestariaFacadeService } from '../../data/facade.service';
import { PeriodoFinancieroDTOPeticion, PeriodoFinancieroDTORespuesta } from '../../dto/periodo-financiero.dto';
import { ConfiguracionReporteFinanciero } from '../../models/domain-models';
import { ReporteFinalVM, mapToReporteFinalVM } from '../../models/reporte-final.vm';
import { TotalesReporteService } from '../../data/totales-reporte.service';
import { LoadingService } from 'src/app/shared/services/loading.service';

interface ReporteFinalComponentVM {
  cargando: boolean;
  periodoSeleccionado: PeriodoFinancieroDTORespuesta | null;
  configuracion: ConfiguracionReporteFinanciero | null;
  estudiantes: ReporteFinalVM[];
  totalBruto: number;
  totalDescuentosCalculado: number;
  totalIngresosNetos: number;
  loading: boolean;
  error: any;
}

@Component({
  selector: 'app-reporte-final',
  templateUrl: './reporte-final.component.html',
  styleUrls: ['./reporte-final.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class ReporteFinalComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  vm$: Observable<ReporteFinalComponentVM>;
  periodoSeleccionado: PeriodoFinancieroDTORespuesta | null = null;

  // Local state for component-specific UI state
  private _periodoSeleccionado = new BehaviorSubject<PeriodoFinancieroDTORespuesta | null>(null);
  private _configuracion = new BehaviorSubject<ConfiguracionReporteFinanciero | null>(null);
  private _estudiantes = new BehaviorSubject<ReporteFinalVM[]>([]);
  private _totalNeto = new BehaviorSubject<number>(0);
  private _totalDescuentos = new BehaviorSubject<number>(0);
  private _totalIngresos = new BehaviorSubject<number>(0);

  sinPeriodos: boolean = false;
  errorPeriodos: boolean = false;

  constructor(
    private facadeService: GestionInformacionPresupuestariaFacadeService,
    private messageService: MessageService,
    private totalesService: TotalesReporteService,
    private loadingService: LoadingService
  ) {
    this.vm$ = combineLatest({
      cargando: this.facadeService.loading$,
      periodoSeleccionado: this._periodoSeleccionado.asObservable(),
      configuracion: this._configuracion.asObservable(),
      estudiantes: this._estudiantes.asObservable(),
      totalBruto: this._totalNeto.asObservable(),
      totalDescuentosCalculado: this._totalDescuentos.asObservable(),
      totalIngresosNetos: this._totalIngresos.asObservable(),
      loading: this.facadeService.loading$,
      error: this.facadeService.error$
    });
  }

  ngOnInit(): void {
    // Initial load handled by selector component output
  }

  onPeriodoChange(periodo: PeriodoFinancieroDTORespuesta): void {
    this.periodoSeleccionado = periodo;
    this.cargarReporte(periodo);
  }

  cargarReporte(periodoObj: PeriodoFinancieroDTORespuesta): void {
    this.loadingService.show(`Cargando reporte final ${periodoObj.año}-${periodoObj.periodo}`);

    const periodo: PeriodoFinancieroDTOPeticion = {
      periodo: periodoObj.periodo,
      año: periodoObj.año
    };

    this.facadeService.obtenerReporteFinanciero(periodo.periodo, periodo.año)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data?.objConfiguracion) {
            this._configuracion.next(data.objConfiguracion);
          }

          if (data?.estudiantes && data.objConfiguracion) {
            const estudiantesVM = data.estudiantes.map(e =>
              mapToReporteFinalVM(e, data.objConfiguracion!)
            );
            this._estudiantes.next(estudiantesVM);
          }

          const totales = this.totalesService.fromBackend({
            totalNeto: data?.totalNeto,
            totalDescuentos: data?.totalDescuentos,
            totalIngresos: data?.totalIngresos
          });
          this._totalNeto.next(totales.totalNeto);
          this._totalDescuentos.next(totales.totalDescuentos);
          this._totalIngresos.next(totales.totalIngresos);
          this.loadingService.hide();
        },
        error: (_err) => {
          const periodoTexto = periodoObj
            ? `para el período ${periodoObj.año}-${periodoObj.periodo}`
            : '';
          this.messageService.add({
            severity: 'error',
            summary: 'Error al cargar',
            detail: `No se pudo cargar el reporte financiero ${periodoTexto}. Intente nuevamente.`
          });
          this.loadingService.hide();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  descargar(): void {
    // TODO: implementar descarga de reporte final (pendiente integración con ExcelService)
  }

}
