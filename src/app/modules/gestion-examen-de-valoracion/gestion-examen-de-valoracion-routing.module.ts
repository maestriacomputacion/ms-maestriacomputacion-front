import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BandejaExamenDeValoracionComponent } from './components/bandeja-examen/bandeja-examen-de-valoracion.component';
import { ResolucionExamenComponent } from './components/resolucion-examen/resolucion-examen.component';
import { RespuestaExamenComponent } from './components/respuesta-examen/respuesta-examen.component';
import { SolicitudExamenComponent } from './components/solicitud-examen/solicitud-examen.component';
import { SustentacionExamenComponent } from './components/sustentacion-examen/sustentacion-examen.component';
import { PrincipalExamenDeValoracionComponent } from './pages/principal-examen-de-valoracion/principal-examen-de-valoracion.component';
import { RoleGuard } from '../gestion-autenticacion/guards/role.guard';

const routes: Routes = [
    {
        path: '',
        component: PrincipalExamenDeValoracionComponent,
        children: [
            {
                path: '',
                component: BandejaExamenDeValoracionComponent,
                canActivate: [RoleGuard],
                data: {
                    expectedRole: [
                        'ROLE_COORDINADOR',
                        'ROLE_DOCENTE',
                        'ROLE_ESTUDIANTE',
                    ],
                },
            },
            {
                path: 'solicitud',
                component: SolicitudExamenComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_DOCENTE'] },
            },
            {
                path: 'solicitud/editar/:id',
                component: SolicitudExamenComponent,
                canActivate: [RoleGuard],
                data: {
                    expectedRole: [
                        'ROLE_COORDINADOR',
                        'ROLE_DOCENTE',
                        'ROLE_ESTUDIANTE',
                    ],
                },
            },
            {
                path: 'respuesta',
                component: RespuestaExamenComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },
            },
            {
                path: 'resolucion',
                component: ResolucionExamenComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR', 'ROLE_DOCENTE'] },
            },
            {
                path: 'resolucion/editar/:id',
                component: ResolucionExamenComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR', 'ROLE_DOCENTE'] },
            },
            {
                path: 'sustentacion',
                component: SustentacionExamenComponent,
                canActivate: [RoleGuard],
                data: {
                    expectedRole: [
                        'ROLE_COORDINADOR',
                        'ROLE_DOCENTE',
                        'ROLE_ESTUDIANTE',
                    ],
                },
            },
            {
                path: 'sustentacion/editar/:id',
                component: SustentacionExamenComponent,
                canActivate: [RoleGuard],
                data: {
                    expectedRole: [
                        'ROLE_COORDINADOR',
                        'ROLE_DOCENTE',
                        'ROLE_ESTUDIANTE',
                    ],
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ExamenDeValoracionRoutingModule {}
