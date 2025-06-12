import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface CursoOfertado {
    id: number;
    grupo: string;
    asignatura: string;
    docente: string;
    horario: string;
}

@Injectable({ providedIn: 'root' })
export class CursoOfertadoService {
    private readonly cursosOfertados: CursoOfertado[] = [
        {
            id: 1,
            grupo: 'Grupo A',
            asignatura: 'Metodología de la Investigación',
            docente: 'Andrés Pérez',
            horario: 'Lunes 8:00 AM - 10:00 AM SALA 1',
        },
        {
            id: 2,
            grupo: 'Grupo B',
            asignatura: 'Seminario de Matemáticas',
            docente: 'Laura Gómez',
            horario: 'Martes 10:00 AM - 12:00 PM SALA 2',
        },
        {
            id: 3,
            grupo: 'Grupo C',
            asignatura: 'Gestión de la Tecnología e Innovación',
            docente: 'Carlos Rodríguez',
            horario: 'Miércoles 2:00 PM - 4:00 PM SALA 3',
        },
        {
            id: 4,
            grupo: 'Grupo C',
            asignatura: 'Aprendizaje profundo (Electiva)',
            docente: 'Felipe Martínez',
            horario: 'Jueves 6:00 PM - 8:00 PM SALA 4',
        },
        {
            id: 5,
            grupo: 'Grupo A',
            asignatura: 'Trabajo de Grado 1',
            docente: 'Andrés Castillo',
            horario: 'Viernes 8:00 AM - 12:00 PM SALA 5',
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
            label: 'Gestión de la Tecnología e Innovación',
            value: 'Gestión de la Tecnología e Innovación',
        },
        {
            label: 'Aprendizaje profundo (Electiva)',
            value: 'Aprendizaje profundo (Electiva)',
        },
        { label: 'Trabajo de Grado 1', value: 'Trabajo de Grado 1' },
    ];

    getCursosOfertados(): Observable<ApiResponse<CursoOfertado[]>> {
        return of({
            typeResponse: 'SUCCESS',
            message: 'Cursos ofertados cargados correctamente',
            data: this.cursosOfertados,
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
