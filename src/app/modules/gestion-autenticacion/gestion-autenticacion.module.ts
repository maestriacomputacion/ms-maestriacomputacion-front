import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { PrimenNgModule } from '../primen-ng/primen-ng.module';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { DialogService } from 'primeng/dynamicdialog';
import { GestionAutenticacionRoutingModule } from './gestion-autenticacion-routing.module';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DynamicDialogModule,
        PrimenNgModule,
        GestionAutenticacionRoutingModule,
    ],
    providers: [AuthGuard, RoleGuard, DialogService],
})
export class GestionAutenticacionModule {}
