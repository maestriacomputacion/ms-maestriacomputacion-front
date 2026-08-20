import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GestionInformacionPresupuestariaRoutingModule } from './gestion-informacion-presupuestaria-routing.module';

import { ReporteFinalComponent } from './feature/reporte-final/reporte-final.component';
import { ProyeccionReporteComponent } from './feature/proyeccion-reporte/proyeccion-reporte.component';
import { ReportePorGruposComponent } from './feature/reporte-por-grupos/reporte-por-grupos.component';
import { PeriodoFinancieroSelectorComponent } from './feature/periodo-financiero-selector/periodo-financiero-selector.component';
import { GastosGeneralesDialogComponent } from './feature/gastos-generales-dialog/gastos-generales-dialog.component';
import { DescargarReporteDialogComponent } from './feature/descargar-reporte-dialog/descargar-reporte-dialog.component';
import { ProyectarPresupuestoDialogComponent } from './feature/proyectar-presupuesto-dialog/proyectar-presupuesto-dialog.component';

import { OpcionesPresupuestoComponent } from './ui/opciones-presupuesto/opciones-presupuesto.component';
import { TablaEstudiantesReporteComponent } from './ui/tabla-estudiantes-reporte/tabla-estudiantes-reporte.component';
import { ConfiguracionProyeccionCardComponent } from './ui/configuracion-proyeccion-card/configuracion-proyeccion-card.component';

import { GestionInformacionPresupuestariaApiService } from './data/api.service';
import { GestionInformacionPresupuestariaFacadeService } from './data/facade.service';
import { GestionInformacionPresupuestariaMapperService } from './data/mapper.service';
import { TotalesReporteService } from './data/totales-reporte.service';
import { ExcelService } from './data/excel.service';

import { PrimenNgModule } from '../primen-ng/primen-ng.module';
import { SharedModule } from '../../shared/shared.module';
import { ConfirmationService, MessageService } from 'primeng/api';

@NgModule({
    declarations: [
        ReporteFinalComponent,
        ProyeccionReporteComponent,
        ReportePorGruposComponent,
        PeriodoFinancieroSelectorComponent,
        GastosGeneralesDialogComponent,
        DescargarReporteDialogComponent,
        ProyectarPresupuestoDialogComponent,
        OpcionesPresupuestoComponent,
        TablaEstudiantesReporteComponent,
        ConfiguracionProyeccionCardComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        GestionInformacionPresupuestariaRoutingModule,
        PrimenNgModule,
        SharedModule,
    ],
    providers: [
        MessageService,
        ConfirmationService,
        GestionInformacionPresupuestariaApiService,
        GestionInformacionPresupuestariaFacadeService,
        GestionInformacionPresupuestariaMapperService,
        TotalesReporteService,
        ExcelService,
    ]
})
export class GestionInformacionPresupuestariaModule { }
