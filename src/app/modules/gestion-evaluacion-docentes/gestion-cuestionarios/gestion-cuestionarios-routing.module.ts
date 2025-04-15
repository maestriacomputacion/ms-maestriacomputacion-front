import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgregarPreguntaCuestionarioComponent } from './components/agregar-pregunta-cuestionario/agregar-pregunta-cuestionario.component';

import { PrincipalGestionCuestionarioComponent } from './pages/principal-gestion-cuestionario/principal-gestion-cuestionario.component';
import { BandejaCuestionariosComponent } from './components/bandeja-cuestionarios/bandeja-cuestionarios.component';

const routes: Routes = [
    {
        path: '',
        component: PrincipalGestionCuestionarioComponent,
        children: [
            {
                path: '',
                component: BandejaCuestionariosComponent,
            },
            {
                path: 'agregar-pregunta/:id',
                component: AgregarPreguntaCuestionarioComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GestionCuestionariosRoutingModule {}
