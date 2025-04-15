import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GestionDocentesRoutingModule } from './gestion-docentes-routing.module';
import { PrincipalGestionDocentesComponent } from './pages/principal-gestion-docentes/principal-gestion-docentes.component';
import { SharedModule } from 'primeng/api';
import { PrimenNgModule } from '../primen-ng/primen-ng.module';
import { CrearEditarDocenteComponent } from './components/crear-editar-docente/crear-editar-docente.component';
import { InformacionPersonalComponent } from './components/crear-editar-docente/informacion-personal/informacion-personal.component';
import { InformacionUniversidadComponent } from './components/crear-editar-docente/informacion-universidad/informacion-universidad.component';
import { ReactiveFormsModule } from '@angular/forms';
import { InformacionTituloComponent } from './components/crear-editar-docente/informacion-titulo/informacion-titulo.component';


@NgModule({
  declarations: [
    PrincipalGestionDocentesComponent,
    CrearEditarDocenteComponent,
    InformacionPersonalComponent,
    InformacionUniversidadComponent,
    InformacionTituloComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PrimenNgModule,
    GestionDocentesRoutingModule,
    ReactiveFormsModule,
  ]
})
export class GestionDocentesModule { }
