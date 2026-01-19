import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import {
    MatriculaRealizada,
    MatriculaResponseData,
} from '../models/matricula.model';
import { matricula_academica } from 'src/environments/environment';
import {
    Estudiante,
    AsignaturaMatricular,
} from '../models/matricula-previa.model';

@Injectable({ providedIn: 'root' })
export class MatriculaPreviaService {
    private readonly estudiante: Estudiante = {
        codigo: '20191006789',
        nombre: 'Juan Carlos',
        apellidos: 'González Pérez',
        director: 'Dr. María Elena Rodríguez',
        coDirector: 'Dr. Carlos Alberto Martínez',
        semestreAcademico: '2025-1',
    };

    // Lista inicial vacía — las asignaturas se agregarán al seleccionar desde las áreas
    private readonly asignaturasMatricular: AsignaturaMatricular[] = [];

    constructor(private readonly http: HttpClient) {}

    getEstudiante(): Observable<ApiResponse<Estudiante>> {
        return of({
            typeResponse: 'SUCCESS',
            message: 'Datos del estudiante cargados correctamente',
            data: this.estudiante,
            statusCode: 200,
        });
    }

    // Endpoint: registrar matricula previa de un estudiante
    matricularEstudiante(payload: {
        estudianteId: number;
        cursos: { cursoId: number; observacion: string }[];
    }): Observable<ApiResponse<MatriculaResponseData>> {
        const url = `${matricula_academica.api_url}matricula/estudiante`;
        return this.http.post<ApiResponse<MatriculaResponseData>>(url, payload);
    }

    // Endpoint: obtener matriculas de un estudiante
    getMatriculasEstudiante(
        estudianteId: number
    ): Observable<ApiResponse<MatriculaRealizada[]>> {
        const url = `${matricula_academica.api_url}matricula/estudiante/${estudianteId}`;
        return this.http.get<ApiResponse<MatriculaRealizada[]>>(url);
    }

    // Endpoint: cambiar estado de una matricula
    cambiarEstadoMatricula(
        matriculaId: number,
        estado: string
    ): Observable<ApiResponse<MatriculaRealizada>> {
        const url = `${matricula_academica.api_url}matricula/cambiar-estado/${matriculaId}`;
        return this.http.put<ApiResponse<MatriculaRealizada>>(url, { estado });
    }

    // Endpoint: cambiar estado masivo de matriculas por estudiantes
    cambiarEstadoMatriculaMasivo(payload: {
        estudiantesIds: number[];
        nuevoEstado: string;
    }): Observable<ApiResponse<unknown>> {
        const url = `${matricula_academica.api_url}matricula/cambiar-estado/masivo`;
        return this.http.post<ApiResponse<unknown>>(url, payload);
    }
}
