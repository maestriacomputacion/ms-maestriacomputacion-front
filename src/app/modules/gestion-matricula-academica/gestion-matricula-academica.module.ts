import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestionPeriodoAcademicoComponent } from './components/periodo-academico/gestion-periodo-academico/gestion-periodo-academico.component';
import { GestionMatriculaAcademicaRoutingModule } from './gestion-matricula-academica-routing.module';
import { PrimenNgModule } from '../primen-ng/primen-ng.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { GestionCursoComponent } from './components/cursos/gestion-curso/gestion-curso.component';
import { RegistrarCursoComponent } from './components/cursos/registrar-curso/registrar-curso.component';
import { GestionMaterialApoyoComponent } from './components/material-apoyo/gestion-material-apoyo/gestion-material-apoyo.component';
import { MaterialApoyoService } from './services/material-apoyo.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { GenerarMatriculaPreviaComponent } from './components/matricula/generar-matricula-previa/generar-matricula-previa.component';
import { GestionEstudianteComponent } from './components/estudiantes/gestion-estudiante/gestion-estudiante.component';
import { GestionMatriculaCursoComponent } from './components/matricula/gestion-matricula-curso/pages/gestion-matricula-curso.component';
import { RealizarMatriculaEstudiantesComponent } from './components/matricula/gestion-matricula-curso/components/realizar-matricula-estudiantes/realizar-matricula-estudiantes.component';
import { CancelarMatriculaEstudiantesComponent } from './components/matricula/gestion-matricula-curso/components/cancelar-matricula-estudiantes/cancelar-matricula-estudiantes.component';
import { CursoInfoCardComponent } from './components/matricula/gestion-matricula-curso/components/curso-info-card/curso-info-card.component';
import { MatriculaMasivaComponent } from './components/matricula/matricula-masiva/matricula-masiva.component';
import { ResultadoMatriculaMasivaComponent } from './components/matricula/resultado-matricula-masiva/resultado-matricula-masiva.component';
import { CursosPorAreaTabsComponent } from './components/matricula/cursos-por-area-tabs/cursos-por-area-tabs.component';
import { AprobarMatriculaEstudianteComponent } from './components/matricula/aprobar-matricula-estudiante/aprobar-matricula-estudiante.component';
import { ListadoMatriculasComponent } from './components/matricula/listado-matriculas/listado-matriculas.component';
import { ReporteCursosOfertadosComponent } from './components/reportes/reporte-cursos-ofertados/reporte-cursos-ofertados.component';
import { ReporteCentroPostgradosComponent } from './components/reportes/reporte-centro-postgrados/reporte-centro-postgrados.component';
import { TipoNotificacionComponent } from './components/notificaciones/tipo-notificacion/tipo-notificacion.component';
import { EnviarCorreoMatriculaFinalComponent } from './components/notificaciones/enviar-correo-matricula-final/enviar-correo-matricula-final.component';
import { EnviarCorreoMatriculaFinalEstudianteComponent } from './components/notificaciones/enviar-correo-matricula-final-estudiante/enviar-correo-matricula-final-estudiante.component';
import { BuscadorEstudiantesAcademicoComponent } from './components/estudiantes/buscador-estudiantes-academico/buscador-estudiantes-academico.component';
import { ListadoTutoresComponent } from './components/tutores/listado-tutores/listado-tutores.component';
import { EstudiantesPorTutorComponent } from './components/tutores/estudiantes-por-tutor/estudiantes-por-tutor.component';
import { DetalleEstudianteTutorComponent } from './components/tutores/detalle-estudiante-tutor/detalle-estudiante-tutor.component';
import { PeriodoSelectorComponent } from './shared/periodo-selector/periodo-selector.component';
import { MultiSelectChipsComponent } from './shared/multi-select-chips/multi-select-chips.component';

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
        CancelarMatriculaEstudiantesComponent,
        CursoInfoCardComponent,
        MatriculaMasivaComponent,
        ResultadoMatriculaMasivaComponent,
        CursosPorAreaTabsComponent,
        AprobarMatriculaEstudianteComponent,
        ListadoMatriculasComponent,
        ListadoTutoresComponent,
        BuscadorEstudiantesAcademicoComponent,
        EstudiantesPorTutorComponent,
        DetalleEstudianteTutorComponent,
        PeriodoSelectorComponent,
        MultiSelectChipsComponent,
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
