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

@NgModule({
    declarations: [
        GestionPeriodoAcademicoComponent,
        GestionCursoComponent,
        GenerarCursosOfertadosComponent,
        RegistrarCursoComponent,
        GestionMaterialApoyoComponent,
        GenerarMatriculaPreviaComponent
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
