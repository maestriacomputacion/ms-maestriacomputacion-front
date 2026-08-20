import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GestionMatriculaFinancieraRoutingModule } from './gestion-matricula-financiera-routing.module';
import { PrimenNgModule } from '../primen-ng/primen-ng.module';
import { MessageService } from 'primeng/api';
import { SharedModule } from '../../shared/shared.module';

import { MatriculaFinancieraComponent } from './feature/matricula-financiera/matricula-financiera.component';
import { DetalleEstudianteComponent } from './feature/detalle-estudiante/detalle-estudiante.component';
import { ResumenMatriculaEstudianteComponent } from './feature/resumen-matricula-estudiante/resumen-matricula-estudiante.component';

import { MatriculaStatusBadgeComponent } from './ui/matricula-status-badge/matricula-status-badge.component';

import { GestionMatriculaFinancieraApiService } from './data/api.service';
import { GestionMatriculaFinancieraFacadeService } from './data/facade.service';
import { GestionMatriculaFinancieraMapperService } from './data/mapper.service';

@NgModule({
    declarations: [
        MatriculaFinancieraComponent,
        DetalleEstudianteComponent,
        ResumenMatriculaEstudianteComponent,
        MatriculaStatusBadgeComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PrimenNgModule,
        GestionMatriculaFinancieraRoutingModule,
        SharedModule
    ],
    providers: [
        MessageService,
        GestionMatriculaFinancieraApiService,
        GestionMatriculaFinancieraFacadeService,
        GestionMatriculaFinancieraMapperService,
    ]
})
export class GestionMatriculaFinancieraModule { }
