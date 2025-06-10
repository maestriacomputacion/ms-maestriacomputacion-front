import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface Curso {
    id: number;
    grupo: string;
    asignatura: string;
    docente: string;
    fecha: string;
}

@Injectable({ providedIn: 'root' })
export class CursoService {
    private readonly cursos: Curso[] = [
        {
            id: 1,
            grupo: 'Grupo A',
            asignatura: 'Metodología de la Investigación',
            docente: 'Andrés Pérez',
            fecha: '2025-01-15',
        },
        {
            id: 2,
            grupo: 'Grupo B',
            asignatura: 'Seminario de Matemáticas',
            docente: 'Laura Gómez',
            fecha: '2025-01-16',
        },
        {
            id: 3,
            grupo: 'Grupo B',
            asignatura: 'Gestión de la Tecnología',
            docente: 'Carlos Rodríguez',
            fecha: '2025-01-17',
        },
        {
            id: 4,
            grupo: 'Grupo A',
            asignatura: 'Electiva: Aprendizaje profundo',
            docente: 'Felipe Martínez',
            fecha: '2025-01-18',
        },
        {
            id: 5,
            grupo: 'Grupo A',
            asignatura: 'Trabajo de Grado 1',
            docente: 'Andrés Castilloh',
            fecha: '2025-01-19',
        },
    ];

    private readonly areasFormacion = [
        { label: 'Ciencias Básicas', value: 'Ciencias Básicas' },
        { label: 'Ingeniería', value: 'Ingeniería' },
        { label: 'Humanidades', value: 'Humanidades' },
    ];

    private readonly asignaturas = [
        {
            label: 'Metodología de la Investigación',
            value: 'Metodología de la Investigación',
        },
        {
            label: 'Seminario de Matemáticas',
            value: 'Seminario de Matemáticas',
        },
        {
            label: 'Gestión de la Tecnología',
            value: 'Gestión de la Tecnología',
        },
        {
            label: 'Electiva: Aprendizaje profundo',
            value: 'Electiva: Aprendizaje profundo',
        },
        { label: 'Trabajo de Grado 1', value: 'Trabajo de Grado 1' },
    ];

    getCursos(): Observable<ApiResponse<Curso[]>> {
        return of({
            typeResponse: 'SUCCESS',
            message: 'Cursos cargados correctamente',
            data: this.cursos,
            statusCode: 200,
        });
    }

    getAreasFormacion(): Observable<
        ApiResponse<{ label: string; value: string }[]>
    > {
        return of({
            typeResponse: 'SUCCESS',
            message: 'Áreas de formación cargadas correctamente',
            data: this.areasFormacion,
            statusCode: 200,
        });
    }

    getAsignaturas(): Observable<
        ApiResponse<{ label: string; value: string }[]>
    > {
        return of({
            typeResponse: 'SUCCESS',
            message: 'Asignaturas cargadas correctamente',
            data: this.asignaturas,
            statusCode: 200,
        });
    }
}
