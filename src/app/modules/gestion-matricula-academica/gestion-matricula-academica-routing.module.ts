import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestionPeriodoAcademicoComponent } from './components/periodo-academico/gestion-periodo-academico/gestion-periodo-academico.component';
import { GestionCursoComponent } from './components/cursos/gestion-curso/gestion-curso.component';
import { RegistrarCursoComponent } from './components/cursos/registrar-curso/registrar-curso.component';
import { GestionMaterialApoyoComponent } from './components/material-apoyo/gestion-material-apoyo/gestion-material-apoyo.component';
import { GenerarMatriculaPreviaComponent } from './components/matricula/generar-matricula-previa/generar-matricula-previa.component';
import { GestionEstudianteComponent } from './components/estudiantes/gestion-estudiante/gestion-estudiante.component';
import { GestionMatriculaCursoComponent } from './components/matricula/gestion-matricula-curso/pages/gestion-matricula-curso.component';
import { RealizarMatriculaEstudiantesComponent } from './components/matricula/gestion-matricula-curso/components/realizar-matricula-estudiantes/realizar-matricula-estudiantes.component';
import { CancelarMatriculaEstudiantesComponent } from './components/matricula/gestion-matricula-curso/components/cancelar-matricula-estudiantes/cancelar-matricula-estudiantes.component';
import { MatriculaMasivaComponent } from './components/matricula/matricula-masiva/matricula-masiva.component';
import { ResultadoMatriculaMasivaComponent } from './components/matricula/resultado-matricula-masiva/resultado-matricula-masiva.component';
import { AprobarMatriculaEstudianteComponent } from './components/matricula/aprobar-matricula-estudiante/aprobar-matricula-estudiante.component';
import { ListadoMatriculasComponent } from './components/matricula/listado-matriculas/listado-matriculas.component';
import { ReporteCursosOfertadosComponent } from './components/reportes/reporte-cursos-ofertados/reporte-cursos-ofertados.component';
import { ReporteCentroPostgradosComponent } from './components/reportes/reporte-centro-postgrados/reporte-centro-postgrados.component';
import { TipoNotificacionComponent } from './components/notificaciones/tipo-notificacion/tipo-notificacion.component';
import { EnviarCorreoMatriculaFinalComponent } from './components/notificaciones/enviar-correo-matricula-final/enviar-correo-matricula-final.component';
import { EnviarCorreoMatriculaFinalEstudianteComponent } from './components/notificaciones/enviar-correo-matricula-final-estudiante/enviar-correo-matricula-final-estudiante.component';
import { ListadoTutoresComponent } from './components/tutores/listado-tutores/listado-tutores.component';
import { EstudiantesPorTutorComponent } from './components/tutores/estudiantes-por-tutor/estudiantes-por-tutor.component';
import { DetalleEstudianteTutorComponent } from './components/tutores/detalle-estudiante-tutor/detalle-estudiante-tutor.component';
import { RoleGuard } from '../gestion-autenticacion/guards/role.guard';

const routes: Routes = [
    {
        path: '',
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
                path: 'cancelar-matricula-curso/:id',
                component: CancelarMatriculaEstudiantesComponent,
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
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },
            },
            {
                path: 'estudiantes-por-tutor',
                component: EstudiantesPorTutorComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_DOCENTE'] },
            },
            {
                path: 'estudiantes-por-tutor/:tutorId',
                component: EstudiantesPorTutorComponent,
            },
            {
                path: 'detalle-estudiante-tutor/:tutorId/:estudianteId',
                component: DetalleEstudianteTutorComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GestionMatriculaAcademicaRoutingModule {}
