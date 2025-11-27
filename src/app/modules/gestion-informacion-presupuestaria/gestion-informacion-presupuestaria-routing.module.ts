import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReporteFinalComponent } from './pages/reporte-final/reporte-final.component';
import { ProyeccionReporteComponent } from './pages/proyeccion-reporte/proyeccion-reporte.component';
import { ReportePorGruposComponent } from './pages/reporte-por-grupos/reporte-por-grupos.component';

const routes: Routes = [
    { path: '', redirectTo: 'reporte-final', pathMatch: 'full' },
    { path: 'reporte-final', component: ReporteFinalComponent },
    { path: 'proyeccion-reporte', component: ProyeccionReporteComponent },
    { path: 'reporte-por-grupos', component: ReportePorGruposComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GestionInformacionPresupuestariaRoutingModule { }
