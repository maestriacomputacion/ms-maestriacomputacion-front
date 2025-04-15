import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BandejaEvaluacionDocenteComponent } from './components/bandeja-evaluacion-docente/bandeja-evaluacion-docente.component';
import { PrincipalGestionEvaluacionComponent } from './pages/principal-gestion-evaluacion/principal-gestion-evaluacion.component';
import { AgregarEvaluacionComponent } from './components/agregar-evaluacion/agregar-evaluacion.component';
import { EstadisticaEvaluacionComponent } from './components/estadistica-evaluacion/estadistica-evaluacion.component';

const routes: Routes = [
    {
        path: '',
        component: PrincipalGestionEvaluacionComponent,
        children: [
            {
                path: '',
                component: BandejaEvaluacionDocenteComponent,
            },
            {
                path: 'agregar-evaluacion',
                component: AgregarEvaluacionComponent,
            },
            {
                path: 'estadistica/:id',
                component: EstadisticaEvaluacionComponent
            }
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GestionEvaluacionRoutingModule {}
