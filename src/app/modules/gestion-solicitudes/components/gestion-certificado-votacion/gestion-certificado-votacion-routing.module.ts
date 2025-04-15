import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TramiteCertificadoComponent } from './components/tramitecertificado/tramitecertificado.component';

const routes: Routes = [{
  path: '',
  component: TramiteCertificadoComponent
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionCertificadoVotacionRoutingModule { }
