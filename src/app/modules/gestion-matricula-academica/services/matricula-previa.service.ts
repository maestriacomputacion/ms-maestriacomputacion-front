import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
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

    getAsignaturasMatricular(): Observable<
        ApiResponse<AsignaturaMatricular[]>
    > {
        return of({
            typeResponse: 'SUCCESS',
            message: 'Asignaturas para matricular cargadas correctamente',
            data: this.asignaturasMatricular,
            statusCode: 200,
        });
    }

    matricularEstudiante(payload: {
        estudianteId: number;
        cursos: { cursoId: number; observacion: string }[];
    }): Observable<ApiResponse<any>> {
        const url = `${matricula_academica.api_url}matricula/estudiante`;
        return this.http.post<ApiResponse<any>>(url, payload);
    }
}
