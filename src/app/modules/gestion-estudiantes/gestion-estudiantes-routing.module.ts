import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrincipalGestionEstudiantesComponent } from './pages/principal-gestion-estudiantes/principal-gestion-estudiantes.component';
import { BandejaEstudiantesComponent } from './components/bandeja-estudiantes/bandeja-estudiantes.component';
import { EstadosEstudianteComponent } from './components/estados-estudiante/estados-estudiante.component';
import { CrearEditarEstudianteComponent } from './components/crear-editar-estudiante/crear-editar-estudiante.component';

const routes: Routes = [
    {
        path: '',
        component: PrincipalGestionEstudiantesComponent,
        children: [
            {
                path: '',
                component: BandejaEstudiantesComponent,
            },
            {
                path: 'estados/:id',
                component: EstadosEstudianteComponent,
            },
            {
                path: 'registrar',
                component: CrearEditarEstudianteComponent,
            },
            {
                path: 'editar/:id',
                component: CrearEditarEstudianteComponent,
            },
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionEstudiantesRoutingModule { }
