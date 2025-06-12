import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestionPeriodoAcademicoComponent } from './components/gestion-periodo-academico/gestion-periodo-academico.component';
import { GestionMatriculaAcademicaRoutingModule } from './gestion-matricula-academica-routing.module';
import { PrimenNgModule } from '../primen-ng/primen-ng.module';
import { ReactiveFormsModule } from '@angular/forms';
import { GestionCursoComponent } from './components/gestion-curso/gestion-curso.component';
import { GenerarCursosOfertadosComponent } from './components/generar-cursos-ofertados/generar-cursos-ofertados.component';
import { RegistrarCursoComponent } from './components/registrar-curso/registrar-curso.component';

@NgModule({
    declarations: [GestionPeriodoAcademicoComponent,GestionCursoComponent,GenerarCursosOfertadosComponent,RegistrarCursoComponent],
    imports: [
        CommonModule,
        GestionMatriculaAcademicaRoutingModule,
        PrimenNgModule,
        ReactiveFormsModule,
    ],
    providers: [],
    bootstrap: [],
})
export class GestionMatriculaAcademicaModule {}
