import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { CursoUI, BackendCurso } from '../models/curso.model';
import {
    MatriculaEstudiantesRequest,
    MatriculaResponseData,
} from '../models/matricula.model';
import { matricula_academica } from 'src/environments/environment';

type OptionalId = string | number | null;

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

    private transformToUI(item: BackendCurso): CursoUI {
        const docentes = (item.docentes || [])
            .map((d) => {
                const nombreCompleto = `${d.nombre ?? ''} ${
                    d.apellido ?? ''
                }`.trim();
                return nombreCompleto || d.codigo || d.correoElectronico || '';
            })
            .filter((v: string) => !!v)
            .join(', ');

        return {
            id: Number(item.id),
            grupo: item.grupo,
            asignatura: item.asignatura?.nombre ?? '',
            docente: docentes,
            fecha: CursoService.formatDateString(
                item.periodo?.fechaInicio ?? ''
            ),
            periodoEstado: item.periodo?.estado ?? null,
            salon: item.salon ?? null,
        };
    }

    private buildPayload(curso: Omit<CursoUI, 'id'>) {
        const { grupo, asignatura, docente, fecha } = curso;
        return { grupo, asignatura, docente, fecha };
    }

    getCursos(params?: {
        idPeriodo?: OptionalId;
        idAsignatura?: OptionalId;
        idArea?: OptionalId;
    }): Observable<ApiResponse<CursoUI[]>> {
        let httpParams = new HttpParams();
        if (params) {
            const { idPeriodo, idAsignatura, idArea } = params;
            if (
                idPeriodo !== undefined &&
                idPeriodo !== null &&
                `${idPeriodo}` !== ''
            ) {
                httpParams = httpParams.set('idPeriodo', String(idPeriodo));
            }
            if (
                idAsignatura !== undefined &&
                idAsignatura !== null &&
                `${idAsignatura}` !== ''
            ) {
                httpParams = httpParams.set(
                    'idAsignatura',
                    String(idAsignatura)
                );
            }
            if (idArea !== undefined && idArea !== null && `${idArea}` !== '') {
                httpParams = httpParams.set('idArea', String(idArea));
            }
        }

        return this.http
            .get<ApiResponse<BackendCurso[]>>(this.backend, {
                params: httpParams,
            })
            .pipe(
                map((resp) => ({
                    typeResponse: resp.typeResponse,
                    message: resp.message,
                    statusCode: resp.statusCode,
                    data: (resp.data ?? []).map((item) =>
                        this.transformToUI(item)
                    ),
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

    getCursoById(id: number | string): Observable<ApiResponse<BackendCurso>> {
        return this.http.get<ApiResponse<BackendCurso>>(
            `${this.backend}/${id}`
        );
    }

    crearCurso(curso: Omit<CursoUI, 'id'>): Observable<ApiResponse<CursoUI>> {
        const payload = this.buildPayload(curso);
        return this.http.post<ApiResponse<CursoUI>>(this.backend, payload);
    }

    actualizarCurso(
        id: number | string,
        curso: Omit<CursoUI, 'id'>
    ): Observable<ApiResponse<CursoUI>> {
        const payload = this.buildPayload(curso);
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
        const url = `${this.backend}/asignaturas/area`;
        return this.http.get<ApiResponse<any[]>>(url).pipe(
            map((resp) => ({
                typeResponse: resp.typeResponse,
                message: resp.message,
                statusCode: resp.statusCode,
                data: (resp.data || []).map((a: any) => ({
                    label: a.nombre ?? '',
                    value: String(a.id ?? ''),
                })),
            })),
            catchError((err) => {
                console.error('Error cargando áreas de formación', err);
                return of({
                    typeResponse: 'SUCCESS',
                    message:
                        'Áreas de formación no disponibles (fallback vacío)',
                    data: [] as { label: string; value: string }[],
                    statusCode: 200,
                } as ApiResponse<{ label: string; value: string }[]>);
            })
        );
    }

    getAsignaturas(): Observable<
        ApiResponse<{ label: string; value: string }[]>
    > {
        const url = `${this.backend}/asignaturas`;
        return this.http.get<ApiResponse<any[]>>(url).pipe(
            map((resp) => ({
                typeResponse: resp.typeResponse,
                message: resp.message,
                statusCode: resp.statusCode,
                data: (resp.data || []).map((a: any) => ({
                    label: a.nombre ?? '',
                    value: String(a.id ?? ''),
                })),
            })),
            catchError((err) => {
                console.error('Error cargando asignaturas', err);
                return of({
                    typeResponse: 'SUCCESS',
                    message: 'Asignaturas no disponibles (vacío)',
                    data: [] as { label: string; value: string }[],
                    statusCode: 200,
                } as ApiResponse<{ label: string; value: string }[]>);
            })
        );
    }

    /** Obtiene asignaturas filtradas por área (opcional). */
    getAsignaturasByArea(
        idArea?: string | number | null
    ): Observable<ApiResponse<{ label: string; value: string }[]>> {
        const url = `${this.backend}/asignaturas`;
        let params = new HttpParams();
        if (idArea !== undefined && idArea !== null && `${idArea}` !== '') {
            params = params.set('idArea', String(idArea));
        }
        return this.http.get<ApiResponse<any[]>>(url, { params }).pipe(
            map((resp) => ({
                typeResponse: resp.typeResponse,
                message: resp.message,
                statusCode: resp.statusCode,
                data: (resp.data || []).map((a: any) => ({
                    label: a.nombre ?? '',
                    value: String(a.id ?? ''),
                })),
            })),
            catchError((err) => {
                console.error('Error cargando asignaturas por área', err);
                return of({
                    typeResponse: 'SUCCESS',
                    message: 'Asignaturas no disponibles (fallback vacío)',
                    data: [] as { label: string; value: string }[],
                    statusCode: 200,
                } as ApiResponse<{ label: string; value: string }[]>);
            })
        );
    }

    /** Obtiene las asignaturas (raw) posibilitando acceso a campos como id, nombre, codigo, creditos, areaFormacion. */
    getAsignaturasRawByArea(
        idArea?: string | number | null
    ): Observable<ApiResponse<any[]>> {
        const url = `${this.backend}/asignaturas`;
        let params = new HttpParams();
        if (idArea !== undefined && idArea !== null && `${idArea}` !== '') {
            params = params.set('idArea', String(idArea));
        }
        return this.http.get<ApiResponse<any[]>>(url, { params }).pipe(
            map((resp) => ({
                typeResponse: resp.typeResponse,
                message: resp.message,
                statusCode: resp.statusCode,
                data: resp.data || [],
            })),
            catchError((err) => {
                console.error('Error cargando asignaturas raw por área', err);
                return of({
                    typeResponse: 'SUCCESS',
                    message: 'Asignaturas no disponibles (fallback vacío)',
                    data: [] as any[],
                    statusCode: 200,
                } as ApiResponse<any[]>);
            })
        );
    }

    /**
     * Valida si un estudiante puede matricularse en un curso.
     * Endpoint: GET {matricula_academica.api_url}matricula/validar?estudianteId=..&cursoId=..
     * Respuesta: ApiResponse<boolean> (data = true|false)
     */
    validarMatricula(
        estudianteId: number,
        cursoId: number
    ): Observable<ApiResponse<boolean>> {
        const url = `${matricula_academica.api_url}matricula/validar`;
        let params = new HttpParams();
        params = params.set('estudianteId', String(estudianteId));
        params = params.set('cursoId', String(cursoId));
        return this.http.get<ApiResponse<boolean>>(url, { params });
    }

    matricularEstudiantes(
        payload: MatriculaEstudiantesRequest
    ): Observable<ApiResponse<MatriculaResponseData>> {
        const url = `${matricula_academica.api_url}matricula/curso`;
        return this.http.post<ApiResponse<MatriculaResponseData>>(url, payload);
    }
}
