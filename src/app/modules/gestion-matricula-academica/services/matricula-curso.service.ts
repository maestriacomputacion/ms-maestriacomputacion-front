import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models/api-response.model';
import { matricula_academica } from 'src/environments/environment';
import {
    EstudianteMatriculado,
    MatriculaEstudiantesRequest,
    MatriculaResponseData,
} from '../models/matricula.model';
import { Estudiante } from '../../gestion-estudiantes/models/estudiante';

@Injectable({
    providedIn: 'root',
})
export class MatriculaCursoService {
    constructor(private readonly http: HttpClient) {}

    // Endpoint: listar estudiantes matriculados en un curso
    getEstudiantesMatriculados(
        cursoId: number | string
    ): Observable<ApiResponse<EstudianteMatriculado[]>> {
        const url = `${matricula_academica.api_url}matricula/estudiantes-matriculados/${cursoId}`;
        return this.http.get<ApiResponse<EstudianteMatriculado[]>>(url);
    }

    // Endpoint: listar estudiantes disponibles por asignatura
    getEstudiantesDisponiblesPorAsignatura(
        asignaturaId: number | string
    ): Observable<ApiResponse<Estudiante[]>> {
        const url = `${matricula_academica.api_url}cursos/disponibles-estudiantes/asignatura/${asignaturaId}`;
        return this.http.get<ApiResponse<Estudiante[]>>(url);
    }

    // Endpoint: validar si un estudiante puede matricularse en un curso
    validarMatriculaEnCurso(
        estudianteId: number,
        cursoId: number
    ): Observable<ApiResponse<boolean>> {
        const url = `${matricula_academica.api_url}matricula/validar`;
        let params = new HttpParams();
        params = params.set('estudianteId', String(estudianteId));
        params = params.set('cursoId', String(cursoId));
        return this.http.get<ApiResponse<boolean>>(url, { params });
    }

    // Endpoint: matricular estudiantes en un curso
    matricularEstudiantesEnCurso(
        payload: MatriculaEstudiantesRequest
    ): Observable<ApiResponse<MatriculaResponseData>> {
        const url = `${matricula_academica.api_url}matricula/curso`;
        return this.http.post<ApiResponse<MatriculaResponseData>>(url, payload);
    }

    // Endpoint: cancelar una matricula por id
    cancelarMatricula(
        matriculaId: number,
        motivo: string
    ): Observable<ApiResponse<null>> {
        const url = `${matricula_academica.api_url}matricula/${matriculaId}/cancelar`;
        return this.http.put<ApiResponse<null>>(url, { motivo });
    }
}
