import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { matricula_academica } from 'src/environments/environment';

export interface Curso {
    id: number;
    grupo: string;
    asignatura: string;
    docente: string;
    fecha: string;
}

@Injectable({ providedIn: 'root' })
export class CursoService {
    // Helper para formatear fechas 'YYYY-MM-DD' a 'DD/MM/YYYY'
    private static formatDateString(dateStr: string): string {
        if (!dateStr) return '';
        // soporta formatos YYYY-MM-DD o ISO
        const parts = dateStr.split('T')[0].split('-');
        if (parts.length !== 3) return dateStr;
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    }

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

    private readonly backend = `${matricula_academica.api_url}cursos`;

    constructor(private readonly http: HttpClient) {}

    getCursos(): Observable<ApiResponse<Curso[]>> {
        return this.http.get<ApiResponse<any>>(this.backend).pipe(
            map((resp) => ({
                typeResponse: resp.typeResponse,
                message: resp.message,
                statusCode: resp.statusCode,
                data: (resp.data || []).map((item: any) => ({
                    id: Number(item.id),
                    grupo: item.grupo,
                    // asignatura viene como objeto { id, nombre, ... }
                    asignatura:
                        item.asignatura?.nombre ??
                        String(item.asignatura ?? ''),
                    // docentes es un array; preferimos nombre+apellido si existen, si no usamos el código
                    docente: (item.docentes || [])
                        .map((d: any) => {
                            const nombreCompleto = `${d.nombre ?? ''} ${
                                d.apellido ?? ''
                            }`.trim();
                            return (
                                nombreCompleto ||
                                d.codigo ||
                                d.correoElectronico ||
                                ''
                            );
                        })
                        .filter((v: string) => !!v)
                        .join(', '),
                    // no hay campo 'fecha' directo; usamos fechaInicio del periodo si está
                    fecha: CursoService.formatDateString(
                        item.periodo?.fechaInicio ?? item.fecha ?? ''
                    ),
                })),
            })),
            // En caso de error devolvemos el mock para no romper la UI en desarrollo
            catchError(() =>
                of({
                    typeResponse: 'SUCCESS',
                    message: 'Cursos cargados desde mock (fallback)',
                    data: this.cursos.map((c) => ({
                        ...c,
                        fecha: CursoService.formatDateString(c.fecha),
                    })),
                    statusCode: 200,
                } as ApiResponse<Curso[]>)
            )
        );
    }

    crearCurso(curso: Omit<Curso, 'id'>): Observable<ApiResponse<Curso>> {
        const payload = {
            grupo: curso.grupo,
            asignatura: curso.asignatura,
            docente: curso.docente,
            fecha: curso.fecha,
        };
        return this.http.post<ApiResponse<Curso>>(this.backend, payload);
    }

    actualizarCurso(
        id: number | string,
        curso: Omit<Curso, 'id'>
    ): Observable<ApiResponse<Curso>> {
        const payload = {
            grupo: curso.grupo,
            asignatura: curso.asignatura,
            docente: curso.docente,
            fecha: curso.fecha,
        };
        return this.http.put<ApiResponse<Curso>>(
            `${this.backend}/${id}`,
            payload
        );
    }

    eliminarCurso(id: number | string): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.backend}/${id}`);
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
