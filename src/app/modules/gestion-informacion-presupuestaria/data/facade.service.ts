import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject, combineLatest } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';
import { GestionInformacionPresupuestariaApiService } from './api.service';
import { GestionInformacionPresupuestariaMapperService } from './mapper.service';
import { ApiError } from '../dto/api-error';
import { ConfiguracionReporteFinancieroDTOPeticion } from '../dto/configuracion-reporte-financiero.dto';
import { ProyeccionEstudianteDTOPeticion, CrearEstudianteSimuladoDTOPeticion, ActualizarEstudianteSimuladoDTOPeticion } from '../dto/proyeccion-estudiante.dto';
import { ProyectarPresupuestoDTOPeticion } from '../dto/proyectar-presupuesto.dto';
import { PeriodoAcademicoDto } from '../dto/periodo-financiero.dto';
import { ActualizarParticipacionDTOPeticion } from '../dto/porcentaje-grupo.dto';
import { GastoGeneralDTOPeticion } from '../dto/gasto-general.dto';
import { ReporteProyeccionEstudiantes, ReportePorGrupos, ReporteEstudiantes } from '../models/domain-models';

@Injectable()
export class GestionInformacionPresupuestariaFacadeService {

    private _loading = new BehaviorSubject<boolean>(false);
    public loading$ = this._loading.asObservable();

    private _error = new BehaviorSubject<ApiError | null>(null);
    public error$ = this._error.asObservable();

    private _reporteProyeccionEstudiantes = new BehaviorSubject<ReporteProyeccionEstudiantes | null>(null);
    public reporteProyeccionEstudiantes$ = this._reporteProyeccionEstudiantes.asObservable();

    private _reporteGrupos = new BehaviorSubject<ReportePorGrupos | null>(null);
    public reporteGrupos$ = this._reporteGrupos.asObservable();

    // ── ViewModels combinados (vm$) ─────────────────────────────────────────

    /** ViewModel para ProyeccionReporteComponent y ReporteFinalComponent */
    readonly vmProyeccion$ = combineLatest({
        loading: this._loading,
        error: this._error,
        reporte: this._reporteProyeccionEstudiantes
    }).pipe(
        map(vm => ({
            ...vm,
            isEmpty: !vm.loading && vm.reporte === null
        }))
    );

    /** ViewModel para ReportePorGruposComponent */
    readonly vmGrupos$ = combineLatest({
        loading: this._loading,
        error: this._error,
        reporte: this._reporteGrupos
    }).pipe(
        map(vm => ({
            ...vm,
            isEmpty: !vm.loading && vm.reporte === null
        }))
    );

    constructor(
        private apiService: GestionInformacionPresupuestariaApiService,
        private mapper: GestionInformacionPresupuestariaMapperService
    ) {}

