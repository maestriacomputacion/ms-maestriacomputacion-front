import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { GestionDocumentosRoutingModule } from './gestion-documentos-routing.module';
import { PrimenNgModule } from '../primen-ng/primen-ng.module';
import { ConfirmationService, MessageService, SharedModule } from 'primeng/api';
import { PrincipalGestionDocumentosComponent } from './pages/principal-gestion-documentos/principal-gestion-documentos.component';
import { RegistrarDocumentosComponent } from './components/registrar-documentos/registrar-documentos.component';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { GestionDocumentosHomeComponent } from './components/gestion-documentos-home/gestion-documentos-home.component';
import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [
    PrincipalGestionDocumentosComponent,
    RegistrarDocumentosComponent,
    GestionDocumentosHomeComponent
  ],
  imports: [
    CommonModule,
    PrimenNgModule,
    SharedModule,
    ReactiveFormsModule,
    GestionDocumentosRoutingModule,
    DialogModule,
    DynamicDialogModule
  ],
  providers: [ MessageService, ConfirmationService,DatePipe ],
})
export class GestionDocumentosModule { }
