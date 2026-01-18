import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { ApiResponse } from '../models/api-response.model';
import { EstudianteCorreo } from '../models/correos.model';
import { matricula_academica } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CorreoMatriculaFinalService {
    private readonly baseUrl = `${matricula_academica.api_url}matricula/correo-final`;
    private readonly estudiantesMock: EstudianteCorreo[] = [
        {
            id: 1,
            codigo: '2-121215',
            nombre: 'Camilo Ruiz Daza',
            correo: 'cruiz@unicuacua.edu.co',
        },
        {
            id: 2,
            codigo: '2-121216',
            nombre: 'Daniela Velasco Gonzalez',
            correo: 'dvelasco@unicuacua.edu.co',
        },
        {
            id: 3,
            codigo: '2-121217',
            nombre: 'Luis Fernando Orozco',
            correo: 'lforozco@unicuacua.edu.co',
        },
    ];

    constructor(private readonly http: HttpClient) {}

    // Endpoint: listar estudiantes con matricula final aprobada
    getEstudiantesConMatriculaFinal(): Observable<
        ApiResponse<EstudianteCorreo[]>
    > {
        return of({
            typeResponse: 'SUCCESS',
            message: 'Estudiantes cargados correctamente',
            statusCode: 200,
            data: this.estudiantesMock,
        });
    }

    // Endpoint: enviar correo de matricula final a estudiantes
    enviarCorreoMatriculaFinal(payload: {
        estudiantesId: number[];
    }): Observable<ApiResponse<null>> {
        const url = `${this.baseUrl}/estudiantes/enviar`;
        return this.http.post<ApiResponse<null>>(url, payload);
    }
}
