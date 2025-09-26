import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { HttpClient } from '@angular/common/http';

export interface Estudiante {
    codigo: string;
    nombre: string;
    apellidos: string;
    director: string;
    coDirector: string;
    semestreAcademico: string;
}

export interface AsignaturaMatricular {
    id: number;
    grupo: string;
    nombreAsignatura: string;
    opciones: string;
    observacion: string;
}

@Injectable({ providedIn: 'root' })
export class MatriculaPreviaService {
    constructor(private readonly http: HttpClient) {}

    getEstudiante(): Observable<ApiResponse<Estudiante>> {
        return this.http.get<ApiResponse<Estudiante>>(
            'assets/app/modules/gestion-matricula-academica/data/matricula-previa.json'
        );
    }

    getAsignaturasMatricular(): Observable<
        ApiResponse<AsignaturaMatricular[]>
    > {
        return this.http.get<ApiResponse<AsignaturaMatricular[]>>(
            'assets/app/modules/gestion-matricula-academica/data/matricula-previa.json'
        );
    }
}
