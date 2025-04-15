import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { GestionCertificadoVotacionRoutingModule } from './gestion-certificado-votacion-routing.module';
import { TramiteCertificadoComponent } from './components/tramitecertificado/tramitecertificado.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@NgModule({
  declarations: [
    TramiteCertificadoComponent
  ],
  imports: [
    CommonModule,
    TableModule,
    GestionCertificadoVotacionRoutingModule,
    ButtonModule,
    ToastModule,
    FormsModule,
    InputTextModule,
    ProgressSpinnerModule,
    DropdownModule,
    ConfirmDialogModule
  ]
})
export class GestionCertificadoVotacionModule { }
