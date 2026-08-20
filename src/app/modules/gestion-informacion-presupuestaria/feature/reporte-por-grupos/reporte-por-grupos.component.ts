import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GestionInformacionPresupuestariaFacadeService } from '../../data/facade.service';
import { ConfiguracionReporteGrupos, ReportePorGrupos, ReportePorGrupoFila } from '../../models/domain-models';
import { PeriodoAcademicoDto } from '../../dto/periodo-financiero.dto';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoadingService } from 'src/app/shared/services/loading.service';

export interface GroupColumn { nombre: string; grupoId: number; }

export interface TableRow {
  concept: string;
  key: string;
  isPercentage: boolean;
  isEditable: boolean;
  total: number;
  values: { [groupName: string]: number };
}

@Component({
  selector: 'app-reporte-por-grupos',
  templateUrl: './reporte-por-grupos.component.html',
  styleUrls: ['./reporte-por-grupos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportePorGruposComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  configuracion: ReportePorGrupos | null = null;
  tableRows: TableRow[] = [];
  budgetTableRows: TableRow[] = [];
  distributionSummary: { label: string, value: number, isBold?: boolean }[] = [];
  groupColumns: GroupColumn[] = [];
  loading: boolean = false;
  periodoSeleccionado: PeriodoAcademicoDto | null = null;
  esUltimoPeriodo: boolean = false;
  sinPeriodos: boolean = false;
  errorPeriodos: boolean = false;

  get esEditable(): boolean {
    return this.configuracion?.esEditable ?? false;
  }

  private get periodoAcademicoId(): number {
    return this.periodoSeleccionado?.id ?? 0;
  }

  editingRowKey: string | null = null;
  editingBudgetRowKey: string | null = null;
  clonedRow: { [s: string]: number } = {};
  clonedBudgetRow: { [s: string]: { [groupName: string]: number } } = {};

  basicData: object = {};
  basicOptions: object = {};

  editandoCabecera: boolean = false;
  clonedCabecera: Partial<ConfiguracionReporteGrupos> = {};
  guardandoCabecera: boolean = false;

  editandoIngresos: boolean = false;
  clonedIngresos: number = 0;
  guardandoIngresos: boolean = false;

  displayGastosModal: boolean = false;
  guardandoGastos: boolean = false;

  editandoItems: boolean = false;
  clonedItems: { item1?: number; item2?: number } = {};
  guardandoItems: boolean = false;

  editandoImprevistos: boolean = false;
  clonedImprevistos: number = 0;
  guardandoImprevistos: boolean = false;

  get isAnyEditActive(): boolean {
    return this.editandoIngresos ||
           this.editandoCabecera ||
           this.editandoItems ||
           this.editandoImprevistos ||
           this.editingRowKey !== null ||
           this.editingBudgetRowKey !== null;
  }

  get totalGastosGenerales(): number {
    return this.configuracion?.objConfiguracionReporteGrupos.totalGastosGenerales ?? 0;
  }


  constructor(
    private facadeService: GestionInformacionPresupuestariaFacadeService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.facadeService.reporteGrupos$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          this.configuracion = data;
          this.procesarDatosTabla(this.configuracion);
          this.procesarDistribucion(this.configuracion);
          this.cdr.markForCheck();
        }

      });
  }

  onPeriodoChange(periodo: PeriodoAcademicoDto): void {
    this.periodoSeleccionado = periodo;
    this.cargarDatos(periodo);
  }

  cargarDatos(periodoObj: PeriodoAcademicoDto): void {
    const anio = periodoObj.anio ?? periodoObj.año;
    this.loadingService.show(`Cargando reporte por grupos del año ${anio}`);

    this.facadeService.obtenerReporteGrupos(anio!).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.configuracion = data;
        this.procesarDatosTabla(this.configuracion);
        this.procesarDistribucion(this.configuracion);
        this.loadingService.hide();
        this.cdr.markForCheck();
      },
      error: (_err) => {
        const anioTexto = periodoObj ? `del año ${anio}` : '';
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar',
          detail: `No fue posible cargar el reporte por grupos ${anioTexto}. Por favor, intente nuevamente.`
        });
        this.loadingService.hide();
        this.cdr.markForCheck();
      }
    });
  }


  get aUIPorcentajeDisplay(): number | null {
    const c = this.configuracion?.objConfiguracionReporteGrupos as unknown as Record<string, unknown> | undefined;
    if (!c) return null;
    const v = c['aUIPorcentaje'] ?? c['auiporcentaje'];
    if (typeof v !== 'number') return null;
    return v > 1 ? v : v * 100;
  }

  get item1Display(): number | null {
    const c = this.configuracion?.objConfiguracionReporteGrupos;
    if (!c) return null;
    const v = c.item1;
    if (typeof v !== 'number') return null;
    return v > 1 ? v : v * 100;
  }

  get item2Display(): number | null {
    const c = this.configuracion?.objConfiguracionReporteGrupos;
    if (!c) return null;
    const v = c.item2;
    if (typeof v !== 'number') return null;
    return v > 1 ? v : v * 100;
  }

  get imprevistosDisplay(): number | null {
    const c = this.configuracion?.objConfiguracionReporteGrupos;
    if (!c) return null;
    const v = c.imprevistos;
    if (typeof v !== 'number') return null;
    return v > 1 ? v : v * 100;
  }


  procesarDatosTabla(data: ReportePorGrupos): void {
    const grupos = data.filasPorGrupo ?? [];
    this.groupColumns = grupos.length > 0
      ? grupos.map(g => ({ nombre: g.nombreGrupo, grupoId: g.grupoId }))
      : [{ nombre: 'Total', grupoId: 0 }];

    const concepts: { label: string, key: keyof ReportePorGrupoFila, isPercentage: boolean, isEditable: boolean }[] = [
      { label: 'Total Neto', key: 'totalNeto', isPercentage: false, isEditable: false },
      { label: 'Aporte grupo primer semestre', key: 'aportePrimerSemestre', isPercentage: false, isEditable: false },
      { label: 'Aporte grupo segundo semestre', key: 'aporteSegundoSemestre', isPercentage: false, isEditable: false },
      { label: 'Participación 1er Semestre', key: 'porcentajePrimerSemestre', isPercentage: true, isEditable: false },
      { label: 'Participación 2do semestre', key: 'porcentajeSegundoSemestre', isPercentage: true, isEditable: false },
      { label: 'Participación por año', key: 'participacionPorAnio', isPercentage: true, isEditable: false }
    ];

    this.tableRows = concepts.map(concept => {
      const values: { [groupName: string]: number } = {};
      if (grupos.length > 0) {
        grupos.forEach(g => { values[g.nombreGrupo] = (g[concept.key] as number) ?? 0; });
      } else {
        values['Total'] = (data[concept.key as keyof ReportePorGrupos] as number) ?? 0;
      }

      const total = (data[concept.key as keyof ReportePorGrupos] as number) ?? 0;

      return {
        concept: concept.label,
        key: concept.key as string,
        isPercentage: concept.isPercentage,
        isEditable: concept.isEditable,
        total,
        values
      };
    });

    this.procesarDatosTablaBudget(data);

    const porAñoRow = this.tableRows.find(r => r.key === 'participacionPorAnio');
    if (porAñoRow) {
      this.actualizarGrafica(porAñoRow);
    }
  }

  procesarDistribucion(data: ReportePorGrupos): void {
    const config = data.objConfiguracionReporteGrupos;
    const configAny = config as unknown as Record<string, unknown>;
    const auiValor = (configAny['aUIValor'] ?? configAny['auivalor']) as number | undefined;
    this.distributionSummary = [
      { label: 'AUI Universidad', value: auiValor ?? 0 },
      { label: 'Ingresos Matrículas', value: data.totalIngresos },
      { label: 'Transferencia Unicauca', value: data.transferenciaUnicauca ?? 0 },
      { label: 'Excedentes Maestria', value: config.excedentesMaestria },
      { label: 'Valor a Distribuir (Ingresos-Gastos)', value: config.valorADistribuir, isBold: true }
    ];
  }

  procesarDatosTablaBudget(data: ReportePorGrupos): void {
    const grupos = data.filasPorGrupo ?? [];
    const budgetConcepts: { label: string, key: keyof ReportePorGrupoFila, isEditable: boolean }[] = [
      { label: 'Presupuesto por grupo', key: 'presupuestoPorGrupo', isEditable: false },
      { label: 'Imprevistos', key: 'imprevistos', isEditable: false },
      { label: 'Presupuesto por grupo imprevistos', key: 'presupuestoPorGrupoImprevistos', isEditable: false },
      { label: 'Excedentes Maestría', key: 'vigenciasAnteriores', isEditable: false }
    ];

    this.budgetTableRows = budgetConcepts.map(concept => {
      const values: { [groupName: string]: number } = {};
      if (grupos.length > 0) {
        grupos.forEach(g => { values[g.nombreGrupo] = (g[concept.key] as number) ?? 0; });
      } else {
        values['Total'] = (data[concept.key as keyof ReportePorGrupos] as number) ?? 0;
      }

      const total = (data[concept.key as keyof ReportePorGrupos] as number) ?? 0;

      return {
        concept: concept.label,
        key: concept.key as string,
        isPercentage: false,
        isEditable: concept.isEditable,
        total,
        values
      };
    });
  }

  private actualizarGrafica(porAñoRow: TableRow): void {
    // Colores del Plan de Desarrollo Institucional — Design System TIC v3
    const colors = [
      '#000066', // Primario institucional
      '#5056AC', // Primario light
      '#1D72D3', // Terciario (azul información)
      '#5BAE40', // Verde confirmación
      '#FFB000', // Amarillo advertencia
      '#DB141C', // Secundario light (rojo institucional)
    ];
    this.basicData = {
      labels: this.groupColumns.map(g => g.nombre),
      datasets: [
        {
          label: 'Participación por Año (%)',
          backgroundColor: this.groupColumns.map((_, i) => colors[i % colors.length]),
          borderColor: this.groupColumns.map((_, i) => colors[i % colors.length]),
          borderWidth: 1,
          borderRadius: 4,
          data: this.groupColumns.map(g => porAñoRow.values[g.nombre] ?? 0)
        }
      ]
    };
    this.basicOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
          labels: {
            color: '#454444',
            font: { family: "'Open Sans', sans-serif", size: 12 }
          }
        },
        tooltip: {
          backgroundColor: '#000066',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          titleFont: { family: "'Titillium Web', sans-serif", size: 14, weight: '600' },
          bodyFont: { family: "'Open Sans', sans-serif", size: 12 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx: { parsed: { y: number } }) => `${ctx.parsed.y.toFixed(2)} %`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#454444',
            font: { family: "'Open Sans', sans-serif", size: 12 }
          },
          grid: { color: '#E5E2E1', display: false }
        },
        y: {
          ticks: {
            color: '#454444',
            font: { family: "'Open Sans', sans-serif", size: 12 },
            callback: (value: number) => `${value} %`
          },
          grid: { color: '#E5E2E1' }
        }
      }
    };
  }

  onConfigPercentInput(event: Event, field: string): void {
    const input = event.target as HTMLInputElement;
    let raw = input.value;

    const dot = raw.indexOf('.');
    if (dot !== -1 && raw.length - dot - 1 > 2) {
      raw = raw.substring(0, dot + 3);
      input.value = raw;
    }

    let maxAllowed = 100;
    if (field === 'item1') {
      maxAllowed = Math.round((100 - (this.clonedItems.item2 ?? 0)) * 100) / 100;
    } else if (field === 'item2') {
      maxAllowed = Math.round((100 - (this.clonedItems.item1 ?? 0)) * 100) / 100;
    }

    const parsed = parseFloat(raw);
    let v = 0;
    if (!isNaN(parsed) && parsed > 0) {
      v = Math.round(parsed * 100) / 100;
      if (v > maxAllowed) {
        v = Math.round(maxAllowed * 100) / 100;
        input.value = String(v);
      }
    }

    switch (field) {
      case 'aui': this.clonedCabecera.aUIPorcentaje = v; break;
      case 'item1': this.clonedItems.item1 = v; break;
      case 'item2': this.clonedItems.item2 = v; break;
      case 'imprevistos': this.clonedImprevistos = v; break;
    }
  }

  descargar(): void {
    // La descarga se abre desde opciones-presupuesto (app-descargar-reporte-dialog) con activeTab 'reporte-por-grupos'.
  }

  getMaxPercent(row: TableRow, groupName: string): number {
    const otherSum = this.groupColumns
      .filter(g => g.nombre !== groupName)
      .reduce((acc, g) => acc + (row.values[g.nombre] ?? 0), 0);
    return Math.round(Math.max(0, 100 - otherSum) * 100) / 100;
  }

  onPercentKeyDown(event: KeyboardEvent): void {
    const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', '.'];
    if (allowed.includes(event.key) ||
        (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) ||
        (event.key >= '0' && event.key <= '9')) {
      return;
    }
    event.preventDefault();
  }

  onPercentInput(event: Event, row: TableRow, groupName: string): void {
    const input = event.target as HTMLInputElement;
    let raw = input.value;

    const dot = raw.indexOf('.');
    if (dot !== -1 && raw.length - dot - 1 > 2) {
      raw = raw.substring(0, dot + 3);
      input.value = raw;
    }

    const parsed = parseFloat(raw);
    if (isNaN(parsed) || parsed < 0) {
      row.values[groupName] = 0;
    } else {
      let v = Math.round(parsed * 100) / 100;
      const maxAllowed = this.getMaxPercent(row, groupName);
      if (v > maxAllowed) {
        v = Math.round(maxAllowed * 100) / 100;
        input.value = String(v);
      }
      row.values[groupName] = v;
    }
  }


  onRowEditInit(row: TableRow) {
    if (this.isAnyEditActive) return;
    this.clonedRow = { ...row.values };
    this.editingRowKey = row.key;
  }

  onRowEditSave(row: TableRow) {
    this.editingRowKey = null;

    this.clonedRow = {};

    if (row.key !== 'porcentajePrimerSemestre' && row.key !== 'porcentajeSegundoSemestre') return;

    const semestre = row.key === 'porcentajePrimerSemestre' ? 'PRIMER' : 'SEGUNDO';

    const valoresPorGrupo = this.groupColumns.map(grupo => ({
      grupoId: grupo.grupoId,
      porcentaje: row.values[grupo.nombre] ?? 0,
      semestre
    }));


    this.loadingService.show('Actualizando porcentajes de participación');
    const ejecutarSecuencial = (index: number) => {
      if (index >= valoresPorGrupo.length) return;
      const { grupoId, porcentaje } = valoresPorGrupo[index];
      this.facadeService.actualizarParticipacionGrupo({ periodoAcademicoId: this.periodoAcademicoId, grupoId, porcentajeParticipacion: porcentaje, semestre: valoresPorGrupo[index].semestre })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (_data) => {
            if (index === valoresPorGrupo.length - 1) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Participación actualizada.' });
              this.loadingService.hide();
              this.cdr.markForCheck();
            } else {
              ejecutarSecuencial(index + 1);
            }
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No fue posible actualizar la participación. Por favor, intente nuevamente.' });
            this.loadingService.hide();
          }
        });
    };

    ejecutarSecuencial(0);
  }

  onRowEditCancel(row: TableRow, _index: number) {
    row.values = { ...this.clonedRow };
    this.editingRowKey = null;
    this.clonedRow = {};
  }

  onHeaderEditInit() {
    if (this.isAnyEditActive) return;
    this.editandoCabecera = true;
    this.clonedCabecera = {
      ...this.configuracion?.objConfiguracionReporteGrupos,
      aUIPorcentaje: this.aUIPorcentajeDisplay ?? 0
    };
  }

  onHeaderEditSave() {
    this.loadingService.show('Actualizando distribución');
    this.editandoCabecera = false;
    const aui = this.clonedCabecera.aUIPorcentaje;
    const excedentes = this.clonedCabecera.excedentesMaestria;

    const finish = (data: ReportePorGrupos) => {
      this.configuracion = data;

      this.procesarDatosTabla(this.configuracion);
      this.procesarDistribucion(this.configuracion);
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Distribución actualizada correctamente.' });
      this.loadingService.hide();
      this.clonedCabecera = {};
    };
    const onError = (msg: string) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      this.loadingService.hide();
      this.clonedCabecera = {};
    };

    if (aui !== undefined) {
      this.configuracion!.objConfiguracionReporteGrupos.aUIPorcentaje = aui;
      this.facadeService.actualizarPorcentajeAUIUniversidad(this.periodoAcademicoId, aui).pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
          if (excedentes !== undefined) {
            this.configuracion!.objConfiguracionReporteGrupos.excedentesMaestria = excedentes;
            this.facadeService.actualizarValorExcedentesMaestria(this.periodoAcademicoId, excedentes).pipe(takeUntil(this.destroy$)).subscribe({
              next: (d) => finish(d),
              error: () => onError('No fue posible actualizar los excedentes. Por favor, verifique su conexión.')
            });
          } else {
            finish(data);
          }
        },
        error: () => onError('No fue posible actualizar el AUI. Por favor, intente nuevamente.')
      });
    } else if (excedentes !== undefined) {
      this.configuracion!.objConfiguracionReporteGrupos.excedentesMaestria = excedentes;
      this.facadeService.actualizarValorExcedentesMaestria(this.periodoAcademicoId, excedentes).pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => finish(data),
        error: () => onError('No se pudo actualizar excedentes.')
      });
    } else {
      this.guardandoCabecera = false;
      this.clonedCabecera = {};
    }
  }

  onHeaderEditCancel() {
    this.editandoCabecera = false;
    this.clonedCabecera = {};
  }

  onIngresosEditInit() {
    if (this.isAnyEditActive) return;
    this.editandoIngresos = true;
    this.clonedIngresos = this.configuracion!.totalIngresos;
  }

  onIngresosEditSave() {
    this.guardandoIngresos = true;
    this.editandoIngresos = false;
    this.configuracion!.totalIngresos = this.clonedIngresos;
    this.guardandoIngresos = false;
  }

  onIngresosEditCancel() {
    this.editandoIngresos = false;
    this.clonedIngresos = 0;
  }

  onItemsEditInit() {
    if (this.isAnyEditActive) return;
    this.editandoItems = true;
    this.clonedItems = {
      item1: this.item1Display ?? 0,
      item2: this.item2Display ?? 0
    };
  }

  onItemsEditSave() {
    this.loadingService.show('Actualizando items');
    this.editandoItems = false;
    const item1 = this.clonedItems.item1 ?? 0;
    const item2 = this.clonedItems.item2 ?? 0;
    this.facadeService.actualizarPorcentajeItems({
      item1: item1,
      item2: item2
    }, this.periodoAcademicoId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.configuracion = data;
  
        this.procesarDatosTabla(this.configuracion);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Items actualizados correctamente.' });
        this.loadingService.hide();
        this.clonedItems = {};
      },
      error: (_err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron actualizar los items.' });
        this.editandoItems = true;
        this.loadingService.hide();
      }
    });
  }

  onItemsEditCancel() {
    this.editandoItems = false;
    this.clonedItems = {};
  }

  abrirModalGastos() {
    this.displayGastosModal = true;
    this.cdr.markForCheck();
  }

  onGastosChange() {
    // La suscripción en ngOnInit maneja los cambios automáticamente
  }

  getItemBudgetValue(groupIndex: number, itemIndex: number): number {
    if (!this.configuracion) return 0;
    const grupos = this.configuracion.filasPorGrupo ?? [];
    if (grupos.length > groupIndex) {
      return itemIndex === 0 ? grupos[groupIndex].presupuestoPorGrupoItem1 : grupos[groupIndex].presupuestoPorGrupoItem2;
    }
    return itemIndex === 0 ? this.configuracion.presupuestoPorGrupoItem1 : this.configuracion.presupuestoPorGrupoItem2;
  }

  getItemBudgetTotal(itemIndex: number): number {
    if (!this.configuracion) return 0;
    return itemIndex === 0
      ? this.configuracion.presupuestoPorGrupoItem1
      : this.configuracion.presupuestoPorGrupoItem2;
  }

  onImprevistosEditInit() {
    if (this.isAnyEditActive) return;
    this.editandoImprevistos = true;
    this.clonedImprevistos = this.imprevistosDisplay ?? 0;
  }

  onImprevistosEditSave() {
    this.loadingService.show('Actualizando imprevistos');
    this.editandoImprevistos = false;
    const valor = this.clonedImprevistos;
    this.facadeService.actualizarPorcentajeImprevistos(this.periodoAcademicoId, valor).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.configuracion = data;
  
        this.procesarDatosTabla(this.configuracion);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Imprevistos actualizados correctamente.' });
        this.loadingService.hide();
      },
      error: (_err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron actualizar los imprevistos.' });
        this.editandoImprevistos = true;
        this.loadingService.hide();
      }
    });
  }

  onImprevistosEditCancel() {
    this.editandoImprevistos = false;
    this.clonedImprevistos = 0;
  }

  onBudgetRowEditInit(row: TableRow) {
    if (this.isAnyEditActive) return;
    this.editingBudgetRowKey = row.key;
    this.clonedBudgetRow[row.key] = { ...row.values };
  }

  onBudgetRowEditSave(row: TableRow) {
    if (!this.configuracion) return;

    if (row.key !== 'vigenciasAnteriores') {
      delete this.clonedBudgetRow[row.key];
      this.editingBudgetRowKey = null;
      return;
    }

    const valoresPorGrupo = this.groupColumns.map(grupo => ({
      grupoId: grupo.grupoId,
      valor: row.values[grupo.nombre] ?? 0
    }));

    this.loadingService.show('Actualizando excedentes maestría');
    const ejecutarSecuencial = (index: number) => {
      if (index >= valoresPorGrupo.length) return;
      const { grupoId, valor } = valoresPorGrupo[index];
      this.facadeService.actualizarVigenciasAnterioresGrupo(this.periodoAcademicoId, grupoId, valor)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            if (index === valoresPorGrupo.length - 1) {
              this.configuracion = data;
        
              this.procesarDatosTabla(data);
              delete this.clonedBudgetRow[row.key];
              this.editingBudgetRowKey = null;
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Excedentes maestría actualizados.' });
              this.loadingService.hide();
              this.cdr.markForCheck();
            } else {
              ejecutarSecuencial(index + 1);
            }
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron actualizar los excedentes maestría.' });
            this.loadingService.hide();
          }
        });
    };

    ejecutarSecuencial(0);
  }

  onBudgetRowEditCancel(row: TableRow, _index: number) {
    row.values = this.clonedBudgetRow[row.key];
    delete this.clonedBudgetRow[row.key];
    this.editingBudgetRowKey = null;
  }

  trackByGroupNombre(_index: number, group: GroupColumn): string {
    return group.nombre;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
