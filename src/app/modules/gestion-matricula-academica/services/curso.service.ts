import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { CursoUI } from '../models/curso.model';
import { matricula_academica } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class CursoService {
    // Formatea fechas 'YYYY-MM-DD' o ISO a 'DD/MM/YYYY'
    private static formatDateString(dateStr: string): string {
        if (!dateStr) return '';
        // soporta formatos YYYY-MM-DD o ISO
        const parts = dateStr.split('T')[0].split('-');
        if (parts.length !== 3) return dateStr;
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    }

    private readonly backend = `${matricula_academica.api_url}cursos`;

    constructor(private readonly http: HttpClient) {}

    getCursos(): Observable<ApiResponse<CursoUI[]>> {
        return this.http.get<ApiResponse<unknown>>(this.backend).pipe(
            map((resp) => ({
                typeResponse: resp.typeResponse,
                message: resp.message,
                statusCode: resp.statusCode,
                data: ((resp.data as any[]) || []).map((item: any) => ({
                    id: Number(item.id),
                    grupo: item.grupo,
                    asignatura:
                        item.asignatura?.nombre ??
                        String(item.asignatura ?? ''),
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
                    fecha: CursoService.formatDateString(
                        item.periodo?.fechaInicio ?? item.fecha ?? ''
                    ),
                })),
            })),
            // Fallback: devolver lista vacía en caso de error
            catchError(() =>
                of({
                    typeResponse: 'SUCCESS',
                    message: 'No se pudieron cargar cursos; fallback vacío',
                    data: [] as CursoUI[],
                    statusCode: 200,
                } as ApiResponse<CursoUI[]>)
            )
        );
    }
    crearCurso(curso: Omit<CursoUI, 'id'>): Observable<ApiResponse<CursoUI>> {
        const payload = {
            grupo: curso.grupo,
            asignatura: curso.asignatura,
            docente: curso.docente,
            fecha: curso.fecha,
        };
        return this.http.post<ApiResponse<CursoUI>>(this.backend, payload);
    }

    actualizarCurso(
        id: number | string,
        curso: Omit<CursoUI, 'id'>
    ): Observable<ApiResponse<CursoUI>> {
        const payload = {
            grupo: curso.grupo,
            asignatura: curso.asignatura,
            docente: curso.docente,
            fecha: curso.fecha,
        };
        return this.http.put<ApiResponse<CursoUI>>(
            `${this.backend}/${id}`,
            payload
        );
    }

    eliminarCurso(id: number | string): Observable<ApiResponse<unknown>> {
        return this.http.delete<ApiResponse<unknown>>(`${this.backend}/${id}`);
    }

    getAreasFormacion(): Observable<
        ApiResponse<{ label: string; value: string }[]>
    > {
        // Devolvemos lista vacía; el backend debe proveer valores reales.
        return of({
            typeResponse: 'SUCCESS',
            message: 'Áreas de formación no disponibles (vacío)',
            data: [] as { label: string; value: string }[],
            statusCode: 200,
        });
    }

    getAsignaturas(): Observable<
        ApiResponse<{ label: string; value: string }[]>
    > {
        // Devolvemos lista vacía; el backend debe proveer valores reales.
        return of({
            typeResponse: 'SUCCESS',
            message: 'Asignaturas no disponibles (vacío)',
            data: [] as { label: string; value: string }[],
            statusCode: 200,
        });
    }
}
