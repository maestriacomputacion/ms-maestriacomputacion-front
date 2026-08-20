import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GestionInformacionPresupuestariaFacadeService } from '../../data/facade.service';
import { ConfiguracionReporteFinanciero, ProyeccionEstudiante, ReporteProyeccionEstudiantes } from '../../models/domain-models';
import { PeriodoFinancieroDTORespuesta } from '../../dto/periodo-financiero.dto';
import { ProyeccionEstudianteDTOPeticion, ActualizarEstudianteSimuladoDTOPeticion } from '../../dto/proyeccion-estudiante.dto';
import { ConfiguracionReporteFinancieroDTOPeticion } from '../../dto/configuracion-reporte-financiero.dto';
import { ProyectarPresupuestoDTOPeticion } from '../../dto/proyectar-presupuesto.dto';
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

interface ProyeccionReporteVM {
  cargando: boolean;
  periodoSeleccionado: PeriodoFinancieroDTORespuesta | null;
  periodoActualTexto: string;
  configuracion: ConfiguracionReporteFinanciero | null;
  estudiantes: EstudianteProyeccion[];
  totalNetoCalculado: number;
  totalDescuentosCalculado: number;
  totalIngresosCalculado: number;
  editandoCabecera: boolean;
  editingRowKey: string | null;
  loading: boolean;
  error: any;
}

