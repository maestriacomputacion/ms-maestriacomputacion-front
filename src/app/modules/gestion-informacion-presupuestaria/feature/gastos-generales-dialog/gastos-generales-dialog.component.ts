import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
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
export class GastosGeneralesDialogComponent implements OnInit, OnDestroy, OnChanges {
  private destroy$ = new Subject<void>();

  @Input() display: boolean = false;
  @Input() gastos: GastoGeneral[] = [];
  @Input() idConfiguracionReporteGrupos: number | null = null;
  @Input() periodoAcademicoId: number | null = null;
  @Input() readonly: boolean = false;
  @Output() displayChange = new EventEmitter<boolean>();
  @Output() onCambio = new EventEmitter<void>();

  gastosEditables: GastoGeneral[] = [];
  editingGastoKey: number | null = null;
  clonedGasto: { [id: number]: GastoGeneral } = {};
  nuevoGasto: GastoGeneral | null = null;
  guardandoGastos: boolean = false;

  constructor(
    private facadeService: GestionInformacionPresupuestariaFacadeService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['display']?.currentValue === true) {
      this.prepararGastos();
    } else if (changes['gastos'] && this.display) {
      this.prepararGastos();
      this.cdr.markForCheck();
    }
  }

  prepararGastos() {
    this.gastosEditables = this.gastos ? [...this.gastos] : [];
    this.editingGastoKey = null;
    this.clonedGasto = {};
    this.nuevoGasto = null;
    this.guardandoGastos = false;
  }

  cerrar() {
    this.editingGastoKey = null;
    this.clonedGasto = {};
    this.nuevoGasto = null;
    this.guardandoGastos = false;
    this.displayChange.emit(false);
  }

  agregarNuevaFilaGasto() {
    if (this.nuevoGasto !== null || this.editingGastoKey !== null) return;

    this.nuevoGasto = {
      idGastoGeneral: -1,
      categoria: '',
      descripcion: '',
      monto: 0
    };
    this.gastosEditables.push(this.nuevoGasto);

    setTimeout(() => {
      const element = document.getElementById('nuevo-gasto-row');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  }

  guardarNuevoGasto() {
    if (!this.nuevoGasto) return;

    if (this.idConfiguracionReporteGrupos == null) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'No se puede crear el gasto: el ID de configuración no está disponible. Recarga la página.' });
      return;
    }
    if (this.periodoAcademicoId == null) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'No se puede crear el gasto: el período académico no está disponible. Recarga la página.' });
      return;
    }
    if (!this.nuevoGasto.categoria || !this.nuevoGasto.descripcion || this.nuevoGasto.monto <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Todos los campos son requeridos y el monto debe ser mayor a 0' });
      return;
    }

    this.guardandoGastos = true;

    const gastoDTO: GastoGeneralDTOPeticion = {
      idConfiguracionReporteGrupos: this.idConfiguracionReporteGrupos!,
      categoria: this.nuevoGasto.categoria,
      descripcion: this.nuevoGasto.descripcion,
      monto: this.nuevoGasto.monto
    };

    this.facadeService.crearGastoGeneral(this.periodoAcademicoId!, gastoDTO).pipe(takeUntil(this.destroy$)).subscribe({
      next: (reporteCompleto) => {
        this.gastosEditables = [...reporteCompleto.objConfiguracionReporteGrupos.gastosGenerales];
        this.nuevoGasto = null;
        this.guardandoGastos = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Gasto creado correctamente' });
        this.cdr.markForCheck();
        this.onCambio.emit();
      },
      error: (err) => {
        console.error('Error al crear gasto general', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el gasto' });
        this.guardandoGastos = false;
        this.cdr.markForCheck();
      }
    });
  }

  cancelarNuevoGasto() {
    if (!this.nuevoGasto) return;
    const index = this.gastosEditables.findIndex(g => g.idGastoGeneral === -1);
    if (index !== -1) {
      this.gastosEditables.splice(index, 1);
    }
    this.nuevoGasto = null;
  }

  onGastoEditInit(gasto: GastoGeneral) {
    if (this.editingGastoKey !== null || this.nuevoGasto !== null) return;
    this.editingGastoKey = gasto.idGastoGeneral;
    this.clonedGasto[gasto.idGastoGeneral] = { ...gasto };
  }

  onGastoEditSave(gasto: GastoGeneral) {
    if (!gasto.categoria || !gasto.descripcion || gasto.monto <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Todos los campos son requeridos y el monto debe ser mayor a 0' });
      return;
    }

    this.guardandoGastos = true;

    const gastoDTO = {
      idGastoGeneral: gasto.idGastoGeneral,
      periodoAcademicoId: this.periodoAcademicoId!,
      categoria: gasto.categoria,
      descripcion: gasto.descripcion,
      monto: gasto.monto
    };

    this.facadeService.actualizarGastoGeneral(gastoDTO).pipe(takeUntil(this.destroy$)).subscribe({
      next: (reporteCompleto) => {
        this.gastosEditables = [...reporteCompleto.objConfiguracionReporteGrupos.gastosGenerales];
        delete this.clonedGasto[gasto.idGastoGeneral];
        this.editingGastoKey = null;
        this.guardandoGastos = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Gasto actualizado correctamente' });
        this.cdr.markForCheck();
        this.onCambio.emit();
      },
      error: (err) => {
        console.error('Error al actualizar gasto general', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el gasto' });
        this.onGastoEditCancel(gasto);
        this.guardandoGastos = false;
        this.cdr.markForCheck();
      }
    });
  }

  onGastoEditCancel(gasto: GastoGeneral) {
    if (this.clonedGasto[gasto.idGastoGeneral]) {
      const index = this.gastosEditables.findIndex(g => g.idGastoGeneral === gasto.idGastoGeneral);
      if (index !== -1) {
        this.gastosEditables[index] = { ...this.clonedGasto[gasto.idGastoGeneral] };
      }
      delete this.clonedGasto[gasto.idGastoGeneral];
    }
    this.editingGastoKey = null;
  }

  confirmarEliminarGasto(gasto: GastoGeneral) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar este gasto?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.eliminarGasto(gasto);
      }
    });
  }

  eliminarGasto(gasto: GastoGeneral) {
    this.guardandoGastos = true;
    this.facadeService.eliminarGastoGeneral(gasto.idGastoGeneral, this.periodoAcademicoId!).pipe(takeUntil(this.destroy$)).subscribe({
      next: (reporteCompleto) => {
        this.gastosEditables = [...reporteCompleto.objConfiguracionReporteGrupos.gastosGenerales];
        this.editingGastoKey = null;
        delete this.clonedGasto[gasto.idGastoGeneral];
        this.guardandoGastos = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Gasto eliminado correctamente' });
        this.cdr.markForCheck();
        this.onCambio.emit();
      },
      error: (err) => {
        console.error('Error al eliminar gasto general', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el gasto' });
        this.guardandoGastos = false;
        this.cdr.markForCheck();
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }
}
