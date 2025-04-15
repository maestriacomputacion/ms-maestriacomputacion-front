import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrincipalGestionPreguntasComponent } from './pages/principal-gestion-preguntas/principal-gestion-preguntas.component';
import { BandejaPreguntasComponent } from './components/bandeja-preguntas/bandeja-preguntas.component';


const routes: Routes = [
    {
        path: '',
        component: PrincipalGestionPreguntasComponent,
        children: [
            {
                path: '',
                component: BandejaPreguntasComponent,
            }
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionPreguntasRoutingModule { }