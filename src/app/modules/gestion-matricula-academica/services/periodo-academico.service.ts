import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { matricula_academica } from 'src/environments/environment';
import { PeriodoAcademico } from '../models/periodo-academico.model';

const backendPeriodoAcademico = (path: string = '') =>
    `${matricula_academica.api_url}periodos${path ? '/' + path : ''}`;
type PeriodoAcademicoBackend = Omit<PeriodoAcademico, 'id'> & {
    id: string | number | null;
};

@Injectable({ providedIn: 'root' })
export class PeriodoAcademicoService {
    constructor(private readonly http: HttpClient) {}

    // Endpoint: listar periodos academicos
    getPeriodos(): Observable<ApiResponse<PeriodoAcademico[]>> {
        return this.http
            .get<
                ApiResponse<PeriodoAcademicoBackend[]>
            >(backendPeriodoAcademico())
            .pipe(
                map((resp) => ({
                    typeResponse: resp.typeResponse,
                    message: resp.message,
                    statusCode: resp.statusCode,
                    data: (resp.data || []).map((item) => ({
                        id:
                            item.id !== undefined && item.id !== null
                                ? String(item.id)
                                : '',
                        fechaInicio: item.fechaInicio,
                        fechaFin: item.fechaFin,
                        fechaFinMatricula: item.fechaFinMatricula,
                        tagPeriodo: item.tagPeriodo,
                        descripcion: item.descripcion,
                        estado: item.estado,
                    })),
                }))
            );
    }

    // Endpoint: crear un periodo academico
    crearPeriodo(
        periodo: Omit<PeriodoAcademico, 'id'>
    ): Observable<ApiResponse<PeriodoAcademico>> {
        const payload = {
            fechaInicio: periodo.fechaInicio,
            fechaFin: periodo.fechaFin,
            fechaFinMatricula: periodo.fechaFinMatricula,
            tagPeriodo: periodo.tagPeriodo,
            descripcion: periodo.descripcion,
            estado: periodo.estado,
        };
        return this.http.post<ApiResponse<PeriodoAcademico>>(
            backendPeriodoAcademico(),
            payload
        );
    }

    // Endpoint: actualizar un periodo academico
    actualizarPeriodo(
        id: string,
        periodo: Omit<PeriodoAcademico, 'id'>
    ): Observable<ApiResponse<PeriodoAcademico>> {
        const payload = {
            fechaInicio: periodo.fechaInicio,
            fechaFin: periodo.fechaFin,
            fechaFinMatricula: periodo.fechaFinMatricula,
            tagPeriodo: periodo.tagPeriodo,
            descripcion: periodo.descripcion,
            estado: periodo.estado,
        };
        return this.http.put<ApiResponse<PeriodoAcademico>>(
            backendPeriodoAcademico(id),
            payload
        );
    }

    // Endpoint: eliminar un periodo academico
    eliminarPeriodo(id: string): Observable<ApiResponse<unknown>> {
        return this.http.delete<ApiResponse<unknown>>(
            backendPeriodoAcademico(id)
        );
    }

    // Endpoint: validar rango de fechas para un periodo
    validarFechasPeriodo(
        fechaInicio: string,
        fechaFin: string
    ): Observable<ApiResponse<boolean>> {
        const params = {
            fechaInicio,
            fechaFin,
        };
        return this.http.get<ApiResponse<boolean>>(
            backendPeriodoAcademico('validar-fechas'),
            { params }
        );
    }

    // Endpoint: obtener periodo academico activo
    getPeriodoActivo(): Observable<ApiResponse<PeriodoAcademico | null>> {
        return this.http.get<ApiResponse<PeriodoAcademico | null>>(
            backendPeriodoAcademico('activo')
        );
    }

    // Endpoint: precargar cursos de un periodo
    precargarCursos(payload: {
        idPeriodo: string | number;
        idPeriodoPrecarga: string | number;
    }): Observable<ApiResponse<unknown>> {
        return this.http.post<ApiResponse<unknown>>(
            backendPeriodoAcademico('precargarCursos'),
            {
                idPeriodo: payload.idPeriodo,
                idPeriodoPrecarga: payload.idPeriodoPrecarga,
            }
        );
    }
}
