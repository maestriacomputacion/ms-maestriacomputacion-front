import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'primeng/api';
import { PrimenNgModule } from '../primen-ng/primen-ng.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PrincipalGestionExpertosComponent } from './pages/principal-gestion-expertos/principal-gestion-expertos.component';
import { GestionExpertosRoutingModule } from './gestion-expertos-routing.module';
import { CrearEditarExpertoComponent } from './components/crear-editar-experto/crear-editar-experto.component';
import { InformacionPersonalComponent } from './components/crear-editar-experto/informacion-personal/informacion-personal.component';
import { InformacionTituloComponent } from './components/crear-editar-experto/informacion-titulo/informacion-titulo.component';
import { InformacionVinculacionComponent } from './components/crear-editar-experto/informacion-vinculacion/informacion-vinculacion.component';
import { BandejaExpertosComponent } from './components/bandeja-expertos/bandeja-expertos.component';
import { CargarExpertosComponent } from './components/cargar-expertos/cargar-expertos.component';

@NgModule({
    declarations: [
        PrincipalGestionExpertosComponent,
        CrearEditarExpertoComponent,
        InformacionPersonalComponent,
        InformacionTituloComponent,
        InformacionVinculacionComponent,
        BandejaExpertosComponent,
        CargarExpertosComponent
    ],
    imports: [
      CommonModule,
      SharedModule,
      PrimenNgModule,
      ReactiveFormsModule,
      GestionExpertosRoutingModule
    ]
  })
  export class GestionExpertosModule { }