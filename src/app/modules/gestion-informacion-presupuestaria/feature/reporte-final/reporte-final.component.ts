import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { GestionInformacionPresupuestariaFacadeService } from '../../data/facade.service';
import { PeriodoFinancieroDTOPeticion, PeriodoFinancieroDTORespuesta } from '../../dto/periodo-financiero.dto';
import { ConfiguracionReporteFinanciero } from '../../models/domain-models';
import { ReporteFinalVM, mapToReporteFinalVM } from '../../models/reporte-final.vm';
import { TotalesReporteService } from '../../data/totales-reporte.service';
import { LoadingService } from 'src/app/shared/services/loading.service';

@Component({
  selector: 'app-reporte-final',
  templateUrl: './reporte-final.component.html',
  styleUrls: ['./reporte-final.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class ReporteFinalComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  cargando: boolean = false;
  periodoSeleccionado: PeriodoFinancieroDTORespuesta | null = null;
  sinPeriodos: boolean = false;
  errorPeriodos: boolean = false;

  configuracion: ConfiguracionReporteFinanciero | null = null;
  estudiantes: ReporteFinalVM[] = [];

  totalBruto: number = 0;
  totalDescuentosCalculado: number = 0;
  totalIngresosNetos: number = 0;

  constructor(
    private facadeService: GestionInformacionPresupuestariaFacadeService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private totalesService: TotalesReporteService,
    private loadingService: LoadingService
  ) { }

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

    this.facadeService.obtenerReporteFinanciero(periodo.periodo, periodo.año).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        if (data?.objConfiguracion) {
          this.configuracion = data.objConfiguracion;
        }

        if (data?.estudiantes && this.configuracion) {
          this.estudiantes = data.estudiantes.map(e =>
            mapToReporteFinalVM(e, this.configuracion!)
          );
        }

        const totales = this.totalesService.fromBackend({
          totalNeto: data?.totalNeto,
          totalDescuentos: data?.totalDescuentos,
          totalIngresos: data?.totalIngresos
        });
        this.totalBruto              = totales.totalNeto;
        this.totalDescuentosCalculado = totales.totalDescuentos;
        this.totalIngresosNetos      = totales.totalIngresos;
        this.loadingService.hide();
        this.cdr.markForCheck();
      },
      error: (_err) => {
        const periodoTexto = periodoObj
          ? `para el período ${periodoObj.año}-${periodoObj.periodo}`
          : '';
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar',
          detail: `No fue posible cargar el reporte financiero ${periodoTexto}. Por favor, intente nuevamente.`
        });
        this.loadingService.hide();
        this.cdr.markForCheck();
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
