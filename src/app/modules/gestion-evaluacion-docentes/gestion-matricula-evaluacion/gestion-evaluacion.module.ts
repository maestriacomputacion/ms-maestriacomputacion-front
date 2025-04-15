import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'primeng/api';
import { PrimenNgModule } from '../../primen-ng/primen-ng.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrincipalGestionEvaluacionComponent } from './pages/principal-gestion-evaluacion/principal-gestion-evaluacion.component';
import { GestionEvaluacionRoutingModule } from './gestion-evaluacion-routing.module';
import { BandejaEvaluacionDocenteComponent } from './components/bandeja-evaluacion-docente/bandeja-evaluacion-docente.component';
import { AgregarEvaluacionComponent } from './components/agregar-evaluacion/agregar-evaluacion.component';
import { EstadisticaEvaluacionComponent } from './components/estadistica-evaluacion/estadistica-evaluacion.component';

@NgModule({
    declarations: [
        PrincipalGestionEvaluacionComponent,
        BandejaEvaluacionDocenteComponent,
        AgregarEvaluacionComponent,
        EstadisticaEvaluacionComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        PrimenNgModule,
        ReactiveFormsModule,
        GestionEvaluacionRoutingModule,
        FormsModule,
    ],
})
export class GestionEvaluacionModule {}
