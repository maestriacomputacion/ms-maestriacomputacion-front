import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimenNgModule } from '../modules/primen-ng/primen-ng.module';
import { EmptyLabelPipe } from './pipes/empty-label.pipe';
import { BuscadorDocentesComponent } from './components/buscador-docentes/buscador-docentes.component';
import { BuscadorEstudiantesComponent } from './components/buscador-estudiantes/buscador-estudiantes.component';
import { BuscadorExpertosComponent } from './components/buscador-expertos/buscador-expertos.component';
import { BytesToKbPipe } from './pipes/bytes-to-kb.pipe';
import { FormatCurrencyPipe } from './pipes/format-currency.pipe';
import { FormatPercentPipe } from './pipes/format-percent.pipe';

import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { TablaMatriculaEstudianteComponent } from './components/tabla-matricula-estudiante/tabla-matricula-estudiante.component';
import { UniProgressBarComponent } from './components/uni-progress-bar/uni-progress-bar.component';

// ── Atomic Design — Átomos ──
import { PeriodoBadgeComponent } from './components/periodo-badge/periodo-badge.component';
import { CampoDatoComponent } from './components/campo-dato/campo-dato.component';

// ── Atomic Design — Moléculas ──
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { EstadoVacioComponent } from './components/estado-vacio/estado-vacio.component';
import { UniCardHeaderComponent } from './components/uni-card-header/uni-card-header.component';
import { UniStatusBadgeComponent } from './components/uni-status-badge/uni-status-badge.component';

@NgModule({
    declarations: [
        EmptyLabelPipe,
        BytesToKbPipe,
        FormatCurrencyPipe,
        FormatPercentPipe,
        BuscadorDocentesComponent,
        BuscadorEstudiantesComponent,
        BuscadorExpertosComponent,
        LoadingOverlayComponent,
        TablaMatriculaEstudianteComponent,
        UniProgressBarComponent,
        // Átomos
        PeriodoBadgeComponent,
        CampoDatoComponent,
        // Moléculas
        PageHeaderComponent,
        EstadoVacioComponent,
        UniCardHeaderComponent,
        UniStatusBadgeComponent,
    ],
    imports: [
        CommonModule,
        PrimenNgModule
    ],
    exports: [
        EmptyLabelPipe,
        BytesToKbPipe,
        FormatCurrencyPipe,
        FormatPercentPipe,
        BuscadorDocentesComponent,
        BuscadorEstudiantesComponent,
        BuscadorExpertosComponent,
        LoadingOverlayComponent,
        TablaMatriculaEstudianteComponent,
        UniProgressBarComponent,
        // Átomos
        PeriodoBadgeComponent,
        CampoDatoComponent,
        // Moléculas
        PageHeaderComponent,
        EstadoVacioComponent,
        UniCardHeaderComponent,
        UniStatusBadgeComponent,
    ]
})
export class SharedModule { }
