import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrincipalGestionDocumentosComponent } from './pages/principal-gestion-documentos/principal-gestion-documentos.component';
import { RegistrarDocumentosComponent } from './components/registrar-documentos/registrar-documentos.component';
import { GestionDocumentosHomeComponent } from './components/gestion-documentos-home/gestion-documentos-home.component';

const routes: Routes = [
    {
        path:'',
        component: PrincipalGestionDocumentosComponent,
        children:[
            {
                path:'',
                component: GestionDocumentosHomeComponent,
            },
            {
                path:'registrar-documento',
                component: RegistrarDocumentosComponent,
            }
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionDocumentosRoutingModule { }
