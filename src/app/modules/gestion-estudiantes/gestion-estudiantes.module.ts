import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GestionEstudiantesRoutingModule } from './gestion-estudiantes-routing.module';
import { PrimenNgModule } from '../primen-ng/primen-ng.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PrincipalGestionEstudiantesComponent } from './pages/principal-gestion-estudiantes/principal-gestion-estudiantes.component';
import { BandejaEstudiantesComponent } from './components/bandeja-estudiantes/bandeja-estudiantes.component';
import { EstudianteService } from './services/estudiante.service';
import { CargarEstudiantesComponent } from './components/cargar-estudiantes/cargar-estudiantes.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EstadosEstudianteComponent } from './components/estados-estudiante/estados-estudiante.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CrearEditarEstudianteComponent } from './components/crear-editar-estudiante/crear-editar-estudiante.component';
import { InformacionPersonalComponent } from './components/crear-editar-estudiante/informacion-personal/informacion-personal.component';
import { InformacionMaestriaComponent } from './components/crear-editar-estudiante/informacion-maestria/informacion-maestria.component';
import { DialogService } from 'primeng/dynamicdialog';
import { ModalProrrogaComponent } from './components/modals/modal-prorroga/modal-prorroga.component';
import { ModalReingresoComponent } from './components/modals/modal-reingreso/modal-reingreso.component';
import { InformacionReingresosComponent } from './components/crear-editar-estudiante/informacion-reingresos/informacion-reingresos.component';
import { InformacionProrrogasComponent } from './components/crear-editar-estudiante/informacion-prorrogas/informacion-prorrogas.component';


@NgModule({
  declarations: [
    PrincipalGestionEstudiantesComponent,
    BandejaEstudiantesComponent,
    CargarEstudiantesComponent,
    EstadosEstudianteComponent,
    CrearEditarEstudianteComponent,
    InformacionPersonalComponent,
    InformacionMaestriaComponent,
    ModalProrrogaComponent,
    ModalReingresoComponent,
    InformacionReingresosComponent,
    InformacionProrrogasComponent
  ],
  imports: [
    CommonModule,
    PrimenNgModule,
    SharedModule,
    GestionEstudiantesRoutingModule,
    ReactiveFormsModule,
  ],
  providers: [
    MessageService,
    ConfirmationService,
    DialogService,
    EstudianteService,
  ]
})
export class GestionEstudiantesModule { }
