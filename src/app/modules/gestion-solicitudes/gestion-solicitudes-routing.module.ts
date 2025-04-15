import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestionComponent } from './pages/gestion/gestion.component';
import { BuzonComponent } from './components/gestion-coordinacion/buzon/buzon.component';
import { SelectorComponent } from './components/presentacion-solicitudes/selector/selector.component';
import { DocsAdjuntosComponent } from './components/presentacion-solicitudes/docsadjuntos/docsadjuntos.component';
import { ResumenComponent } from './components/presentacion-solicitudes/resumen/ResumenComponent';
import { VisorComponent } from './components/gestion-coordinacion/visor/visor.component';
import { BuzondeavalesComponent } from './components/aval-tutores-directores/buzondeavales/buzondeavales.component';
import { PendientesavalComponent } from './components/aval-tutores-directores/pendientesaval/pendientesaval.component';
import { FormulariosComponent } from './components/presentacion-solicitudes/formularios/formularios.component';
import { HistorialComponent } from './components/seguimiento-solicitudes/historial/historial.component';
import { PortafolioComponent } from './pages/portafolio/portafolio.component';
import { OpcionesComponent } from './pages/opciones/opciones.component';
import { ContenedorComponent } from './components/gestion-coordinacion/contenedor/contenedor.component';
import { VisoravalComponent } from './components/aval-tutores-directores/visoraval/visoraval.component';
import { RoleGuard } from '../gestion-autenticacion/guards/role.guard';
import { AuthGuard } from '../gestion-autenticacion/guards/auth.guard';
import { RadicadorComponent } from './pages/radicador/radicador.component';

const routes: Routes = [
    {
        path: '',
        component: GestionComponent,
        children: [
            {
                path: 'visor',
                component: VisorComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },
            },
            {
                path: 'contenedor',
                component: ContenedorComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },
            },
            {
                path: 'buzon/nuevas',
                component: BuzonComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },
            },
            {
                path: 'buzon/rechazadas',
                component: BuzonComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },
            },
            {
                path: 'buzon/comite',
                component: BuzonComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },
            },
            {
                path: 'buzon/consejo',
                component: BuzonComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },
            },
            {
                path: 'buzon/resueltas',
                component: BuzonComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_COORDINADOR'] },
            },
        ],
    },
    {
        path: 'portafolio',
        component: PortafolioComponent,
        children: [
            { path: 'opciones', component: OpcionesComponent },
            { path: 'seguimiento/historial', component: HistorialComponent },
            {
                path: 'radicar',
                component: RadicadorComponent, // El componente que maneja el flujo de pasos
                canActivate: [AuthGuard],
            },
        ],
    },

    {
        path: 'avales',
        component: BuzondeavalesComponent,
        children: [
            {
                path: 'pendientes',
                component: PendientesavalComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_DOCENTE'] },
            },
            {
                path: 'pendientes/detalles',
                component: VisoravalComponent,
                canActivate: [RoleGuard],
                data: { expectedRole: ['ROLE_DOCENTE'] },
            },
        ],
    },
    {
        path: 'seguimiento',
        component: HistorialComponent,
        children: [{ path: 'historial', component: HistorialComponent }],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GestionSolicitudesRoutingModule {}
