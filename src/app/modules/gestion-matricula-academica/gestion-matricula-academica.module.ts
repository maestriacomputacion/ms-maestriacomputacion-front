import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestionPeriodoAcademicoComponent } from './components/gestion-periodo-academico/gestion-periodo-academico.component';
import { GestionMatriculaAcademicaRoutingModule } from './gestion-matricula-academica-routing.module';
import { PrimenNgModule } from '../primen-ng/primen-ng.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { GestionCursoComponent } from './components/gestion-curso/gestion-curso.component';
import { RegistrarCursoComponent } from './components/registrar-curso/registrar-curso.component';
import { GestionMaterialApoyoComponent } from './components/gestion-material-apoyo/gestion-material-apoyo.component';
import { MaterialApoyoService } from './services/material-apoyo.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { GenerarMatriculaPreviaComponent } from './components/generar-matricula-previa/generar-matricula-previa.component';
import { GestionEstudianteComponent } from './components/gestion-estudiante/gestion-estudiante.component';
import { GestionMatriculaCursoComponent } from './components/gestion-matricula-curso/pages/gestion-matricula-curso.component';
import { RealizarMatriculaEstudiantesComponent } from './components/gestion-matricula-curso/components/realizar-matricula-estudiantes/realizar-matricula-estudiantes.component';
import { MatriculaMasivaComponent } from './components/matricula-masiva/matricula-masiva.component';
import { ResultadoMatriculaMasivaComponent } from './components/resultado-matricula-masiva/resultado-matricula-masiva.component';
import { CursosPorAreaTabsComponent } from './components/cursos-por-area-tabs/cursos-por-area-tabs.component';
import { VistaTutorComponent } from './components/vista-tutor/vista-tutor.component';
import { AprobarMatriculaEstudianteComponent } from './components/aprobar-matricula-estudiante/aprobar-matricula-estudiante.component';
import { ListadoMatriculasComponent } from './components/listado-matriculas/listado-matriculas.component';
import { ReporteCursosOfertadosComponent } from './components/reporte-cursos-ofertados/reporte-cursos-ofertados.component';
import { ReporteCentroPostgradosComponent } from './components/reporte-centro-postgrados/reporte-centro-postgrados.component';
import { TipoNotificacionComponent } from './components/tipo-notificacion/tipo-notificacion.component';
import { EnviarCorreoMatriculaFinalComponent } from './components/enviar-correo-matricula-final/enviar-correo-matricula-final.component';
import { EnviarCorreoMatriculaFinalEstudianteComponent } from './components/enviar-correo-matricula-final-estudiante/enviar-correo-matricula-final-estudiante.component';
import { BuscadorEstudiantesAcademicoComponent } from './components/buscador-estudiantes-academico/buscador-estudiantes-academico.component';
import { ListadoTutoresComponent } from './components/listado-tutores/listado-tutores.component';
import { SugerenciasMatriculaComponent } from './components/sugerencias-matricula/sugerencias-matricula.component';

@NgModule({
    declarations: [
        GestionPeriodoAcademicoComponent,
        GestionCursoComponent,
        ReporteCursosOfertadosComponent,
        ReporteCentroPostgradosComponent,
        TipoNotificacionComponent,
        EnviarCorreoMatriculaFinalComponent,
        EnviarCorreoMatriculaFinalEstudianteComponent,
        RegistrarCursoComponent,
        GestionMaterialApoyoComponent,
        GenerarMatriculaPreviaComponent,
        GestionEstudianteComponent,
        GestionMatriculaCursoComponent,
        RealizarMatriculaEstudiantesComponent,
        MatriculaMasivaComponent,
        ResultadoMatriculaMasivaComponent,
        CursosPorAreaTabsComponent,
        VistaTutorComponent,
        AprobarMatriculaEstudianteComponent,
        ListadoMatriculasComponent,
        ListadoTutoresComponent,
        BuscadorEstudiantesAcademicoComponent,
        SugerenciasMatriculaComponent,
    ],
    imports: [
        CommonModule,
        GestionMatriculaAcademicaRoutingModule,
        PrimenNgModule,
        SharedModule,
        ReactiveFormsModule,
        FormsModule,
    ],
    providers: [MaterialApoyoService, MessageService, ConfirmationService],
    bootstrap: [],
})
export class GestionMatriculaAcademicaModule {}
