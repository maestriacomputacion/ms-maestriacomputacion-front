import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrincipalGestionAsignaturasComponent } from './pages/principal-gestion-asignaturas/principal-gestion-asignaturas.component';
import { GestionAsignaturasHomeComponent } from './components/gestion-asignaturas-home/gestion-asignaturas-home.component';
import { RegistrarAsignaturasComponent } from './components/registrar-asignaturas/registrar-asignaturas.component';

const routes: Routes = [
    //Aqui van las rutas
    {
        path: '',
        component: PrincipalGestionAsignaturasComponent,
        children: [
            {
                path: '',
                component: GestionAsignaturasHomeComponent,
            },
            {
                path: 'registrar-asignatura',
                component: RegistrarAsignaturasComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GestionAsignaturasRoutingModule {}
