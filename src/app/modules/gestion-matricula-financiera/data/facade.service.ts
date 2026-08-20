import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { GestionMatriculaFinancieraApiService } from './api.service';
import { GestionMatriculaFinancieraMapperService } from './mapper.service';
import { Estudiante, PeriodoAcademico } from '../models/domain-models';
import { ApiError } from '../dto/api-error';

@Injectable()
export class GestionMatriculaFinancieraFacadeService {

    private _loading = new BehaviorSubject<boolean>(false);
    public loading$ = this._loading.asObservable();

    private _error = new BehaviorSubject<ApiError | null>(null);
    public error$ = this._error.asObservable();

    private _estudiantes = new BehaviorSubject<Estudiante[]>([]);
    public estudiantes$ = this._estudiantes.asObservable();

    private _estudianteSeleccionado = new BehaviorSubject<Estudiante | null>(null);
    public estudianteSeleccionado$ = this._estudianteSeleccionado.asObservable();

    private _periodos = new BehaviorSubject<PeriodoAcademico[]>([]);
    public periodos$ = this._periodos.asObservable();

    private _periodoSeleccionadoFiltro = new BehaviorSubject<PeriodoAcademico | null>(null);
    public periodoSeleccionadoFiltro$ = this._periodoSeleccionadoFiltro.asObservable();

    private _semestreSeleccionadoFiltro = new BehaviorSubject<number | null>(0);
    public semestreSeleccionadoFiltro$ = this._semestreSeleccionadoFiltro.asObservable();

    private _fechaSeleccionadaFiltro = new BehaviorSubject<Date | null>(null);
    public fechaSeleccionadaFiltro$ = this._fechaSeleccionadaFiltro.asObservable();

    constructor(
        private apiService: GestionMatriculaFinancieraApiService,
        private mapper: GestionMatriculaFinancieraMapperService
    ) { }

    obtenerEstudiantes(periodo: PeriodoAcademico): Observable<Estudiante[]> {
        this._loading.next(true);
        this._error.next(null);
        const dtoPeticion = this.mapper.mappearDePeriodoAcademicoAPeticion(periodo);

        return this.apiService.obtenerEstudiantes(dtoPeticion).pipe(
            map(dtos => this.mapper.mappearDeListaRespuestaAEstudiante(dtos)),
            tap(estudiantes => this._estudiantes.next(estudiantes)),
            catchError(error => {
                this._error.next(error);
                return throwError(() => error);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    obtenerEstudiante(codigo: string): Observable<Estudiante> {
        this._loading.next(true);
        this._error.next(null);

        const periodo = this._periodoSeleccionadoFiltro.value;
        const tagPeriodo = periodo?.tagPeriodo ?? undefined;
        const anio = periodo?.año ?? (periodo?.fechaInicio ? new Date(periodo.fechaInicio).getFullYear() : undefined);

        return this.apiService.obtenerEstudiante(codigo, tagPeriodo, anio).pipe(
            map(dto => this.mapper.mappearDeRespuestaAEstudiante(dto)),
            tap(estudiante => this._estudianteSeleccionado.next(estudiante)),
            catchError(error => {
                this._error.next(error);
                return throwError(() => error);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    obtenerPeriodosAcademicos(): Observable<PeriodoAcademico[]> {
        this._loading.next(true);
        this._error.next(null);

        return this.apiService.obtenerPeriodosAcademicos().pipe(
            map(dtos => this.mapper.mappearDeListaRespuestaAPeriodoAcademico(dtos)),
            map(periodos => periodos.filter(p => p.estado !== 'INACTIVO')),
            tap(periodos => this._periodos.next(periodos)),
            catchError(error => {
                this._error.next(error);
                return throwError(() => error);
            }),
            finalize(() => this._loading.next(false))
        );
    }

    setPeriodoFiltro(periodo: PeriodoAcademico | null): void {
        this._periodoSeleccionadoFiltro.next(periodo);
    }

    getPeriodoFiltro(): PeriodoAcademico | null {
        return this._periodoSeleccionadoFiltro.value;
    }

    getPeriodosSync(): PeriodoAcademico[] {
        return this._periodos.value;
    }

    setSemestreFiltro(semestre: number | null): void {
        this._semestreSeleccionadoFiltro.next(semestre);
    }

    getSemestreFiltro(): number | null {
        return this._semestreSeleccionadoFiltro.value;
    }

    setFechaFiltro(fecha: Date | null): void {
        this._fechaSeleccionadaFiltro.next(fecha);
    }

    getFechaFiltro(): Date | null {
        return this._fechaSeleccionadaFiltro.value;
    }
}
