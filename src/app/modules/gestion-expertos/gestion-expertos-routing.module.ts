import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrincipalGestionExpertosComponent } from './pages/principal-gestion-expertos/principal-gestion-expertos.component';
import { BandejaExpertosComponent } from './components/bandeja-expertos/bandeja-expertos.component';
import { CrearEditarExpertoComponent } from './components/crear-editar-experto/crear-editar-experto.component';



const routes: Routes = [
    {
        path: '',
        component: PrincipalGestionExpertosComponent,
        children: [
            {
                path: '',
                component: BandejaExpertosComponent,
            },
            {
                path:'registrar',
                component: CrearEditarExpertoComponent,
            },
            {
                path: 'editar/:id',
                component: CrearEditarExpertoComponent,
            }
        ]
    }
    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GestionExpertosRoutingModule { }