import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { PrimenNgModule } from '../../primen-ng/primen-ng.module';
import { ReactiveFormsModule } from '@angular/forms';
import { GestionCuestionariosRoutingModule } from './gestion-cuestionarios-routing.module';
import { AgregarPreguntaCuestionarioComponent } from './components/agregar-pregunta-cuestionario/agregar-pregunta-cuestionario.component';
import { PrincipalGestionCuestionarioComponent } from './pages/principal-gestion-cuestionario/principal-gestion-cuestionario.component';
import { BandejaCuestionariosComponent } from './components/bandeja-cuestionarios/bandeja-cuestionarios.component';

@NgModule({
    declarations: [
        PrincipalGestionCuestionarioComponent,
        AgregarPreguntaCuestionarioComponent,
        BandejaCuestionariosComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        PrimenNgModule,
        GestionCuestionariosRoutingModule,
        ReactiveFormsModule,
    ],
})
export class GestionCuestionariosModule {}
