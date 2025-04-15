import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrincipalGestionLineasComponent } from '../gestion-linea/pages/principal-gestion-lineas/principal-gestion-lineas.component';
import { BandejaLineasComponent } from './components/bandeja-lineas/bandeja-lineas.component';
// import { BandejaCategoriasComponent } from './components/bandeja-categorias/bandeja-categorias.component';

const routes: Routes = [{
    path: '',
    component: PrincipalGestionLineasComponent,
    children: [
        {
            path: '',
            component: BandejaLineasComponent
        }
        // {
        //     path: '',
        //     component: BandejaCategoriasComponent
        // }

    ]

}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
export class GestionLineasInvestigacionRoutingModule { }