    obtenerPeriodosFinancieros(): Observable<PeriodoAcademicoDto[]> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.obtenerPeriodos().pipe(
            map(periodos => periodos.map(p => ({ ...p, año: p.anio, periodo: p.tagPeriodo }))),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    obtenerPeriodosActivos(): Observable<PeriodoAcademicoDto[]> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.obtenerPeriodosActivos().pipe(
            map(periodos => periodos.map(p => ({ ...p, año: p.anio, periodo: p.tagPeriodo }))),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    obtenerPeriodosFinalizados(): Observable<PeriodoAcademicoDto[]> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.obtenerPeriodosFinalizados().pipe(
            map(periodos => (periodos || []).map(p => ({ ...p, año: p.anio, periodo: p.tagPeriodo }))),
            catchError(err => {
                this._error.next({
                    mensaje: 'No se pudieron cargar los períodos académicos finalizados.',
                    codigoError: 'FE-PERIODOS-FINALIZADOS',
                    codigoHttp: err.status || 500,
                    url: err.url || '',
                    metodo: 'GET'
                });
                return throwError(() => err);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    obtenerPeriodosActivosYProyeccion(): Observable<PeriodoAcademicoDto[]> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.obtenerPeriodos().pipe(
            map(periodos => (periodos || [])
                .filter(p => p.estado === 'ACTIVO' || p.estado === 'PROYECCION')
                .map(p => ({ ...p, año: p.anio, periodo: p.tagPeriodo }))
            ),
            catchError(err => {
                this._error.next({
                    mensaje: 'No se pudieron cargar los períodos académicos.',
                    codigoError: 'FE-PERIODOS-ACT-PROY',
                    codigoHttp: err.status || 500,
                    url: err.url || '',
                    metodo: 'GET'
                });
                return throwError(() => err);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    obtenerAniosParaReportePorGrupos(): Observable<PeriodoAcademicoDto[]> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.obtenerPeriodos().pipe(
            map(periodos => (periodos || [])
                .filter(p => p.estado === 'ACTIVO' || p.estado === 'FINALIZADO' || p.estado === 'PROYECCION')
                .map(p => ({ ...p, año: p.anio, periodo: p.tagPeriodo }))
            ),
            catchError(err => {
                this._error.next({
                    mensaje: 'No se pudieron cargar los períodos académicos.',
                    codigoError: 'FE-PERIODOS-GRUPOS',
                    codigoHttp: err.status || 500,
                    url: err.url || '',
                    metodo: 'GET'
                });
                return throwError(() => err);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    obtenerPeriodosActivosYFinalizados(): Observable<PeriodoAcademicoDto[]> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.obtenerPeriodosActivosYFinalizados().pipe(
            map(periodos => (periodos || []).map(p => ({ ...p, año: p.anio, periodo: p.tagPeriodo }))),
            catchError(err => {
                this._error.next({
                    mensaje: 'No se pudieron cargar los períodos académicos.',
                    codigoError: 'FE-PERIODOS-ACT-FIN',
                    codigoHttp: err.status || 500,
                    url: err.url || '',
                    metodo: 'GET'
                });
                return throwError(() => err);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    obtenerPeriodoProyeccion(): Observable<PeriodoAcademicoDto> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.obtenerPeriodoProyeccion().pipe(
            map(p => ({ ...p, año: p.anio, periodo: p.tagPeriodo })),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    proyectarPresupuesto(dto: ProyectarPresupuestoDTOPeticion): Observable<PeriodoAcademicoDto> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.proyectarPresupuesto(dto).pipe(
            map(p => ({ ...p, año: p.anio, periodo: p.tagPeriodo })),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    obtenerProyeccionEstudiantes(tagPeriodo?: number, anio?: number): Observable<ReporteProyeccionEstudiantes> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.obtenerProyeccionEstudiantes(tagPeriodo, anio).pipe(
            map(dto => this.mapper.mappearDeRespuestaAReporteProyeccionEstudiantes(dto)),
            tap(data => this._reporteProyeccionEstudiantes.next(data)),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarProyeccionEstudiante(proyeccion: ProyeccionEstudianteDTOPeticion, tagPeriodo?: number, anio?: number): Observable<ReporteProyeccionEstudiantes> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.actualizarProyeccionEstudiante(proyeccion, tagPeriodo, anio).pipe(
            map(dto => this.mapper.mappearDeRespuestaAReporteProyeccionEstudiantes(dto)),
            tap(data => this._reporteProyeccionEstudiantes.next(data)),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    crearEstudianteSimulado(dto: CrearEstudianteSimuladoDTOPeticion): Observable<ReporteProyeccionEstudiantes> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.crearEstudianteSimulado(dto).pipe(
            map(d => this.mapper.mappearDeRespuestaAReporteProyeccionEstudiantes(d)),
            tap(data => this._reporteProyeccionEstudiantes.next(data)),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarEstudianteSimulado(id: number, dto: ActualizarEstudianteSimuladoDTOPeticion): Observable<ReporteProyeccionEstudiantes> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.actualizarEstudianteSimulado(id, dto).pipe(
            map(d => this.mapper.mappearDeRespuestaAReporteProyeccionEstudiantes(d)),
            tap(data => this._reporteProyeccionEstudiantes.next(data)),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    eliminarEstudianteSimulado(id: number): Observable<ReporteProyeccionEstudiantes> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.eliminarEstudianteSimulado(id).pipe(
            map(d => this.mapper.mappearDeRespuestaAReporteProyeccionEstudiantes(d)),
            tap(data => this._reporteProyeccionEstudiantes.next(data)),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    obtenerReporteFinanciero(tagPeriodo: number, anio: number): Observable<ReporteEstudiantes> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.obtenerReporteFinanciero(tagPeriodo, anio).pipe(
            map(dto => ({
                ...this.mapper.mappearDeRespuestaAReporteEstudiantes(dto),
                objConfiguracion: this.mapper.mappearDeRespuestaAConfiguracionReporteFinanciero(dto.configuracion)
            })),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarConfiguracionProyeccion(config: ConfiguracionReporteFinancieroDTOPeticion): Observable<ReporteProyeccionEstudiantes> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.obtenerPeriodoProyeccion().pipe(
            switchMap(periodo =>
                this.apiService.obtenerIdConfiguracionReporteFinanciero(periodo.tagPeriodo, periodo.anio).pipe(
                    switchMap(id => this.apiService.actualizarConfiguracionReporteFinanciero(id, config))
                )
            ),
            map(dto => this.mapper.mappearDeRespuestaAReporteProyeccionEstudiantes(dto)),
            tap(data => this._reporteProyeccionEstudiantes.next(data)),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarConfiguracionReporteFinanciero(
        config: ConfiguracionReporteFinancieroDTOPeticion,
        tagPeriodo: number,
        anio: number
    ): Observable<ReporteProyeccionEstudiantes> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.obtenerIdConfiguracionReporteFinanciero(tagPeriodo, anio).pipe(
            switchMap(id => this.apiService.actualizarConfiguracionReporteFinanciero(id, config)),
            map(dto => this.mapper.mappearDeRespuestaAReporteProyeccionEstudiantes(dto)),
            tap(data => this._reporteProyeccionEstudiantes.next(data)),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    obtenerReporteGrupos(anio: number): Observable<ReportePorGrupos> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.obtenerReportePorGrupos(anio).pipe(
            map(dto => this.mapper.mappearDeRespuestaAReportePorGrupos(dto)),
            tap(data => this._reporteGrupos.next(data)),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarParticipacionGrupo(dto: ActualizarParticipacionDTOPeticion): Observable<ReportePorGrupos> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.actualizarParticipacionGrupo(dto).pipe(
            map(d => this.mapper.mappearDeRespuestaAReportePorGrupos(d)),
            tap(data => this._reporteGrupos.next(data)),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarPorcentajeAUIUniversidad(periodoAcademicoId: number, porcentaje: number): Observable<ReportePorGrupos> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.actualizarPorcentajeAUI(periodoAcademicoId, porcentaje).pipe(
            map(dto => this.mapper.mappearDeRespuestaAReportePorGrupos(dto)),
            tap(data => this._reporteGrupos.next(data)),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarValorExcedentesMaestria(periodoAcademicoId: number, valor: number): Observable<ReportePorGrupos> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.actualizarExcedentesMaestria(periodoAcademicoId, valor).pipe(
            map(dto => this.mapper.mappearDeRespuestaAReportePorGrupos(dto)),
            tap(data => this._reporteGrupos.next(data)),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    crearGastoGeneral(periodoAcademicoId: number, gasto: GastoGeneralDTOPeticion): Observable<ReportePorGrupos> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.crearGastoGeneral(periodoAcademicoId, gasto).pipe(
            map(dto => this.mapper.mappearDeRespuestaAReportePorGrupos(dto)),
            tap(data => this._reporteGrupos.next(data)),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarGastoGeneral(id: number, periodoAcademicoId: number, gasto: GastoGeneralDTOPeticion): Observable<ReportePorGrupos>;
    actualizarGastoGeneral(gastoConId: { idGastoGeneral: number; periodoAcademicoId: number; categoria: string; descripcion: string; monto: number }): Observable<ReportePorGrupos>;
    actualizarGastoGeneral(
        idOrGasto: number | { idGastoGeneral: number; periodoAcademicoId: number; categoria: string; descripcion: string; monto: number },
        periodoAcademicoIdOrGasto?: number,
        gasto?: GastoGeneralDTOPeticion
    ): Observable<ReportePorGrupos> {
        this._loading.next(true);
        this._error.next(null);
        let id: number;
        let periodoId: number;
        let dto: GastoGeneralDTOPeticion;
        if (typeof idOrGasto === 'number') {
            id = idOrGasto;
            periodoId = periodoAcademicoIdOrGasto!;
            dto = gasto!;
        } else {
            id = idOrGasto.idGastoGeneral;
            periodoId = idOrGasto.periodoAcademicoId;
            dto = { categoria: idOrGasto.categoria, descripcion: idOrGasto.descripcion, monto: idOrGasto.monto, idConfiguracionReporteGrupos: 0 };
        }
        return this.apiService.actualizarGastoGeneral(id, periodoId, dto).pipe(
            map(d => this.mapper.mappearDeRespuestaAReportePorGrupos(d)),
            tap(data => this._reporteGrupos.next(data)),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    eliminarGastoGeneral(id: number, periodoAcademicoId: number): Observable<ReportePorGrupos> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.eliminarGastoGeneral(id, periodoAcademicoId).pipe(
            map(dto => this.mapper.mappearDeRespuestaAReportePorGrupos(dto)),
            tap(data => this._reporteGrupos.next(data)),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarPorcentajeItems(items: { item1: number; item2: number }, periodoAcademicoId: number): Observable<ReportePorGrupos> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.actualizarItems(periodoAcademicoId, items.item1, items.item2).pipe(
            map(dto => this.mapper.mappearDeRespuestaAReportePorGrupos(dto)),
            tap(data => this._reporteGrupos.next(data)),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarPorcentajeImprevistos(periodoAcademicoId: number, valor: number): Observable<ReportePorGrupos> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.actualizarImprevistos(periodoAcademicoId, valor).pipe(
            map(dto => this.mapper.mappearDeRespuestaAReportePorGrupos(dto)),
            tap(data => this._reporteGrupos.next(data)),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarVigenciasAnterioresGrupo(periodoAcademicoId: number, grupoId: number, valor: number): Observable<ReportePorGrupos> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.actualizarVigenciasAnterioresGrupo(periodoAcademicoId, grupoId, valor).pipe(
            map(dto => this.mapper.mappearDeRespuestaAReportePorGrupos(dto)),
            tap(data => this._reporteGrupos.next(data)),
            catchError(err => { this._error.next(err); return throwError(() => err); }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarValorVigenciasAnteriores(_valoresGrupo: { idGrupo: string; nombreGrupo: string; valor: number }[]): Observable<ReportePorGrupos> {
        return new Observable<ReportePorGrupos>(obs => {
            if (this._reporteGrupos.value) { obs.next(this._reporteGrupos.value); }
            obs.complete();
        });
    }
}
