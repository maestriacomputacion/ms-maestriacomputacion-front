import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BecaFinanciera, Materia, PeriodoAcademico } from '../../models/domain-models';
import { GestionMatriculaFinancieraFacadeService } from '../../data/facade.service';
import { RadicarService } from '../../../gestion-solicitudes/services/radicar.service';
import { getEstadoMatriculaSeverity, getEstadoMatriculaLabel } from '../../utils/estado-matricula.utils';

@Component({
    selector: 'app-detalle-estudiante',
    templateUrl: './detalle-estudiante.component.html',
    styleUrls: ['./detalle-estudiante.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService]
})
export class DetalleEstudianteComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>();

    /** ViewModel del Facade — contiene loading, error, estudiante, isEmpty */
    readonly vmDetalle$ = this.facadeService.vmDetalle$;

    readonly getEstadoSeverity = getEstadoMatriculaSeverity;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private facadeService: GestionMatriculaFinancieraFacadeService,
        private radicarService: RadicarService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        // Cargar periodos si no están en el facade
        const periodosActuales = this.facadeService.getPeriodosSync();
        if (!periodosActuales || periodosActuales.length === 0) {
            this.facadeService.obtenerPeriodosAcademicos().pipe(takeUntil(this.destroy$)).subscribe();
        }

        this.route.paramMap.pipe(
            switchMap(params => {
                const id = params.get('id') ?? '';
                return this.facadeService.obtenerEstudiante(id);
            }),
            takeUntil(this.destroy$)
        ).subscribe({
            next: () => this.cdr.markForCheck(),
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al cargar',
                    detail: 'No fue posible cargar el detalle del estudiante. Por favor, intente nuevamente.'
                });
                this.cdr.markForCheck();
            }
        });
    }

    volverAlListado(): void {
        this.router.navigate(['/gestion-matricula-financiera']);
    }

    /** Navega al flujo de radicación con RE_MATR preseleccionado */
    solicitarRevision(): void {
        this.radicarService.restrablecerValores();
        this.radicarService.codigoSolicitudPreseleccionado = 'RE_MATR';
        this.router.navigate(['/gestionsolicitudes/portafolio/radicar']);
    }

    trackByBeca(index: number, beca: BecaFinanciera): string {
        return beca.resolucion + index;
    }

    trackByMateria(index: number, materia: Materia): string {
        return materia.codigo_oid + index;
    }

    getEstadoPagoLabel(estaPago: boolean | undefined | null): string {
        return getEstadoMatriculaLabel(estaPago);
    }

    getEstadoPagoSeverity(estaPago: boolean | undefined | null): 'success' | 'warning' | 'danger' | 'info' {
        return getEstadoMatriculaSeverity(estaPago);
    }

    getPeriodoLabel(periodos: PeriodoAcademico[]): string {
        if (!periodos || periodos.length === 0) return 'Periodo Académico';
        // Si hay una lógica de periodo activo, se usaría aquí.
        // Por ahora tomamos el primero o el que esté marcado como activo.
        const activo = periodos.find(p => p.estado === 'ACTIVO') || periodos[0];
        return `${activo.año} - Periodo ${activo.periodo}`;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
