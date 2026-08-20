import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatriculaFinancieraComponent } from './feature/matricula-financiera/matricula-financiera.component';
import { DetalleEstudianteComponent } from './feature/detalle-estudiante/detalle-estudiante.component';
import { ResumenMatriculaEstudianteComponent } from './feature/resumen-matricula-estudiante/resumen-matricula-estudiante.component';

import { RoleGuard } from '../gestion-autenticacion/guards/role.guard';

const routes: Routes = [
    {
        path: '',
        component: MatriculaFinancieraComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: ['ROLE_COORDINADOR'] }
    },
    {
        path: 'detalle/:id',
        component: DetalleEstudianteComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: ['ROLE_COORDINADOR'] }
    },
    {
        path: 'resumen',
        component: ResumenMatriculaEstudianteComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: ['ROLE_ESTUDIANTE'] }
    },
    {
        path: 'resumen/:id',
        component: ResumenMatriculaEstudianteComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: ['ROLE_ESTUDIANTE'] }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GestionMatriculaFinancieraRoutingModule { }
