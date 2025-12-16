import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestionPeriodoAcademicoComponent } from './components/gestion-periodo-academico/gestion-periodo-academico.component';
import { GestionCursoComponent } from './components/gestion-curso/gestion-curso.component';
import { GenerarCursosOfertadosComponent } from './components/generar-cursos-ofertados/generar-cursos-ofertados.component';
import { RegistrarCursoComponent } from './components/registrar-curso/registrar-curso.component';
import { GestionMaterialApoyoComponent } from './components/gestion-material-apoyo/gestion-material-apoyo.component';
import { GenerarMatriculaPreviaComponent } from './components/generar-matricula-previa/generar-matricula-previa.component';
import { GestionEstudianteComponent } from './components/gestion-estudiante/gestion-estudiante.component';
import { GestionMatriculaCursoComponent } from './components/gestion-matricula-curso/pages/gestion-matricula-curso.component';
import { RealizarMatriculaEstudiantesComponent } from './components/gestion-matricula-curso/components/realizar-matricula-estudiantes/realizar-matricula-estudiantes.component';
import { MatriculaMasivaComponent } from './components/matricula-masiva/matricula-masiva.component';
import { ResultadoMatriculaMasivaComponent } from './components/resultado-matricula-masiva/resultado-matricula-masiva.component';
import { VistaTutorComponent } from './components/vista-tutor/vista-tutor.component';
import { AprobarMatriculaEstudianteComponent } from './components/aprobar-matricula-estudiante/aprobar-matricula-estudiante.component';
import { ListadoMatriculasComponent } from './components/listado-matriculas/listado-matriculas.component';

const routes: Routes = [
    {
        path: '',
        // component:GestionPeriodoAcademicoComponent,
        children: [
            {
                path: 'periodo-academico',
                component: GestionPeriodoAcademicoComponent,
            },
            {
                path: 'gestion-cursos',
                component: GestionCursoComponent,
            },
            {
                path: 'generar-cursos-ofertados',
                component: GenerarCursosOfertadosComponent,
            },
            {
                path: 'registrar-curso',
                component: RegistrarCursoComponent,
            },
            {
                path: 'editar-curso/:id',
                component: RegistrarCursoComponent,
            },
            {
                path: 'ver-curso/:id',
                component: RegistrarCursoComponent,
            },
            {
                path: 'material-apoyo',
                component: GestionMaterialApoyoComponent,
            },
            {
                path: 'generar-matricula-previa/:id',
                component: GenerarMatriculaPreviaComponent,
            },
            {
                path: 'gestion-estudiantes',
                component: GestionEstudianteComponent,
            },
            {
                path: 'gestion-matricula-curso',
                component: GestionMatriculaCursoComponent,
            },
            {
                path: 'realizar-matricula-curso/:id',
                component: RealizarMatriculaEstudiantesComponent,
            },
            {
                path: 'matricula-masiva',
                component: MatriculaMasivaComponent,
            },
            {
                path: 'resultado-matricula-masiva',
                component: ResultadoMatriculaMasivaComponent,
            },
            {
                path: 'vista-tutor',
                component: VistaTutorComponent,
            },
            {
                path: 'aprobar-matricula-estudiante/:id',
                component: AprobarMatriculaEstudianteComponent,
            },
            {
                path: 'listado-matriculas',
                component: ListadoMatriculasComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GestionMatriculaAcademicaRoutingModule {}
