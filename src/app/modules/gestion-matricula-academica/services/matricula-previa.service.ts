import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

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

    private readonly asignaturasMatricular: AsignaturaMatricular[] = [
        {
            id: 1,
            grupo: 'Grupo A',
            nombreAsignatura: 'Metodología de la Investigación',
            opciones: 'Matricular',
            observacion: 'Curso requerido para el programa',
        },
        {
            id: 2,
            grupo: 'Grupo B',
            nombreAsignatura: 'Seminario de Matemáticas',
            opciones: 'Matricular',
            observacion: 'Prerrequisito: Cálculo Avanzado',
        },
        {
            id: 3,
            grupo: 'Grupo A',
            nombreAsignatura: 'Gestión de la Tecnología',
            opciones: 'Matricular',
            observacion: 'Curso fundamental del programa',
        },
        {
            id: 4,
            grupo: 'Grupo C',
            nombreAsignatura: 'Electiva: Aprendizaje Profundo',
            opciones: 'No Matricular',
            observacion: 'Requisito: conocimientos de programación',
        },
        {
            id: 5,
            grupo: 'Grupo A',
            nombreAsignatura: 'Trabajo de Grado 1',
            opciones: 'Matricular',
            observacion: 'Definir tema de investigación',
        },
    ];

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
}
