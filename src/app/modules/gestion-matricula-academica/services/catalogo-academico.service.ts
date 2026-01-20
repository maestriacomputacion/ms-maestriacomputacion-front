import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ApiResponse } from '../models/api-response.model';
import { AsignaturaModel, DocenteModel } from '../models/curso.model';
import { CatalogoOption } from '../models/catalogo.model';
import { matricula_academica } from 'src/environments/environment';

type OptionalId = string | number | null;
type CatalogoItem = { id?: string | number | null; nombre?: string | null };

@Injectable({ providedIn: 'root' })
export class CatalogoAcademicoService {
    private readonly backendCursos = `${matricula_academica.api_url}cursos`;
    private readonly backendDocentes = `${matricula_academica.api_url}estudiante-docente`;

    constructor(private readonly http: HttpClient) {}

    // Endpoint: listar areas de formacion disponibles
    getAreasFormacion(): Observable<ApiResponse<CatalogoOption[]>> {
        const url = `${this.backendCursos}/asignaturas/area`;
        return this.http.get<ApiResponse<CatalogoItem[]>>(url).pipe(
            map((resp) => ({
                typeResponse: resp.typeResponse,
                message: resp.message,
                statusCode: resp.statusCode,
                data: (resp.data || []).map((a) => ({
                    label: a.nombre ?? '',
                    value:
                        a.id !== undefined && a.id !== null ? String(a.id) : '',
                })),
            })),
            catchError((err) => {
                console.error(
                    'Error cargando \u00e1reas de formaci\u00f3n',
                    err
                );
                return of({
                    typeResponse: 'SUCCESS',
                    message:
                        '\u00c1reas de formaci\u00f3n no disponibles (fallback vac\u00edo)',
                    data: [] as CatalogoOption[],
                    statusCode: 200,
                } as ApiResponse<CatalogoOption[]>);
            })
        );
    }

    // Endpoint: listar asignaturas para filtros generales
    getAsignaturas(): Observable<ApiResponse<CatalogoOption[]>> {
        const url = `${this.backendCursos}/asignaturas`;
        return this.http.get<ApiResponse<CatalogoItem[]>>(url).pipe(
            map((resp) => ({
                typeResponse: resp.typeResponse,
                message: resp.message,
                statusCode: resp.statusCode,
                data: (resp.data || []).map((a) => ({
                    label: a.nombre ?? '',
                    value:
                        a.id !== undefined && a.id !== null ? String(a.id) : '',
                })),
            })),
            catchError((err) => {
                console.error('Error cargando asignaturas', err);
                return of({
                    typeResponse: 'SUCCESS',
                    message: 'Asignaturas no disponibles (vac\u00edo)',
                    data: [] as CatalogoOption[],
                    statusCode: 200,
                } as ApiResponse<CatalogoOption[]>);
            })
        );
    }

    // Endpoint: listar asignaturas filtradas por area para filtros
    getAsignaturasByArea(
        idArea?: OptionalId
    ): Observable<ApiResponse<CatalogoOption[]>> {
        const url = `${this.backendCursos}/asignaturas`;
        let params = new HttpParams();
        if (idArea !== undefined && idArea !== null && `${idArea}` !== '') {
            params = params.set('idArea', String(idArea));
        }
        return this.http.get<ApiResponse<CatalogoItem[]>>(url, { params }).pipe(
            map((resp) => ({
                typeResponse: resp.typeResponse,
                message: resp.message,
                statusCode: resp.statusCode,
                data: (resp.data || []).map((a) => ({
                    label: a.nombre ?? '',
                    value:
                        a.id !== undefined && a.id !== null ? String(a.id) : '',
                })),
            })),
            catchError((err) => {
                console.error('Error cargando asignaturas por \u00e1rea', err);
                return of({
                    typeResponse: 'SUCCESS',
                    message: 'Asignaturas no disponibles (fallback vac\u00edo)',
                    data: [] as CatalogoOption[],
                    statusCode: 200,
                } as ApiResponse<CatalogoOption[]>);
            })
        );
    }

    // Endpoint: listar asignaturas con detalle para registrar cursos
    listAsignaturas(): Observable<ApiResponse<AsignaturaModel[]>> {
        return this.http.get<ApiResponse<AsignaturaModel[]>>(
            `${this.backendCursos}/asignaturas`
        );
    }

    // Endpoint: listar docentes asociados a una asignatura
    listDocentesByAsignatura(
        asignaturaId: number
    ): Observable<ApiResponse<DocenteModel[]>> {
        return this.http.get<ApiResponse<DocenteModel[]>>(
            `${this.backendCursos}/asignaturas/docente/${asignaturaId}`
        );
    }

    // Endpoint: listar todos los docentes
    listDocentes(): Observable<ApiResponse<DocenteModel[]>> {
        return this.http.get<ApiResponse<DocenteModel[]>>(
            `${this.backendDocentes}/listaDocentes`
        );
    }
}
