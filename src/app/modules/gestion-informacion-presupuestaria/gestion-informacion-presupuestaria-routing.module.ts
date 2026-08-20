import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReporteFinalComponent } from './feature/reporte-final/reporte-final.component';
import { ProyeccionReporteComponent } from './feature/proyeccion-reporte/proyeccion-reporte.component';
import { ReportePorGruposComponent } from './feature/reporte-por-grupos/reporte-por-grupos.component';

import { RoleGuard } from '../gestion-autenticacion/guards/role.guard';

const routes: Routes = [
    { path: '', redirectTo: 'reporte-final', pathMatch: 'full' },
    {
        path: 'reporte-final',
        component: ReporteFinalComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: ['ROLE_COORDINADOR'] }
    },
    {
        path: 'proyeccion-reporte',
        component: ProyeccionReporteComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: ['ROLE_COORDINADOR'] }
    },
    {
        path: 'reporte-por-grupos',
        component: ReportePorGruposComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: ['ROLE_COORDINADOR'] }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GestionInformacionPresupuestariaRoutingModule { }
