import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models/api-response.model';
import { matricula_academica } from 'src/environments/environment';
import { Estudiante } from '../../gestion-estudiantes/models/estudiante';

export interface EstudianteMatriculado {
    id: number;
    estudiante: Estudiante;
    estado: string;
    observacion: string;
}

@Injectable({
    providedIn: 'root',
})
export class MatriculaEstudiantesService {
    constructor(private readonly http: HttpClient) {}

    getEstudiantesByCurso(
        cursoId: number | string
    ): Observable<ApiResponse<Estudiante[]>> {
        const url = `${matricula_academica.api_url}matricula/curso/${cursoId}/estudiantes`;
        return this.http.get<ApiResponse<Estudiante[]>>(url);
    }

    getEstudiantesMatriculados(
        cursoId: number | string
    ): Observable<ApiResponse<EstudianteMatriculado[]>> {
        const url = `${matricula_academica.api_url}matricula/estudiantes-matriculados/${cursoId}`;
        return this.http.get<ApiResponse<EstudianteMatriculado[]>>(url);
    }
}
