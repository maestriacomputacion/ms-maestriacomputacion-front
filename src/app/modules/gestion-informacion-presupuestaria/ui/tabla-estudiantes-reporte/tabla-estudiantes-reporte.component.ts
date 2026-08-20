import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { ConfiguracionReporteFinanciero } from '../../models/domain-models';
import { ReporteFinalVM } from '../../models/reporte-final.vm';

@Component({
    selector: 'app-tabla-estudiantes-reporte',
    templateUrl: './tabla-estudiantes-reporte.component.html',
    styleUrls: ['./tabla-estudiantes-reporte.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TablaEstudiantesReporteComponent {

    /** Lista de estudiantes a mostrar */
    @Input() estudiantes: ReporteFinalVM[] = [];

    /** Configuración del reporte (para porcentajes fijos de votación/egresado) */
    @Input() configuracion: ConfiguracionReporteFinanciero | null = null;

    /** Si es true, muestra botones de edición por fila. Si es false, solo lectura. */
    @Input() editable: boolean = false;

    /** Clave de la fila actualmente en edición (codigoEstudiante) */
    @Input() editingRowKey: string | null = null;

    /** Emite cuando se inicia la edición de una fila */
    @Output() rowEditInit = new EventEmitter<ReporteFinalVM>();

    /** Emite cuando se guarda una fila editada */
    @Output() rowEditSave = new EventEmitter<ReporteFinalVM>();

    /** Emite cuando se cancela la edición de una fila */
    @Output() rowEditCancel = new EventEmitter<{ estudiante: ReporteFinalVM; index: number }>();

    /** Emite cambios en el input de porcentaje de beca */
    @Output() percentInput = new EventEmitter<{ event: Event; estudiante: ReporteFinalVM; campo: string }>();

    trackByEstudiante(index: number, e: ReporteFinalVM): string {
        return e.codigoEstudiante;
    }

    getEstadoPagoClass(e: ReporteFinalVM): string {
        if (e.estadoMatriculaFinanciera === true || e.estaPago === true) return 'estado-badge--success';
        
        if (this.editable) {
            // En Proyección, si no es true, se considera Pendiente (amarillo)
            return 'estado-badge--warning';
        } else {
            // En Reporte Final, si no es true, se considera No pago (rojo)
            return 'estado-badge--danger';
        }
    }

    getEstadoPagoLabel(e: ReporteFinalVM): string {
        if (e.estadoMatriculaFinanciera === true || e.estaPago === true) return 'PAGADO';
        
        if (this.editable) {
            return 'PENDIENTE';
        } else {
            return 'NO PAGADO';
        }
    }

    getPorcentajeVotacion(): string {
        return this.configuracion
            ? (this.configuracion.porcentajeVotacionFijo * 100 | 0) + '%'
            : '10%';
    }

    getPorcentajeEgresado(): string {
        return this.configuracion
            ? (this.configuracion.porcentajeEgresadoFijo * 100 | 0) + '%'
            : '5%';
    }
}
