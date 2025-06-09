import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestionPeriodoAcademicoComponent } from './components/gestion-periodo-academico/gestion-periodo-academico.component';

const routes: Routes = [{
    path:'',
    // component:GestionPeriodoAcademicoComponent,
    children: [
        {
            path: 'periodo-academico',
            component: GestionPeriodoAcademicoComponent
        }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GestionMatriculaAcademicaRoutingModule {}
