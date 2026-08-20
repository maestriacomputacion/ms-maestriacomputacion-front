import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PeriodoFinancieroDTORespuesta } from '../../dto/periodo-financiero.dto';

@Component({
  selector: 'app-proyectar-presupuesto-dialog',
  templateUrl: './proyectar-presupuesto-dialog.component.html',
  styleUrls: ['./proyectar-presupuesto-dialog.component.scss'],
  providers: [MessageService],
})
export class ProyectarPresupuestoDialogComponent implements OnChanges {

  @Input() visible = false;
  @Input() ultimoPeriodo: PeriodoFinancieroDTORespuesta | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onProyectar = new EventEmitter<{ fechaInicio: string; fechaFin: string; cantidadEstudiantesNuevos: number }>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      fechaInicio: [null, Validators.required],
      fechaFin: [null, Validators.required],
      cantidadEstudiantesNuevos: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.form.reset({ cantidadEstudiantesNuevos: 0 });
    }
  }

  get tagPeriodoPreview(): number {
    return this.ultimoPeriodo?.tagPeriodo === 1 ? 2 : 1;
  }

  get fechaFinInvalida(): boolean {
    const inicio = this.form.get('fechaInicio')?.value;
    const fin = this.form.get('fechaFin')?.value;
    if (!inicio || !fin) return false;
    return new Date(fin) < new Date(inicio);
  }

  cancelar(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  proyectar(): void {
    if (this.form.invalid || this.fechaFinInvalida) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    this.onProyectar.emit({
      fechaInicio: this.formatDate(v.fechaInicio),
      fechaFin: this.formatDate(v.fechaFin),
      cantidadEstudiantesNuevos: v.cantidadEstudiantesNuevos ?? 0,
    });
    this.cancelar();
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }
}
