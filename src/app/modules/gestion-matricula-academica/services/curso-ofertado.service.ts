import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { HttpClient } from '@angular/common/http';

export interface CursoOfertado {
    id: number;
    grupo: string;
    asignatura: string;
    docente: string;
    horario: string;
}

@Injectable({ providedIn: 'root' })
export class CursoOfertadoService {
    constructor(private readonly http: HttpClient) {}

    getCursosOfertados(): Observable<ApiResponse<CursoOfertado[]>> {
        return this.http.get<ApiResponse<CursoOfertado[]>>(
            'assets/app/modules/gestion-matricula-academica/data/cursos-ofertados.json'
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
