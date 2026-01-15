import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models/api-response.model';
import { matricula_academica } from 'src/environments/environment';
import { MatriculaResumenBackend } from '../models/matricula.model';

@Injectable({ providedIn: 'root' })
export class MatriculaResumenService {
    private readonly endpoint = `${matricula_academica.api_url}matricula`;

    constructor(private readonly http: HttpClient) {}

    // Endpoint: obtener resumen de matriculas por periodo
    getMatriculasResumen(
        periodoId: number | string,
        estudianteId?: number | string,
        asignatura?: string
    ): Observable<ApiResponse<MatriculaResumenBackend[]>> {
        let params = new HttpParams();
        params = params.set('periodoId', String(periodoId));
        if (
            estudianteId !== undefined &&
            estudianteId !== null &&
            `${estudianteId}` !== ''
        ) {
            params = params.set('estudiante', String(estudianteId));
        }
        if (asignatura) {
            params = params.set('asignatura', asignatura);
        }
        return this.http.get<ApiResponse<MatriculaResumenBackend[]>>(
            this.endpoint,
            { params }
        );
    }
}
