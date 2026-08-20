import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ConfiguracionReporteFinanciero } from '../../models/domain-models';

@Component({
  selector: 'app-configuracion-proyeccion-card',
  templateUrl: './configuracion-proyeccion-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfiguracionProyeccionCardComponent {

  @Input() configuracion: ConfiguracionReporteFinanciero | null = null;
  @Input() isEditable: boolean = false;
  @Input() disabled: boolean = false;

  @Output() save = new EventEmitter<Partial<ConfiguracionReporteFinanciero>>();

  editando: boolean = false;
  clonedConfig: Partial<ConfiguracionReporteFinanciero> = {};

  onEditInit(): void {
    if (!this.configuracion || this.disabled) return;
    this.editando = true;
    this.clonedConfig = { ...this.configuracion };
  }

  onSave(): void {
    this.editando = false;
    this.save.emit(this.clonedConfig);
    this.clonedConfig = {};
  }

  onCancel(): void {
    this.editando = false;
    this.clonedConfig = {};
  }
}
