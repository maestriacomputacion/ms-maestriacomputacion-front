import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestionPeriodoAcademicoComponent } from './components/gestion-periodo-academico/gestion-periodo-academico.component';
import { GestionMatriculaAcademicaRoutingModule } from './gestion-matricula-academica-routing.module';
import { PrimenNgModule } from '../primen-ng/primen-ng.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { GestionCursoComponent } from './components/gestion-curso/gestion-curso.component';
import { GenerarCursosOfertadosComponent } from './components/generar-cursos-ofertados/generar-cursos-ofertados.component';
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

@NgModule({
    declarations: [
        GestionPeriodoAcademicoComponent,
        GestionCursoComponent,
        GenerarCursosOfertadosComponent,
        RegistrarCursoComponent,
        GestionMaterialApoyoComponent,
        GenerarMatriculaPreviaComponent,
        GestionEstudianteComponent,
        GestionMatriculaCursoComponent,
        RealizarMatriculaEstudiantesComponent,
        MatriculaMasivaComponent,
        ResultadoMatriculaMasivaComponent,
        CursosPorAreaTabsComponent,
    ],
    imports: [
        CommonModule,
        GestionMatriculaAcademicaRoutingModule,
        PrimenNgModule,
        ReactiveFormsModule,
        FormsModule,
    ],
    providers: [MaterialApoyoService, MessageService, ConfirmationService],
    bootstrap: [],
})
export class GestionMatriculaAcademicaModule {}