@Component({
  selector: 'app-proyeccion-reporte',
  templateUrl: './proyeccion-reporte.component.html',
  styleUrls: ['./proyeccion-reporte.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService, ConfirmationService]
})
export class ProyeccionReporteComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  readonly gruposDisponibles: string[] = ['GTI', 'IDIS', 'GICO'];

  vm$: Observable<ProyeccionReporteVM>;

  // Local state for component-specific UI state
  private _periodoSeleccionado = new BehaviorSubject<PeriodoFinancieroDTORespuesta | null>(null);
  private _periodoActualTexto = new BehaviorSubject<string>('');
  private _configuracion = new BehaviorSubject<ConfiguracionReporteFinanciero | null>(null);
  private _estudiantes = new BehaviorSubject<EstudianteProyeccion[]>([]);
  private _totalNeto = new BehaviorSubject<number>(0);
  private _totalDescuentos = new BehaviorSubject<number>(0);
  private _totalIngresos = new BehaviorSubject<number>(0);
  private _editandoCabecera = new BehaviorSubject<boolean>(false);
  private _editingRowKey = new BehaviorSubject<string | null>(null);

  periodoSeleccionado: PeriodoFinancieroDTORespuesta | null = null;
  clonedEstudiantes: { [s: string]: EstudianteProyeccion; } = {};
  clonedCabecera: Partial<ConfiguracionReporteFinanciero> = {};
  editandoCabecera: boolean = false;
  editingRowKey: string | null = null;
  creandoSimulado: boolean = false;

  constructor(
    private messageService: MessageService,
    private facadeService: GestionInformacionPresupuestariaFacadeService,
    private totalesService: TotalesReporteService,
    private loadingService: LoadingService,
    private confirmationService: ConfirmationService
  ) {
    this.vm$ = combineLatest({
      cargando: this.facadeService.loading$,
      periodoSeleccionado: this._periodoSeleccionado.asObservable(),
      periodoActualTexto: this._periodoActualTexto.asObservable(),
      configuracion: this._configuracion.asObservable(),
      estudiantes: this._estudiantes.asObservable(),
      totalNetoCalculado: this._totalNeto.asObservable(),
      totalDescuentosCalculado: this._totalDescuentos.asObservable(),
      totalIngresosCalculado: this._totalIngresos.asObservable(),
      editandoCabecera: this._editandoCabecera.asObservable(),
      editingRowKey: this._editingRowKey.asObservable(),
      loading: this.facadeService.loading$,
      error: this.facadeService.error$
    });
  }

  get isAnyEditActive(): boolean {
    return this.editandoCabecera || this.editingRowKey !== null;
  }

  tituloProyeccion(periodo: PeriodoFinancieroDTORespuesta | null): string {
    const estado = periodo?.estado;
    if (estado === 'ACTIVO') return 'Proyección Reporte Financiero — Período Activo';
    if (estado === 'PROYECCION') return 'Proyección Reporte Financiero — Período en Proyección';
    return 'Proyección Reporte Financiero';
  }

  displayProyectarDialog = false;

  ngOnInit(): void {
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
        // Trigger reload of periodo selector via page reload approach
        window.location.reload();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.detail || err?.error?.message || 'No se pudo crear la proyección' });
        this.loadingService.hide();
      }
    });
  }

  onPeriodoChange(periodo: PeriodoFinancieroDTORespuesta): void {
    this.periodoSeleccionado = periodo;
    this.cargarProyeccion(periodo);
  }

  cargarProyeccion(periodo?: PeriodoFinancieroDTORespuesta): void {
    this.loadingService.show(periodo ? `Cargando proyección ${periodo.año}-${periodo.periodo}` : 'Cargando proyección');
    const tagPeriodo = periodo?.tagPeriodo ?? periodo?.periodo ?? undefined;
    const anio = periodo?.anio ?? periodo?.año ?? undefined;

    this.facadeService.obtenerProyeccionEstudiantes(tagPeriodo, anio)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.procesarRespuesta(data);
          this.loadingService.hide();
        },
        error: (_err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la proyección.' });
          this.loadingService.hide();
        }
      });
  }

  procesarRespuesta(data: ReporteProyeccionEstudiantes) {
    if (data.periodo) {
      this._periodoActualTexto.next(`${data.periodo.año}-${data.periodo.periodo}`);
    }
    if (data.objConfiguracion) {
      this._configuracion.next(data.objConfiguracion);
    }
    if (data.estudiantes && data.objConfiguracion) {
      const estudiantesProyeccion = data.estudiantes.map(e => this.mapearEstudianteProyeccion(e, data.objConfiguracion!));
      this._estudiantes.next(estudiantesProyeccion);
    }
    const totales = this.totalesService.fromBackend({
      totalNeto: data.totalNeto,
      totalDescuentos: data.totalDescuentos,
      totalIngresos: data.totalIngresos
    });
    this._totalNeto.next(totales.totalNeto);
    this._totalDescuentos.next(totales.totalDescuentos);
    this._totalIngresos.next(totales.totalIngresos);
  }

  actualizarSoloFilaModificada(data: ReporteProyeccionEstudiantes): void {
    if (data.objConfiguracion) {
      this._configuracion.next(data.objConfiguracion);
    }
    if (data.periodo) {
      this._periodoActualTexto.next(`${data.periodo.año}-${data.periodo.periodo}`);
    }
    if (!data.estudiantes || !data.objConfiguracion || data.estudiantes.length === 0) return;
    
    const currentEstudiantes = this._estudiantes.value;
    for (const e of data.estudiantes) {
      const actualizado = this.mapearEstudianteProyeccion(e, data.objConfiguracion);
      const idx = currentEstudiantes.findIndex(est => est.codigoEstudiante === actualizado.codigoEstudiante);
      if (idx >= 0) {
        currentEstudiantes[idx] = actualizado;
      }
    }
    this._estudiantes.next([...currentEstudiantes]);
    
    const totales = this.totalesService.fromBackend({
      totalNeto: data.totalNeto,
      totalDescuentos: data.totalDescuentos,
      totalIngresos: data.totalIngresos
    });
    this._totalNeto.next(totales.totalNeto);
    this._totalDescuentos.next(totales.totalDescuentos);
    this._totalIngresos.next(totales.totalIngresos);
  }

  private mapearEstudianteProyeccion(e: ProyeccionEstudiante, config: ConfiguracionReporteFinanciero): EstudianteProyeccion {
    const recursosComputacionales = config.recursosComputacionales || 0;
    const biblioteca = config.biblioteca || 0;

    return {
      ...e,
      porcentajeBeca: this.toPercent(e.porcentajeBeca),
      nombreEstudiante: [e.nombre, e.apellido].filter(Boolean).join(' ') || e.codigoEstudiante,
      matricula: e.valorMatricula || 0,
      valorBeca: e.valorDescuentoBeca || 0,
      valorEgresado: e.valorDescuentoEgresado || 0,
      valorVotacion: e.valorDescuentoVoto || 0,
      recursosComputacionales: recursosComputacionales,
      biblioteca: biblioteca,
      grupoDescuentos: e.totalDescuentos || 0,
      totalNeto: e.totalNetoConDerechos || 0
    } as EstudianteProyeccion;
  }

  onHeaderEditInit() {
    if (this.editingRowKey) {
      const estudianteEnEdicion = this._estudiantes.value.find(e => e.codigoEstudiante === this.editingRowKey);
      const nombre = estudianteEnEdicion?.nombreEstudiante ?? 'un estudiante';
      this.messageService.add({
        severity: 'warn',
        summary: 'Edición en curso',
        detail: `Guarde o cancele los cambios de ${nombre} antes de editar la configuración.`
      });
      return;
    }

    this.editandoCabecera = true;
    this._editandoCabecera.next(true);
    
    const config = this._configuracion.value;
    if (config) {
      this.clonedCabecera = { ...config };
    }
  }

  onHeaderEditSave() {
    const config = this._configuracion.value;
    if (!config) return;

    this.loadingService.show('Actualizando configuración');
    this.editandoCabecera = false;
    this._editandoCabecera.next(false);

    const configUpdate: ConfiguracionReporteFinancieroDTOPeticion = {
      biblioteca: this.clonedCabecera.biblioteca!,
      recursosComputacionales: this.clonedCabecera.recursosComputacionales!,
      valorSMLV: this.clonedCabecera.valorSMLV!,
      esReporteFinal: config.esReporteFinal
    };

    this.facadeService.actualizarConfiguracionProyeccion(configUpdate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Configuración actualizada correctamente' });
          this.clonedCabecera = {};
          // La respuesta del PUT viene de un endpoint distinto (configuracion-reporte-financiero)
          // que no tiene el fallback para periodos en PROYECCION sin matricula-financiera real,
          // y devuelve la lista de estudiantes vacia. Se vuelve a consultar el endpoint de
          // proyeccion (el correcto) para repintar la tabla con los valores ya recalculados.
          this.cargarProyeccion(this.periodoSeleccionado ?? undefined);
        },
        error: (_err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar configuración.' });
          this.loadingService.hide();
        }
      });
  }

  onHeaderEditCancel() {
    this.editandoCabecera = false;
    this._editandoCabecera.next(false);
    this.clonedCabecera = {};
  }

  onRowEditInit(estudiante: EstudianteProyeccion) {
    if (this.editandoCabecera) {
      return;
    }
    this.editingRowKey = estudiante.codigoEstudiante;
    this._editingRowKey.next(this.editingRowKey);
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

    if (estudiante.esSimulado) {
      this.guardarEdicionSimulado(estudiante);
      return;
    }

    this.loadingService.show(`Guardando cambios de ${estudiante.nombreEstudiante}`);
    this.editingRowKey = null;
    this._editingRowKey.next(null);

    const proyeccionUpdate: ProyeccionEstudianteDTOPeticion = {
      codigoEstudiante: estudiante.codigoEstudiante,
      estaPago: estudiante.estaPago,
      aplicaVotacion: estudiante.aplicaVotacion ?? false,
      porcentajeBeca: this.toRatio(estudiante.porcentajeBeca),
      aplicaEgresado: estudiante.aplicaEgresado ?? false,
      valorEnSMLV: estudiante.valorEnSMLV ?? null
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
      },
      error: (_err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar estudiante.' });
        this.onRowEditCancel(estudiante, this.findIndexById(estudiante.codigoEstudiante));
        this.loadingService.hide();
      }
    });
  }

  onRowEditCancel(estudiante: EstudianteProyeccion, index: number) {
    const currentEstudiantes = this._estudiantes.value;
    if (currentEstudiantes && currentEstudiantes[index]) {
      currentEstudiantes[index] = this.clonedEstudiantes[estudiante.codigoEstudiante];
      this._estudiantes.next([...currentEstudiantes]);
    }
    delete this.clonedEstudiantes[estudiante.codigoEstudiante];
    this.editingRowKey = null;
    this._editingRowKey.next(null);
  }

  agregarFilaSimulado(): void {
    if (this.creandoSimulado || this.isAnyEditActive || !this.periodoSeleccionado?.id) return;

    this.creandoSimulado = true;
    const numero = this._estudiantes.value.filter(e => e.esSimulado).length + 1;

    this.facadeService.crearEstudianteSimulado({
      periodoAcademicoId: this.periodoSeleccionado.id,
      nombre: 'Estudiante nuevo ' + numero,
      apellido: '',
      identificacion: null
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.procesarRespuesta(data);
        this.creandoSimulado = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estudiante simulado agregado. Edítalo para completar sus datos.' });
      },
      error: (_err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo agregar el estudiante simulado.' });
        this.creandoSimulado = false;
      }
    });
  }

  private guardarEdicionSimulado(estudiante: EstudianteProyeccion): void {
    if (!estudiante.id || estudiante.id < 0) return;
    if (!estudiante.nombre || !estudiante.nombre.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El nombre del estudiante simulado es requerido.' });
      this.onRowEditCancel(estudiante, this.findIndexById(estudiante.codigoEstudiante));
      return;
    }

    this.loadingService.show(`Guardando cambios de ${estudiante.nombreEstudiante}`);
    this.editingRowKey = null;
    this._editingRowKey.next(null);

    const dto: ActualizarEstudianteSimuladoDTOPeticion = {
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      identificacion: estudiante.identificacion || null,
      estaPago: estudiante.estaPago,
      aplicaVotacion: estudiante.aplicaVotacion ?? false,
      porcentajeBeca: this.toRatio(estudiante.porcentajeBeca),
      aplicaEgresado: estudiante.aplicaEgresado ?? false,
      grupoInvestigacion: estudiante.grupoInvestigacion || null,
      valorEnSMLV: estudiante.valorEnSMLV ?? null
    };

    this.facadeService.actualizarEstudianteSimulado(estudiante.id, dto)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
          this.procesarRespuesta(data);
          delete this.clonedEstudiantes[estudiante.codigoEstudiante];
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estudiante simulado actualizado.' });
          this.loadingService.hide();
        },
        error: (_err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estudiante simulado.' });
          this.onRowEditCancel(estudiante, this.findIndexById(estudiante.codigoEstudiante));
          this.loadingService.hide();
        }
      });
  }

  confirmarEliminarSimulado(estudiante: EstudianteProyeccion): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar a ${estudiante.nombreEstudiante || 'este estudiante simulado'}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.eliminarSimulado(estudiante)
    });
  }

  private eliminarSimulado(estudiante: EstudianteProyeccion): void {
    if (!estudiante.id || estudiante.id < 0) return;
    this.loadingService.show('Eliminando estudiante simulado...');
    this.facadeService.eliminarEstudianteSimulado(estudiante.id)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
          this.procesarRespuesta(data);
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estudiante simulado eliminado.' });
          this.loadingService.hide();
        },
        error: (_err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el estudiante simulado.' });
          this.loadingService.hide();
        }
      });
  }

  findIndexById(id: string): number {
    return this._estudiantes.value.findIndex(e => e.codigoEstudiante === id);
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

  private toRatio(value: number | null | undefined): number {
    if (value == null) return 0;
    return value / 100;
  }

  private toPercent(value: number | null | undefined): number {
    if (value == null) return 0;
    const percent = value <= 1 ? value * 100 : value;
    return Math.round(percent * 100) / 100;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  descargar(): void {
    // TODO: implementar descarga de proyección reporte (pendiente integración con ExcelService)
  }
}
