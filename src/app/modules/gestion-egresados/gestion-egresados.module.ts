import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'primeng/api';
import { PrimenNgModule } from '../primen-ng/primen-ng.module';

import { ReactiveFormsModule } from '@angular/forms';
import { PrincipalSeguimientoEgresados } from './pages/principal-seguimiento-a-egresados.component';
import { SeguimientoAEgresadosRoutingModule } from './gestion-egresados-routing.module';
import { BandejaSeguimientoAEgresadosComponent } from './components/bandeja-egresados/bandeja-seguimiento-a-egresados.component';
import { CursoService } from './services/cursos.service';
import { EmpresaService } from './services/empresas.service';
import { CursoEgresadoComponent } from './components/curso-egresados/curso-egresados.component';
import { EmpresaEgresadoComponent } from './components/empresa-egresados/empresa-egresados.component';

@NgModule({
    declarations: [
        PrincipalSeguimientoEgresados,
        BandejaSeguimientoAEgresadosComponent,
        CursoEgresadoComponent,
        EmpresaEgresadoComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        PrimenNgModule,
        SeguimientoAEgresadosRoutingModule,
        ReactiveFormsModule,
    ],
    providers: [CursoService, EmpresaService],
})
export class SeguimientoAEgresadosModule {}
