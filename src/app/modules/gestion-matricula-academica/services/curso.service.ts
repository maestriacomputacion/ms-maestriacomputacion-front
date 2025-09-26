import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { HttpClient } from '@angular/common/http';

export interface Curso {
    id: number;
    grupo: string;
    asignatura: string;
    docente: string;
    fecha: string;
}

@Injectable({ providedIn: 'root' })
export class CursoService {
    constructor(private readonly http: HttpClient) {}

    getCursos(): Observable<ApiResponse<Curso[]>> {
        return this.http.get<ApiResponse<Curso[]>>(
            'assets/app/modules/gestion-matricula-academica/data/cursos.json'
        );
    }

    getAreasFormacion(): Observable<
        ApiResponse<{ label: string; value: string }[]>
    > {
        return this.http.get<ApiResponse<{ label: string; value: string }[]>>(
            'assets/app/modules/gestion-matricula-academica/data/areas-formacion.json'
        );
    }

    getAsignaturas(): Observable<
        ApiResponse<{ label: string; value: string }[]>
    > {
        return this.http.get<ApiResponse<{ label: string; value: string }[]>>(
            'assets/app/modules/gestion-matricula-academica/data/asignaturas.json'
        );
    }
}
