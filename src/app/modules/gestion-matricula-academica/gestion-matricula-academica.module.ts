import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestionPeriodoAcademicoComponent } from './components/gestion-periodo-academico/gestion-periodo-academico.component';
import { GestionMatriculaAcademicaRoutingModule } from './gestion-matricula-academica-routing.module';
import { PrimenNgModule } from '../primen-ng/primen-ng.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [GestionPeriodoAcademicoComponent],
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
