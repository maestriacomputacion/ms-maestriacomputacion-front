import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Estudiante } from '../models/estudiante';
import { backend } from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';
import { EstadoEstudiante } from '../models/estado-estudiante';

@Injectable({
    providedIn: 'root',
})
export class EstudianteService {

    constructor(private http: HttpClient) {}

    listEstudiantes(): Observable<Estudiante[]> {
        return this.http.get<Estudiante[]>(
            backend('estudiantes'),

        );
    }

    uploadEstudiantes(file: File): Observable<any> {
        const formData: FormData = new FormData();
        formData.append('file', file, file.name);
        return this.http.post(
            backend('estudiantes/upload'),
            formData
        );
    }

    getEstadoEstudiante(id: number) {
        return this.http.get<EstadoEstudiante>(
            backend(`estudiantes/ver-estado/${id}`),
            { headers: getHeaders() }
        );
    }

    createEstudiante(estudiante: Estudiante) {
        return this.http.post<any>(
            backend('estudiantes'),
            estudiante,
            { headers: getHeaders() }
        );
    }

    deleteEstudiante(id: number) {
        return this.http.delete<any>(
            backend(`estudiantes/${id}`),
            { headers: getHeaders() }
        );
    }

    getEstudiante(id: number) {
        return this.http.get<Estudiante>(
            backend(`estudiantes/${id}`),
            { headers: getHeaders() }
        );
    }

    updateEstudiante(id: number, estudiante: Estudiante){
        return this.http.put<any>(
            backend(`estudiantes/${id}`),
            estudiante,
            { headers: getHeaders() }
        );
    }
}
