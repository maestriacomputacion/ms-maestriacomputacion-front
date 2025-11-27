import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { GestionInformacionPresupuestariaApiService } from './api.service';
import { ApiError } from '../models/api-error';
import { ConfiguracionReporteFinancieroDTOPeticion } from '../models/configuracion-reporte-financiero.dto';
import { ProyeccionEstudianteDTOPeticion } from '../models/proyeccion-estudiante.dto';
import { PeriodoAcademicoDTOPeticion } from '../models/periodo-academico.dto';
import { PorcentajeGrupoDTOPeticion } from '../models/porcentaje-grupo.dto';
import { GastoGeneralDTOPeticion } from '../models/gasto-general.dto';
import { ItemsDTOPeticion } from '../models/items.dto';
import { ValorGrupoDTOPeticion } from '../models/valor-grupo.dto';
import { ReporteProyeccionEstudiantes } from '../models/domain-models';
import { ConfiguracionReporteGrupos } from '../models/domain-models';

@Injectable({
    providedIn: 'root'
})
export class GestionInformacionPresupuestariaFacadeService {

    // State using BehaviorSubject
    private _loading = new BehaviorSubject<boolean>(false);
    public loading$ = this._loading.asObservable();

    private _error = new BehaviorSubject<ApiError | null>(null);
    public error$ = this._error.asObservable();

    private _reporteProyeccionEstudiantes = new BehaviorSubject<ReporteProyeccionEstudiantes | null>(null);
    public reporteProyeccionEstudiantes$ = this._reporteProyeccionEstudiantes.asObservable();

    private _reporteGrupos = new BehaviorSubject<ConfiguracionReporteGrupos | null>(null);
    public reporteGrupos$ = this._reporteGrupos.asObservable();

    constructor(private apiService: GestionInformacionPresupuestariaApiService) { }

    // Methods

    actualizarConfiguracionProyeccion(config: ConfiguracionReporteFinancieroDTOPeticion): Observable<any> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.actualizarConfiguracionProyeccion(config).pipe(
            tap(() => {
                // Update local state if necessary or reload data
            }),
            catchError(error => {
                this._error.next(error);
                return throwError(() => error);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarProyeccionEstudiante(proyeccion: ProyeccionEstudianteDTOPeticion): Observable<any> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.actualizarProyeccionEstudiante(proyeccion).pipe(
            catchError(error => {
                this._error.next(error);
                return throwError(() => error);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    obtenerReporteFinanciero(periodo: PeriodoAcademicoDTOPeticion): Observable<any> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.obtenerReporteFinanciero(periodo).pipe(
            catchError(error => {
                this._error.next(error);
                return throwError(() => error);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    obtenerProyeccionEstudiantes(): Observable<ReporteProyeccionEstudiantes> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.obtenerProyeccionEstudiantes().pipe(
            map(dto => dto as unknown as ReporteProyeccionEstudiantes),
            tap(data => this._reporteProyeccionEstudiantes.next(data)),
            catchError(error => {
                this._error.next(error);
                return throwError(() => error);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    obtenerReporteGrupos(periodo: PeriodoAcademicoDTOPeticion): Observable<ConfiguracionReporteGrupos> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.obtenerReporteGrupos(periodo).pipe(
            map(dto => dto as unknown as ConfiguracionReporteGrupos),
            tap(data => this._reporteGrupos.next(data)),
            catchError(error => {
                this._error.next(error);
                return throwError(() => error);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarPorcentajeParticipacionPrimerSemestre(porcentajes: PorcentajeGrupoDTOPeticion[]): Observable<ConfiguracionReporteGrupos> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.actualizarPorcentajeParticipacionPrimerSemestre(porcentajes).pipe(
            map(dto => dto as unknown as ConfiguracionReporteGrupos),
            tap(data => this._reporteGrupos.next(data)),
            catchError(error => {
                this._error.next(error);
                return throwError(() => error);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarPorcentajeParticipacionSegundoSemestre(porcentajes: PorcentajeGrupoDTOPeticion[]): Observable<ConfiguracionReporteGrupos> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.actualizarPorcentajeParticipacionSegundoSemestre(porcentajes).pipe(
            map(dto => dto as unknown as ConfiguracionReporteGrupos),
            tap(data => this._reporteGrupos.next(data)),
            catchError(error => {
                this._error.next(error);
                return throwError(() => error);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarPorcentajeAUIUniversidad(nuevoValor: number): Observable<ConfiguracionReporteGrupos> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.actualizarPorcentajeAUIUniversidad(nuevoValor).pipe(
            map(dto => dto as unknown as ConfiguracionReporteGrupos),
            tap(data => this._reporteGrupos.next(data)),
            catchError(error => {
                this._error.next(error);
                return throwError(() => error);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarValorExcedentesMaestria(nuevoValor: number): Observable<ConfiguracionReporteGrupos> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.actualizarValorExcedentesMaestria(nuevoValor).pipe(
            map(dto => dto as unknown as ConfiguracionReporteGrupos),
            tap(data => this._reporteGrupos.next(data)),
            catchError(error => {
                this._error.next(error);
                return throwError(() => error);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarGastoGeneral(gasto: GastoGeneralDTOPeticion): Observable<any> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.actualizarGastoGeneral(gasto).pipe(
            tap(() => {
                // Ideally reload reporteGrupos or update local state
            }),
            catchError(error => {
                this._error.next(error);
                return throwError(() => error);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    crearGastoGeneral(gasto: GastoGeneralDTOPeticion): Observable<any> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.crearGastoGeneral(gasto).pipe(
            tap(() => {
                // Ideally reload reporteGrupos or update local state
            }),
            catchError(error => {
                this._error.next(error);
                return throwError(() => error);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    eliminarGastoGeneral(idGastoGeneral: number): Observable<boolean> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.eliminarGastoGeneral(idGastoGeneral).pipe(
            tap(() => {
                // Ideally reload reporteGrupos or update local state
            }),
            catchError(error => {
                this._error.next(error);
                return throwError(() => error);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarPorcentajeItems(items: ItemsDTOPeticion): Observable<ConfiguracionReporteGrupos> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.actualizarPorcentajeItems(items).pipe(
            map(dto => dto as unknown as ConfiguracionReporteGrupos),
            tap(data => this._reporteGrupos.next(data)),
            catchError(error => {
                this._error.next(error);
                return throwError(() => error);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarPorcentajeImprevistos(nuevoValor: number): Observable<ConfiguracionReporteGrupos> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.actualizarPorcentajeImprevistos(nuevoValor).pipe(
            map(dto => dto as unknown as ConfiguracionReporteGrupos),
            tap(data => this._reporteGrupos.next(data)),
            catchError(error => {
                this._error.next(error);
                return throwError(() => error);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    actualizarValorVigenciasAnteriores(valoresGrupo: ValorGrupoDTOPeticion[]): Observable<ConfiguracionReporteGrupos> {
        this._loading.next(true);
        this._error.next(null);
        return this.apiService.actualizarValorVigenciasAnteriores(valoresGrupo).pipe(
            map(dto => dto as unknown as ConfiguracionReporteGrupos),
            tap(data => this._reporteGrupos.next(data)),
            catchError(error => {
                this._error.next(error);
                return throwError(() => error);
            }),
            finalize(() => this._loading.next(false))
        );
    }
}
