import { NgModule } from '@angular/core';
import { CommonModule,DatePipe  } from '@angular/common';

import { GestionAsignaturasRoutingModule } from './gestion-asignaturas-routing.module';
import { PrimenNgModule } from '../primen-ng/primen-ng.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PrincipalGestionAsignaturasComponent } from './pages/principal-gestion-asignaturas/principal-gestion-asignaturas.component';
import { GestionAsignaturasHomeComponent } from './components/gestion-asignaturas-home/gestion-asignaturas-home.component';
import { AsignaturasService } from './services/asignaturas.service';
import { RegistrarAsignaturasComponent } from './components/registrar-asignaturas/registrar-asignaturas.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EditarAsignaturasComponent } from './components/editar-asignaturas/editar-asignaturas.component';
import { DialogService } from 'primeng/dynamicdialog';



@NgModule({
    declarations: [
        PrincipalGestionAsignaturasComponent,
        GestionAsignaturasHomeComponent,
        RegistrarAsignaturasComponent,
        EditarAsignaturasComponent,
    ],
    imports: [
        CommonModule,
        PrimenNgModule,
        SharedModule,
        GestionAsignaturasRoutingModule,
        ReactiveFormsModule,

    ],
    providers: [AsignaturasService, MessageService, ConfirmationService,DialogService, DatePipe],

})
export class GestionAsignaturasModule {}
