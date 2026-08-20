import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { GestionInformacionPresupuestariaFacadeService } from '../../data/facade.service';
import { ConfiguracionReporteFinanciero, ProyeccionEstudiante, ReporteProyeccionEstudiantes } from '../../models/domain-models';
import { PeriodoFinancieroDTORespuesta } from '../../dto/periodo-financiero.dto';
import { ProyeccionEstudianteDTOPeticion } from '../../dto/proyeccion-estudiante.dto';
import { ProyectarPresupuestoDTOPeticion } from '../../dto/proyectar-presupuesto.dto';
import { ConfiguracionReporteFinancieroDTOPeticion } from '../../dto/configuracion-reporte-financiero.dto';
import { TotalesReporteService } from '../../data/totales-reporte.service';
import { LoadingService } from 'src/app/shared/services/loading.service';

interface EstudianteProyeccion extends ProyeccionEstudiante {
  nombreEstudiante: string;
  matricula: number;
  valorBeca: number;
  valorEgresado: number;
  valorVotacion: number;
  recursosComputacionales: number;
  biblioteca: number;
  grupoInvestigacion: string;
  grupoDescuentos: number;
  totalNeto: number;
}

@Component({
  selector: 'app-proyeccion-reporte',
  templateUrl: './proyeccion-reporte.component.html',
  styleUrls: ['./proyeccion-reporte.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class ProyeccionReporteComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  cargando: boolean = false;
  guardando: boolean = false;
  periodoSeleccionado: PeriodoFinancieroDTORespuesta | null = null;
  periodoActualTexto: string = '';
  sinPeriodos: boolean = false;
  errorPeriodos: boolean = false;
  esEditable: boolean = true; // Habilitar edición para proyecciones

  configuracion: ConfiguracionReporteFinanciero | null = null;
  estudiantes: EstudianteProyeccion[] = [];
  clonedEstudiantes: { [s: string]: EstudianteProyeccion; } = {};

  totalNetoCalculado: number = 0;
  totalDescuentosCalculado: number = 0;
  totalIngresosCalculado: number = 0;

  editingRowKey: string | null = null;

  displayProyectarDialog = false;

  constructor(
    private messageService: MessageService,
    private facadeService: GestionInformacionPresupuestariaFacadeService,
    private cdr: ChangeDetectorRef,
    private totalesService: TotalesReporteService,
    private loadingService: LoadingService
  ) { }

  get isAnyEditActive(): boolean {
    return this.editingRowKey !== null;
  }

  ngOnInit(): void {
  }

  onPeriodoChange(periodo: PeriodoFinancieroDTORespuesta): void {
    this.periodoSeleccionado = periodo;
    this.cargarProyeccion(periodo);
  }

  abrirDialogoProyectar(): void {
    this.displayProyectarDialog = true;
  }

  proyectarPresupuesto(dto: ProyectarPresupuestoDTOPeticion): void {
    this.loadingService.show('Creando proyección de presupuesto...');
    this.facadeService.proyectarPresupuesto(dto).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Período de proyección creado correctamente' });
        this.loadingService.hide();
        // Recarga la página para refrescar el selector de períodos con el nuevo período creado
        window.location.reload();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.detail || err?.error?.message || 'No se pudo crear la proyección' });
        this.loadingService.hide();
      }
    });
  }

  cargarProyeccion(periodo?: PeriodoFinancieroDTORespuesta): void {
    this.loadingService.show(periodo ? `Cargando proyección ${periodo.año}-${periodo.periodo}` : 'Cargando proyección');
    const tagPeriodo = periodo?.tagPeriodo ?? periodo?.periodo ?? undefined;
    const anio = periodo?.anio ?? periodo?.año ?? undefined;

    this.facadeService.obtenerProyeccionEstudiantes(tagPeriodo, anio).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.procesarRespuesta(data);
        this.loadingService.hide();
        this.cdr.markForCheck();
      },
      error: (_err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No fue posible cargar la proyección. Por favor, intente nuevamente.' });
        this.loadingService.hide();
        this.cdr.markForCheck();
      }
    });
  }

  procesarRespuesta(data: ReporteProyeccionEstudiantes) {
    if (data.periodo) {
      this.periodoActualTexto = `${data.periodo.año}-${data.periodo.periodo}`;
    }
    if (data.objConfiguracion) {
      this.configuracion = data.objConfiguracion;
    }
    if (data.estudiantes && this.configuracion) {
      this.estudiantes = data.estudiantes.map(e => this.mapearEstudianteProyeccion(e));
    }
    const totales = this.totalesService.fromBackend({
      totalNeto: data.totalNeto,
      totalDescuentos: data.totalDescuentos,
      totalIngresos: data.totalIngresos
    });
    this.totalNetoCalculado      = totales.totalNeto;
    this.totalDescuentosCalculado = totales.totalDescuentos;
    this.totalIngresosCalculado  = totales.totalIngresos;
  }

  actualizarSoloFilaModificada(data: ReporteProyeccionEstudiantes): void {
    if (data.objConfiguracion) {
      this.configuracion = data.objConfiguracion;
    }
    if (data.periodo) {
      this.periodoActualTexto = `${data.periodo.año}-${data.periodo.periodo}`;
    }
    if (!data.estudiantes || !this.configuracion || data.estudiantes.length === 0) return;
    for (const e of data.estudiantes) {
      const actualizado = this.mapearEstudianteProyeccion(e);
      const index = this.findIndexById(e.codigoEstudiante);
      if (index >= 0) {
        this.estudiantes[index] = actualizado;
      }
    }
    const totales = this.totalesService.fromBackend({
      totalNeto: data.totalNeto,
      totalDescuentos: data.totalDescuentos,
      totalIngresos: data.totalIngresos
    });
    this.totalNetoCalculado      = totales.totalNeto;
    this.totalDescuentosCalculado = totales.totalDescuentos;
    this.totalIngresosCalculado  = totales.totalIngresos;
  }

  private mapearEstudianteProyeccion(e: ProyeccionEstudiante): EstudianteProyeccion {
    return {
      ...e,
      nombreEstudiante: `${e.nombre ?? ''} ${e.apellido ?? ''}`.trim() || e.codigoEstudiante,
      matricula: e.valorMatricula || 0,
      valorBeca: e.valorDescuentoBeca || 0,
      valorEgresado: e.valorDescuentoEgresado || 0,
      valorVotacion: e.valorDescuentoVoto || 0,
      recursosComputacionales: this.configuracion?.recursosComputacionales || 0,
      biblioteca: this.configuracion?.biblioteca || 0,
      grupoDescuentos: e.totalDescuentos || 0,
      totalNeto: e.totalNetoConDerechos || 0
    } as EstudianteProyeccion;
  }


  onConfigSave(config: Partial<ConfiguracionReporteFinanciero>) {
    if (!this.configuracion) return;

    this.loadingService.show('Actualizando configuración');

    const configUpdate: ConfiguracionReporteFinancieroDTOPeticion = {
      biblioteca: config.biblioteca!,
      recursosComputacionales: config.recursosComputacionales!,
      valorSMLV: config.valorSMLV!,
      esReporteFinal: this.configuracion.esReporteFinal
    };

    this.facadeService.actualizarConfiguracionProyeccion(configUpdate).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Configuración actualizada correctamente' });
        this.procesarRespuesta(data);
        this.loadingService.hide();
      },
      error: (_err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar configuración.' });
        this.loadingService.hide();
      }
    });
  }

  onRowEditInit(estudiante: EstudianteProyeccion) {
    this.editingRowKey = estudiante.codigoEstudiante;
    this.clonedEstudiantes[estudiante.codigoEstudiante] = { ...estudiante };
  }

  onRowEditSave(estudiante: EstudianteProyeccion) {
    if (estudiante.porcentajeBeca < 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Valor inválido',
        detail: `${estudiante.nombreEstudiante}: el porcentaje de beca no puede ser negativo.`
      });
      this.onRowEditCancel(estudiante, this.findIndexById(estudiante.codigoEstudiante));
      return;
    }
    if (estudiante.porcentajeBeca > 100) {
      this.messageService.add({
        severity: 'error',
        summary: 'Valor inválido',
        detail: `${estudiante.nombreEstudiante}: el porcentaje de beca no puede superar 100%.`
      });
      return;
    }

    this.loadingService.show(`Guardando cambios de ${estudiante.nombreEstudiante}`);
    this.editingRowKey = null;

    const proyeccionUpdate: ProyeccionEstudianteDTOPeticion = {
      codigoEstudiante: estudiante.codigoEstudiante,
      estaPago: estudiante.estaPago,
      aplicaVotacion: estudiante.aplicaVotacion ?? false,
      porcentajeBeca: estudiante.porcentajeBeca,
      aplicaEgresado: estudiante.aplicaEgresado ?? false
    };


    this.facadeService.actualizarProyeccionEstudiante(
      proyeccionUpdate,
      this.periodoSeleccionado?.tagPeriodo ?? this.periodoSeleccionado?.periodo ?? undefined,
      this.periodoSeleccionado?.anio ?? this.periodoSeleccionado?.año ?? undefined
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.procesarRespuesta(data);
        delete this.clonedEstudiantes[estudiante.codigoEstudiante];
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estudiante actualizado correctamente' });
        this.loadingService.hide();
        this.cdr.markForCheck();
      },
      error: (_err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar estudiante.' });
        this.onRowEditCancel(estudiante, this.findIndexById(estudiante.codigoEstudiante));
        this.loadingService.hide();
        this.cdr.markForCheck();
      }
    });
  }

  onRowEditCancel(estudiante: EstudianteProyeccion, index: number) {
    this.estudiantes[index] = this.clonedEstudiantes[estudiante.codigoEstudiante];
    delete this.clonedEstudiantes[estudiante.codigoEstudiante];
    this.editingRowKey = null;
  }

  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.estudiantes.length; i++) {
      if (this.estudiantes[i].codigoEstudiante === id) {
        index = i;
        break;
      }
    }
    return index;
  }

  onPercentInput(event: Event, estudiante: EstudianteProyeccion, campo: keyof EstudianteProyeccion): void {
    const input = event.target as HTMLInputElement;
    let raw = input.value;

    const dot = raw.indexOf('.');
    if (dot !== -1 && raw.length - dot - 1 > 2) {
      raw = raw.substring(0, dot + 3);
      input.value = raw;
    }

    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      (estudiante as unknown as Record<string, unknown>)[campo as string] = Math.round(parsed * 100) / 100;
    }
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  descargar(): void {
    // TODO: implementar descarga de proyección reporte (pendiente integración con ExcelService)
  }
}
