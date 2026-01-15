import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { matricula_academica } from 'src/environments/environment';
import { MatriculaResponseData } from '../models/matricula.model';

export interface MatriculaEstudianteCurso {
    estudianteId: number;
    cursos: { cursoId: number }[];
}

export interface MatriculaBatchPayload {
    matriculaEstudianteCursos: MatriculaEstudianteCurso[];
}

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
