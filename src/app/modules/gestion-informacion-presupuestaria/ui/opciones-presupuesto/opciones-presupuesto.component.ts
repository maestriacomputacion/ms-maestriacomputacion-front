import { ChangeDetectionStrategy, Component, Input, OnInit, OnChanges, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { PeriodoFinancieroDTORespuesta } from '../../dto/periodo-financiero.dto';

interface TabOption {
  label: string;
  value: string;
  route: string;
}

interface SelectChangeEvent {
  value: string;
}

@Component({
  selector: 'app-opciones-presupuesto',
  templateUrl: './opciones-presupuesto.component.html',
  styleUrls: ['./opciones-presupuesto.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpcionesPresupuestoComponent implements OnInit, OnChanges {

  @Input() activeTab: string = 'reporte-final';
  @Input() currentPeriod: PeriodoFinancieroDTORespuesta | null = null;
  @Output() onDescargar = new EventEmitter<void>();
  @Output() onProyectarPresupuesto = new EventEmitter<void>();

  displayDescargarModal: boolean = false;

  selectedTab: string = 'reporte-final';

  tabOptions: TabOption[] = [
    { label: 'Reporte Final', value: 'reporte-final', route: '/informacion-presupuestaria/reporte-final' },
    { label: 'Proyección Reporte', value: 'proyeccion-reporte', route: '/informacion-presupuestaria/proyeccion-reporte' },
    { label: 'Reporte Por Grupos', value: 'reporte-por-grupos', route: '/informacion-presupuestaria/reporte-por-grupos' }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.selectedTab = this.activeTab;
  }

  ngOnChanges(): void {
    this.selectedTab = this.activeTab;
  }

  onTabChange(event: SelectChangeEvent): void {
    const selectedOption = this.tabOptions.find(tab => tab.value === event.value);
    if (selectedOption?.route) {
      this.router.navigate([selectedOption.route]);
    }
  }

  descargar(): void {
    this.displayDescargarModal = true;
    this.onDescargar.emit();
  }

  proyectarPresupuesto(): void {
    this.onProyectarPresupuesto.emit();
  }

  trackByTabOption(index: number, tab: TabOption): string {
    return tab.value;
  }
}
