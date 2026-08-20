import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EstadoMatricula } from '../../models/domain-models';

@Component({
  selector: 'app-matricula-status-badge',
  templateUrl: './matricula-status-badge.component.html',
  styleUrls: ['./matricula-status-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatriculaStatusBadgeComponent {
  @Input() estado!: EstadoMatricula;
  @Input() mostrarIcono = true;

  readonly iconosPorEstado: Record<EstadoMatricula, string> = {
    PENDIENTE:  '⏳',
    AL_DIA:     '✅',
    MORA:       '⚠️',
    EXONERADO:  '🎓',
    BECADO:     '🏅',
    ANULADO:    '❌',
  };

  get icono(): string {
    return this.iconosPorEstado[this.estado] ?? '';
  }
}
