import { RouterModule, Routes } from "@angular/router";
import { PrincipalGestionCategoriasComponent } from "./pages/principal-gestion-categorias/principal-gestion-categorias.component";
import { BandejaCategoriasComponent } from "./components/bandeja-categorias/bandeja-categorias.component";
import { NgModule } from "@angular/core";


const routes: Routes=[{
    path: '',
    component: PrincipalGestionCategoriasComponent,
    children:[
        {
            path : '',
            component: BandejaCategoriasComponent
        }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GestionCategoriasRoutingModule { }
