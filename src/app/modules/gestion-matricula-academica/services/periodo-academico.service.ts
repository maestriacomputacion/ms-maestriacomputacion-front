import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { matricula_academica } from 'src/environments/environment';
import { PeriodoAcademico } from '../models/periodo-academico.model';

const backendPeriodoAcademico = (path: string = '') =>
    `${matricula_academica.api_url}periodos${path ? '/' + path : ''}`;

@Injectable({ providedIn: 'root' })
export class PeriodoAcademicoService {
    constructor(private readonly http: HttpClient) {}

    getPeriodos(): Observable<ApiResponse<PeriodoAcademico[]>> {
        return this.http
            .get<ApiResponse<PeriodoAcademico[]>>(backendPeriodoAcademico())
            .pipe(
                map((resp) => ({
                    typeResponse: resp.typeResponse,
                    message: resp.message,
                    statusCode: resp.statusCode,
                    data: (resp.data || []).map((item: any) => ({
                        id: String(item.id),
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

    eliminarPeriodo(id: string): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(backendPeriodoAcademico(id));
    }

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
}
