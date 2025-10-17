import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { CursoUI } from '../models/curso.model';
import { AsignaturaModel } from '../models/curso.model';
import { matricula_academica } from 'src/environments/environment';

export interface RegistrarCursoPayload {
    grupo: string;
    asignaturaId: number;
    docentesIds: number[];
    horario?: string;
    salon?: string;
    materialApoyoIds?: number[];
    observacion?: string;
}

const backendRegistrarCurso = () => `${matricula_academica.api_url}cursos`;

@Injectable({ providedIn: 'root' })
export class RegistrarCursoService {
    constructor(private readonly http: HttpClient) {}

    registrarCurso(
        payload: RegistrarCursoPayload
    ): Observable<ApiResponse<CursoUI>> {
        return this.http.post<ApiResponse<CursoUI>>(
            backendRegistrarCurso(),
            payload
        );
    }

    exists(
        grupo: string,
        asignaturaId: number
    ): Observable<ApiResponse<boolean>> {
        const params = {
            grupo,
            asignaturaId: String(asignaturaId),
        };
        return this.http.get<ApiResponse<boolean>>(
            `${backendRegistrarCurso()}/existe`,
            { params }
        );
    }

    listAsignaturas(): Observable<ApiResponse<AsignaturaModel[]>> {
        return this.http.get<ApiResponse<AsignaturaModel[]>>(
            `${backendRegistrarCurso()}/asignaturas`
        );
    }
}
