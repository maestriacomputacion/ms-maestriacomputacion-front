import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    backendGestionEgresados,
    backendGestionTrabajoDeGrado,
} from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';

@Injectable({
    providedIn: 'root',
})
export class EstudianteService {
    constructor(private http: HttpClient) {}

    listEstudiantes(): Observable<any[]> {
        return this.http.get<Estudiante[]>(
            backendGestionTrabajoDeGrado('inicio_trabajo_grado/'),
            {
                headers: getHeaders(),
            }
        );
    }

    getEstudiante(idEstudiante: number): Observable<any> {
        return this.http.get<Estudiante>(
            backendGestionTrabajoDeGrado(
                `inicio_trabajo_grado/obtenerInformacionEstudiante/${idEstudiante}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    getEstudianteEgresado(idEstudiante: number): Observable<any> {
        return this.http.get<Estudiante>(
            backendGestionEgresados(`informacion_general/${idEstudiante}`),
            {
                headers: getHeaders(),
            }
        );
    }
}
