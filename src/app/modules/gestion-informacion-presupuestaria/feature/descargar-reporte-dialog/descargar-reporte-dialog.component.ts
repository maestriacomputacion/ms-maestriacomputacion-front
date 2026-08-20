import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PeriodoFinancieroDTORespuesta } from '../../dto/periodo-financiero.dto';
import { GestionInformacionPresupuestariaFacadeService } from '../../data/facade.service';
import { ExcelService } from '../../data/excel.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-descargar-reporte-dialog',
  templateUrl: './descargar-reporte-dialog.component.html',
  styleUrls: ['./descargar-reporte-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescargarReporteDialogComponent implements OnInit, OnDestroy, OnChanges {
  private destroy$ = new Subject<void>();

  @Input() display: boolean = false;
  @Input() reporteActual: string = '';
  @Input() periodoActual: PeriodoFinancieroDTORespuesta | null = null;
  @Output() displayChange = new EventEmitter<boolean>();

  reportOptions = [
    { name: 'Reporte Final', value: 'reporte-final' },
    { name: 'Proyección Reporte', value: 'proyeccion-reporte' },
    { name: 'Reporte por Grupos', value: 'reporte-por-grupos' }
  ];

  periodOptions: { name: string; value: string }[] = [];
  allPeriodOptions: { name: string; value: string; period: PeriodoFinancieroDTORespuesta }[] = [];
  selectedReport: string = '';
  selectedPeriodKey: string = '';
  loadingPeriods: boolean = false;
  loadingDownload: boolean = false;

  constructor(
    private facadeService: GestionInformacionPresupuestariaFacadeService,
    private excelService: ExcelService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const periodChanged = !!changes['periodoActual'];
    const reportChanged = !!changes['reporteActual'];
    const visibilityChanged = !!changes['display'] && this.display === true;

    if ((periodChanged || reportChanged || visibilityChanged) && this.allPeriodOptions.length > 0) {
      this.sincronizarSeleccion();
    }
  }

  onDialogShow(): void {
    if (this.allPeriodOptions.length === 0) {
      this.cargarPeriodos();
    } else {
      this.sincronizarSeleccion();
    }
  }

  cargarPeriodos() {
    this.loadingPeriods = true;
    this.facadeService.obtenerPeriodosFinancieros().pipe(takeUntil(this.destroy$)).subscribe({
      next: (periodos) => {
        const seen = new Set<string>();
        const unicos = periodos.filter(p => {
          const key = `${p.año}-${p.periodo}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        this.allPeriodOptions = unicos
          .sort((a, b) => {
            const anioA = a.año ?? a.anio ?? 0;
            const anioB = b.año ?? b.anio ?? 0;
            const periodA = a.periodo ?? a.tagPeriodo ?? 0;
            const periodB = b.periodo ?? b.tagPeriodo ?? 0;
            return anioB !== anioA ? anioB - anioA : periodB - periodA;
          })
          .map(p => {
            const anio = p.año ?? p.anio;
            const periodNum = p.periodo ?? p.tagPeriodo;
            const label = `${anio}-${periodNum}`;
            return {
              name: label,
              value: label,
              period: { ...p, año: anio, periodo: periodNum }
            };
          });
        this.loadingPeriods = false;
        this.cdr.detectChanges();
        this.sincronizarSeleccion();
      },
      error: () => {
        this.loadingPeriods = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los períodos académicos. Intente nuevamente más tarde.'
        });
      }
    });
  }

  private _extrayerLlavePeriodo(periodo: PeriodoFinancieroDTORespuesta): string {
    if (!periodo) return '';
    const anio = periodo.año ?? periodo.anio;
    const periodNum = periodo.periodo ?? periodo.tagPeriodo;
    return (anio != null && periodNum != null) ? `${anio}-${periodNum}` : '';
  }

  actualizarPeriodosDisponibles() {
    if (this.allPeriodOptions.length === 0) {
      this.periodOptions = [];
      return;
    }

    const previousKey = this.selectedPeriodKey;

    if (this.selectedReport === 'reporte-final') {
      this.periodOptions = this.allPeriodOptions.slice(1).map(o => ({ name: o.name, value: o.value }));
    } else if (this.selectedReport === 'proyeccion-reporte') {
      const latest = this.allPeriodOptions[0];
      this.periodOptions = latest ? [{ name: latest.name, value: latest.value }] : [];
    } else {
      this.periodOptions = this.allPeriodOptions.map(o => ({ name: o.name, value: o.value }));
    }

    const exists = this.periodOptions.some(opt => opt.value === previousKey);
    if (!exists) {
      this.selectedPeriodKey = '';
    }
  }

  onReportChange() {
    this.actualizarPeriodosDisponibles();
    this.aplicarSeleccionPeriodo();
    this.cdr.detectChanges();
  }

  private aplicarSeleccionPeriodo(): void {
    if (this.periodOptions.length === 0) return;

    if (this.selectedReport === 'proyeccion-reporte') {
      this.selectedPeriodKey = this.periodOptions[0].value;
    } else if (this.periodoActual) {
      const key = this._extrayerLlavePeriodo(this.periodoActual);
      const exists = this.periodOptions.some(opt => opt.value === key);

      if (exists) {
        this.selectedPeriodKey = key;
      } else if (!this.selectedPeriodKey) {
        this.selectedPeriodKey = this.periodOptions[0].value;
      }
    } else if (!this.selectedPeriodKey) {
      this.selectedPeriodKey = this.periodOptions[0].value;
    }
  }

  sincronizarSeleccion() {
    if (this.reporteActual) {
      this.selectedReport = this.reporteActual;
    }
    this.actualizarPeriodosDisponibles();
    this.cdr.detectChanges(); // Asegura que la lista de periodOptions se actualice en el DOM
    this.aplicarSeleccionPeriodo();
    this.cdr.detectChanges(); // Asegura que el valor seleccionado se refleje en el dropdown
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cerrar() {
    this.loadingDownload = false;
    this.displayChange.emit(false);
  }

  descargar() {
    const selectedPeriodObj = this.allPeriodOptions.find(o => o.value === this.selectedPeriodKey)?.period ?? null;

    if (!this.selectedReport || !selectedPeriodObj) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor seleccione un reporte y un período académico.'
      });
      return;
    }

    this.loadingDownload = true;
    const periodo = { año: selectedPeriodObj.año, periodo: selectedPeriodObj.periodo };

    switch (this.selectedReport) {
      case 'reporte-final':
        this.descargarReporteFinal(periodo);
        break;
      case 'proyeccion-reporte':
        this.descargarProyeccionReporte();
        break;
      case 'reporte-por-grupos':
        this.descargarReportePorGrupos(periodo);
        break;
      default:
        this.loadingDownload = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Tipo de reporte no reconocido.'
        });
    }
  }

  private descargarReporteFinal(periodo: { año: number | undefined; periodo: number | undefined }) {
    this.facadeService.obtenerReporteFinanciero(periodo.periodo!, periodo.año!).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        if (!data || !data.estudiantes || data.estudiantes.length === 0) {
          this.loadingDownload = false;
          this.messageService.add({
            severity: 'warn',
            summary: 'Sin datos',
            detail: 'No hay registros disponibles para exportar en el período seleccionado.'
          });
          return;
        }
        this.excelService.generarExcelReporteFinal(data);
        this.loadingDownload = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Reporte Final descargado correctamente.' });
        this.cerrar();
      },
      error: (err) => {
        this.loadingDownload = false;
        console.error('Error al obtener reporte final:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el Reporte Final.' });
      }
    });
  }

  private descargarProyeccionReporte() {
    this.facadeService.obtenerProyeccionEstudiantes().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        if (!data || !data.estudiantes || data.estudiantes.length === 0) {
          this.loadingDownload = false;
          this.messageService.add({
            severity: 'warn',
            summary: 'Sin datos',
            detail: 'No hay registros disponibles para exportar en la proyección actual.'
          });
          return;
        }
        this.excelService.generarExcelProyeccionReporte(data);
        this.loadingDownload = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proyección de Reporte descargada correctamente.' });
        this.cerrar();
      },
      error: (err) => {
        this.loadingDownload = false;
        console.error('Error al obtener proyección:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar la Proyección de Reporte.' });
      }
    });
  }

  private descargarReportePorGrupos(periodo: { año: number | undefined; periodo: number | undefined }) {
    this.facadeService.obtenerReporteGrupos(periodo.año!).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        if (!data || !data.objConfiguracionReporteGrupos) {
          this.loadingDownload = false;
          this.messageService.add({
            severity: 'warn',
            summary: 'Sin datos',
            detail: 'No hay registros disponibles para exportar en el período seleccionado.'
          });
          return;
        }
        this.excelService.generarExcelReportePorGrupos(data);
        this.loadingDownload = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Reporte por Grupos descargado correctamente.' });
        this.cerrar();
      },
      error: (err) => {
        this.loadingDownload = false;
        console.error('Error al obtener reporte por grupos:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el Reporte por Grupos.' });
      }
    });
  }
}
