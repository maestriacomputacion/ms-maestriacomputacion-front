import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { matricula_academica } from 'src/environments/environment';
import {
    MatriculaBatchPayload,
    MatriculaResponseData,
} from '../models/matricula.model';

@Injectable({ providedIn: 'root' })
export class MatriculaMasivaService {
    private readonly endpoint = `${matricula_academica.api_url}matricula/batch`;

    constructor(private readonly http: HttpClient) {}

    // Endpoint: matricular masivamente estudiantes en cursos
    matricularMasivo(
        payload: MatriculaBatchPayload
    ): Observable<ApiResponse<MatriculaResponseData>> {
        return this.http.post<ApiResponse<MatriculaResponseData>>(
            this.endpoint,
            payload
        );
    }
}
