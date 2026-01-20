import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Estudiante } from '../../gestion-estudiantes/models/estudiante';
import { ApiResponse } from '../models/api-response.model';
import { matricula_academica } from 'src/environments/environment';
import { backend } from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';

@Injectable({
    providedIn: 'root',
})
export class EstudianteAcademicoService {
    constructor(private readonly http: HttpClient) {}

    // Endpoint: listar estudiantes activos
    getEstudiantesActivos(): Observable<ApiResponse<Estudiante[]>> {
        const url = `${matricula_academica.api_url}cursos/estudiantes/activos`;
        return this.http.get<ApiResponse<Estudiante[]>>(url);
    }

    // Endpoint: obtener estudiante por id
    getEstudiantePorId(id: number): Observable<ApiResponse<Estudiante>> {
        const url = `${matricula_academica.api_url}estudiante-docente/estudiante/${id}`;
        return this.http.get<ApiResponse<Estudiante>>(url);
    }

    // Endpoint: eliminar estudiante por id
    deleteEstudiante(id: number): Observable<unknown> {
        return this.http.delete(backend(`estudiantes/${id}`), {
            headers: getHeaders(),
        });
    }
}
