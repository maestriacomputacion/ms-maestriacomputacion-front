import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import {
    CursoUI,
    BackendCurso,
    CursoRegistroPayload,
} from '../models/curso.model';
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
                const nombreCompleto = d.persona
                    ? `${d.persona.nombre ?? ''} ${
                          d.persona.apellido ?? ''
                      }`.trim()
                    : '';
                return nombreCompleto || d.codigo || '';
            })
            .filter((v: string) => !!v)
            .join(', ');

        return {
            id: Number(item.id),
            grupo: item.grupo,
            asignaturaId: Number(item.asignatura?.id ?? 0),
            asignatura: item.asignatura?.nombre ?? '',
            docente: docentes,
            fecha: CursoService.formatDateString(
                item.periodo?.fechaInicio ?? ''
            ),
            periodoEstado: item.periodo?.estado ?? null,
            salon: item.salon ?? null,
            horario: item.horario ?? null,
        };
    }

    private obtenerCursos(
        url: string,
        httpParams: HttpParams
    ): Observable<ApiResponse<CursoUI[]>> {
        return this.http
            .get<ApiResponse<BackendCurso[]>>(url, {
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

    // Endpoint: listar cursos filtrados por periodo/asignatura/area
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

        return this.obtenerCursos(this.backend, httpParams);
    }

    // Endpoint: listar cursos disponibles para un estudiante
    getCursosDisponiblesPorEstudiante(
        idEstudiante: number | string,
        params?: {
            idArea?: OptionalId;
        }
    ): Observable<ApiResponse<CursoUI[]>> {
        let httpParams = new HttpParams();
        if (params) {
            const { idArea } = params;
            if (idArea !== undefined && idArea !== null && `${idArea}` !== '') {
                httpParams = httpParams.set('idArea', String(idArea));
            }
        }

        return this.obtenerCursos(
            `${this.backend}/disponibles-estudiante/${idEstudiante}`,
            httpParams
        );
    }

    // Endpoint: listar cursos con matricula aprobada
    getCursosMatriculaAprobada(): Observable<ApiResponse<BackendCurso[]>> {
        return this.http.get<ApiResponse<BackendCurso[]>>(
            `${this.backend}/matricula-aprobadas`
        );
    }

    // Endpoint: obtener detalle de curso por id
    getCursoById(id: number | string): Observable<ApiResponse<BackendCurso>> {
        return this.http.get<ApiResponse<BackendCurso>>(
            `${this.backend}/${id}`
        );
    }

    // Endpoint: registrar un curso
    registrarCurso(
        payload: CursoRegistroPayload
    ): Observable<ApiResponse<CursoUI>> {
        return this.http.post<ApiResponse<CursoUI>>(this.backend, payload);
    }

    // Endpoint: actualizar un curso existente
    actualizarCurso(
        id: number | string,
        payload: CursoRegistroPayload
    ): Observable<ApiResponse<CursoUI>> {
        return this.http.put<ApiResponse<CursoUI>>(
            `${this.backend}/${id}`,
            payload
        );
    }

    // Endpoint: eliminar un curso por id
    eliminarCurso(id: number | string): Observable<ApiResponse<unknown>> {
        return this.http.delete<ApiResponse<unknown>>(`${this.backend}/${id}`);
    }

    // Endpoint: validar si existe un curso por grupo y asignatura
    verificarCursoExistente(
        grupo: string,
        asignaturaId: number
    ): Observable<ApiResponse<boolean>> {
        const params = {
            grupo,
            asignaturaId: String(asignaturaId),
        };
        return this.http.get<ApiResponse<boolean>>(`${this.backend}/existe`, {
            params,
        });
    }

    // Endpoint: POST /cursos/ofertados/report?formato=pdf
    descargarReporteCursosOfertados(
        formato: 'pdf' | 'xlsx',
        payload: { asignaturaIds: number[]; cursosIds: number[] }
    ): Observable<HttpResponse<Blob>> {
        const params = new HttpParams().set('formato', formato);
        return this.http.post(`${this.backend}/ofertados/report`, payload, {
            params,
            responseType: 'blob',
            observe: 'response',
        });
    }
}
