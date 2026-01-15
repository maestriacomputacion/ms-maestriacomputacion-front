import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import {
    MatriculaRealizada,
    MatriculaResponseData,
} from '../models/matricula.model';
import { matricula_academica } from 'src/environments/environment';

export interface Estudiante {
    codigo: string;
    nombre: string;
    apellidos: string;
    director: string;
    coDirector: string;
    semestreAcademico: string;
}

export interface AsignaturaMatricular {
    id: number;
    grupo: string;
    nombreAsignatura: string;
    docentes: string;
    opciones: string;
    observacion: string;
}

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

    constructor(private http: HttpClient) {}

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
}
