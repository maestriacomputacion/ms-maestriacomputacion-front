import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestionInformacionPresupuestariaRoutingModule } from './gestion-informacion-presupuestaria-routing.module';
import { ReporteFinalComponent } from './pages/reporte-final/reporte-final.component';
import { ProyeccionReporteComponent } from './pages/proyeccion-reporte/proyeccion-reporte.component';
import { ReportePorGruposComponent } from './pages/reporte-por-grupos/reporte-por-grupos.component';

@NgModule({
    declarations: [
    ReporteFinalComponent,
    ProyeccionReporteComponent,
    ReportePorGruposComponent
  ],
    imports: [
        CommonModule,
        GestionInformacionPresupuestariaRoutingModule
    ]
})
export class GestionInformacionPresupuestariaModule { }
