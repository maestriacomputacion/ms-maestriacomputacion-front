import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestionPeriodoAcademicoComponent } from './components/gestion-periodo-academico/gestion-periodo-academico.component';
import { GestionCursoComponent } from './components/gestion-curso/gestion-curso.component';
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
import { ReporteCursosOfertadosComponent } from './components/reporte-cursos-ofertados/reporte-cursos-ofertados.component';
import { ReporteCentroPostgradosComponent } from './components/reporte-centro-postgrados/reporte-centro-postgrados.component';
import { TipoNotificacionComponent } from './components/tipo-notificacion/tipo-notificacion.component';
import { EnviarCorreoMatriculaFinalComponent } from './components/enviar-correo-matricula-final/enviar-correo-matricula-final.component';
import { EnviarCorreoMatriculaFinalEstudianteComponent } from './components/enviar-correo-matricula-final-estudiante/enviar-correo-matricula-final-estudiante.component';
import { ListadoTutoresComponent } from './components/listado-tutores/listado-tutores.component';
import { SugerenciasMatriculaComponent } from './components/sugerencias-matricula/sugerencias-matricula.component';
import { RoleGuard } from '../gestion-autenticacion/guards/role.guard';

const routes: Routes = [
    {
        path: '',
        // component:GestionPeriodoAcademicoComponent,
        children: [
            {
                path: 'periodo-academico',
                component: GestionPeriodoAcademicoComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },  
            },
            {
                path: 'gestion-cursos',
                component: GestionCursoComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },  
            },
            {
                path: 'reporte-cursos-ofertados',
                component: ReporteCursosOfertadosComponent,
            },
            {
                path: 'reporte-centro-postgrados',
                component: ReporteCentroPostgradosComponent,
            },
            {
                path: 'notificacion-estudiate',
                component: TipoNotificacionComponent,
            },
            {
                path: 'enviar-correo-matricula-final',
                component: EnviarCorreoMatriculaFinalComponent,
            },
            {
                path: 'enviar-correo-matricula-final-estudiante',
                component: EnviarCorreoMatriculaFinalEstudianteComponent,
            },
            {
                path: 'registrar-curso',
                component: RegistrarCursoComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },  
            },
            {
                path: 'editar-curso/:id',
                component: RegistrarCursoComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },  
            },
            {
                path: 'ver-curso/:id',
                component: RegistrarCursoComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },  
            },
            {
                path: 'material-apoyo',
                component: GestionMaterialApoyoComponent,
            },
            {
                path: 'generar-matricula-previa/:id',
                component: GenerarMatriculaPreviaComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },  
            },
            {
                path: 'gestion-estudiantes',
                component: GestionEstudianteComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },  
            },
            {
                path: 'gestion-matricula-curso',
                component: GestionMatriculaCursoComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },  
            },
            {
                path: 'realizar-matricula-curso/:id',
                component: RealizarMatriculaEstudiantesComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },  
            },
            {
                path: 'matricula-masiva',
                component: MatriculaMasivaComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },  
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
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },  
            },
            {
                path: 'listado-tutores',
                component: ListadoTutoresComponent,
            },
            {
                path: 'sugerencias-matricula',
                component: SugerenciasMatriculaComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GestionMatriculaAcademicaRoutingModule {}
