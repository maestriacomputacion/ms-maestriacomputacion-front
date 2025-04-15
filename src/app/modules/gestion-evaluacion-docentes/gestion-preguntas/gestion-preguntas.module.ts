import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrincipalGestionPreguntasComponent } from './pages/principal-gestion-preguntas/principal-gestion-preguntas.component';
import { SharedModule } from 'primeng/api';
import { PrimenNgModule } from '../../primen-ng/primen-ng.module';
import { ReactiveFormsModule } from '@angular/forms';
import { GestionPreguntasRoutingModule } from './gestion-preguntas-routing.module';
import { BandejaPreguntasComponent } from './components/bandeja-preguntas/bandeja-preguntas.component';

@NgModule({
    declarations: [
        PrincipalGestionPreguntasComponent,
        BandejaPreguntasComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        PrimenNgModule,
        GestionPreguntasRoutingModule,
        ReactiveFormsModule,
    ],
})
export class GestionPreguntasModule {}
