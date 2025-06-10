import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestionPeriodoAcademicoComponent } from './components/gestion-periodo-academico/gestion-periodo-academico.component';
import { GestionCursoComponent } from './components/gestion-curso/gestion-curso.component';

const routes: Routes = [{
    path:'',
    // component:GestionPeriodoAcademicoComponent,
    children: [
        {
            path: 'periodo-academico',
            component: GestionPeriodoAcademicoComponent
        },
        {
            path: 'gestion-cursos',
            component: GestionCursoComponent
        }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GestionMatriculaAcademicaRoutingModule {}
