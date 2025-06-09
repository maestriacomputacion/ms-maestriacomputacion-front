import { NgModule } from '@angular/core';
import { GestionPeriodoAcademicoComponent } from './components/gestion-periodo-academico/gestion-periodo-academico.component';
import { GestionMatriculaAcademicaRoutingModule } from './gestion-matricula-academica-routing.module';
import { PrimenNgModule } from '../primen-ng/primen-ng.module';

@NgModule({
    declarations: [GestionPeriodoAcademicoComponent],
    imports: [GestionMatriculaAcademicaRoutingModule,PrimenNgModule],
    providers: [],
    bootstrap: [],
})
export class GestionMatriculaAcademicaModule {}
