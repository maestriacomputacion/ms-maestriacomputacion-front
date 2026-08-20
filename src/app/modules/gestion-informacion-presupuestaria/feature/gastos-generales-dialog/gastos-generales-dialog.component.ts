import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GastoGeneral } from '../../models/domain-models';
import { GastoGeneralDTOPeticion } from '../../dto/gasto-general.dto';
import { GestionInformacionPresupuestariaFacadeService } from '../../data/facade.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-gastos-generales-dialog',
  templateUrl: './gastos-generales-dialog.component.html',
  styleUrls: ['./gastos-generales-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GastosGeneralesDialogComponent implements OnDestroy, OnChanges {
  private readonly destroy$ = new Subject<void>();

  @Input() display: boolean = false;
  @Input() gastos: readonly GastoGeneral[] = [];
  @Input() idConfiguracionReporteGrupos: number | null = null;
  @Input() periodoAcademicoId: number | null = null;
  @Input() readonly: boolean = false;
  
  @Output() displayChange = new EventEmitter<boolean>();
  @Output() onCambio = new EventEmitter<void>();

  gastosEditables: GastoGeneral[] = [];
  editingGastoKey: number | null = null;
  clonedGasto: Record<number, GastoGeneral> = {};
  nuevoGasto: GastoGeneral | null = null;
  guardandoGastos: boolean = false;

  constructor(
    private readonly facadeService: GestionInformacionPresupuestariaFacadeService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['display']?.currentValue || (changes['gastos'] && this.display)) {
      this.prepararGastos();
      this.cdr.markForCheck();
    }
  }

  private prepararGastos(): void {
    this.gastosEditables = this.gastos ? [...this.gastos] : [];
    this.editingGastoKey = null;
    this.clonedGasto = {};
    this.nuevoGasto = null;
    this.guardandoGastos = false;
  }

  cerrar(): void {
    this.prepararGastos();
    this.displayChange.emit(false);
  }

  agregarNuevaFilaGasto(): void {
    if (this.nuevoGasto !== null || this.editingGastoKey !== null) return;

    this.nuevoGasto = { idGastoGeneral: -1, categoria: '', descripcion: '', monto: 0 };
    this.gastosEditables = [...this.gastosEditables, this.nuevoGasto];

    setTimeout(() => {
      document.getElementById('nuevo-gasto-row')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }

  guardarNuevoGasto(): void {
    if (!this.nuevoGasto || this.idConfiguracionReporteGrupos == null || this.periodoAcademicoId == null) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Faltan parámetros requeridos para crear el gasto.' });
      return;
    }

    if (!this.nuevoGasto.categoria || !this.nuevoGasto.descripcion || this.nuevoGasto.monto <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Todos los campos son requeridos y el monto debe ser mayor a 0.' });
      return;
    }

    this.guardandoGastos = true;
    const gastoDTO: GastoGeneralDTOPeticion = {
      idConfiguracionReporteGrupos: this.idConfiguracionReporteGrupos,
      categoria: this.nuevoGasto.categoria,
      descripcion: this.nuevoGasto.descripcion,
      monto: this.nuevoGasto.monto
    };

    this.facadeService.crearGastoGeneral(this.periodoAcademicoId, gastoDTO)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reporteCompleto) => {
          this.gastosEditables = [...reporteCompleto.objConfiguracionReporteGrupos.gastosGenerales];
          this.nuevoGasto = null;
          this.guardandoGastos = false;
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Gasto creado correctamente.' });
          this.onCambio.emit();
          this.cdr.markForCheck();
        },
        error: () => this.manejarError('No se pudo crear el gasto')
      });
  }

  cancelarNuevoGasto(): void {
    this.gastosEditables = this.gastosEditables.filter(g => g.idGastoGeneral !== -1);
    this.nuevoGasto = null;
  }

  onGastoEditInit(gasto: GastoGeneral): void {
    if (this.editingGastoKey !== null || this.nuevoGasto !== null) return;
    this.editingGastoKey = gasto.idGastoGeneral;
    this.clonedGasto[gasto.idGastoGeneral] = { ...gasto };
  }

  onGastoEditSave(gasto: GastoGeneral): void {
    if (!gasto.categoria || !gasto.descripcion || gasto.monto <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Campos inválidos.' });
      return;
    }

    this.guardandoGastos = true;
    const gastoDTO = { ...gasto, periodoAcademicoId: this.periodoAcademicoId! };

    this.facadeService.actualizarGastoGeneral(gastoDTO)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reporteCompleto) => {
          this.gastosEditables = [...reporteCompleto.objConfiguracionReporteGrupos.gastosGenerales];
          delete this.clonedGasto[gasto.idGastoGeneral];
          this.editingGastoKey = null;
          this.guardandoGastos = false;
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Gasto actualizado.' });
          this.onCambio.emit();
          this.cdr.markForCheck();
        },
        error: () => {
          this.onGastoEditCancel(gasto);
          this.manejarError('No se pudo actualizar el gasto');
        }
      });
  }

  onGastoEditCancel(gasto: GastoGeneral): void {
    if (this.clonedGasto[gasto.idGastoGeneral]) {
      this.gastosEditables = this.gastosEditables.map(g => 
        g.idGastoGeneral === gasto.idGastoGeneral ? { ...this.clonedGasto[gasto.idGastoGeneral] } : g
      );
      delete this.clonedGasto[gasto.idGastoGeneral];
    }
    this.editingGastoKey = null;
  }

  confirmarEliminarGasto(gasto: GastoGeneral): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar este gasto?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.eliminarGasto(gasto)
    });
  }

  private eliminarGasto(gasto: GastoGeneral): void {
    this.guardandoGastos = true;
    this.facadeService.eliminarGastoGeneral(gasto.idGastoGeneral, this.periodoAcademicoId!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reporteCompleto) => {
          this.gastosEditables = [...reporteCompleto.objConfiguracionReporteGrupos.gastosGenerales];
          this.editingGastoKey = null;
          delete this.clonedGasto[gasto.idGastoGeneral];
          this.guardandoGastos = false;
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Gasto eliminado.' });
          this.onCambio.emit();
          this.cdr.markForCheck();
        },
        error: () => this.manejarError('No se pudo eliminar el gasto')
      });
  }

  private manejarError(mensaje: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: mensaje });
    this.guardandoGastos = false;
    this.cdr.markForCheck();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
  }

  trackByGasto(index: number, gasto: GastoGeneral): number {
    return gasto.idGastoGeneral;
  }
}
