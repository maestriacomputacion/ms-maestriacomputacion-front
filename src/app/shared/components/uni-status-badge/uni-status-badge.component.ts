import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-uni-status-badge',
  template: `
    <span class="estado-badge" [ngClass]="'estado-badge--' + severity">
      {{ label }}
    </span>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniStatusBadgeComponent {
  /** Estado de pago: true (Pagado), false (No Pago), null (Pendiente) */
  @Input() status: boolean | undefined | null = null;

  /** Texto personalizado si no se quiere usar el de pago por defecto */
  @Input() labelOverride: string | null = null;

  get label(): string {
    if (this.labelOverride) return this.labelOverride;
    if (this.status === true)  return 'PAGADO';
    if (this.status === false) return 'NO PAGADO';
    return 'PENDIENTE';
  }

  get severity(): string {
    if (this.status === true)  return 'success';
    if (this.status === false) return 'danger';
    return 'warning';
  }
}
