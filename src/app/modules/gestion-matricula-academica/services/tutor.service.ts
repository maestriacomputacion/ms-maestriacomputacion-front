import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import {
    TutorListado,
    TutorListadoBackend,
} from '../models/tutor-listado.model';
import { matricula_academica } from 'src/environments/environment';
import { Estudiante } from '../../gestion-estudiantes/models/estudiante';

@Injectable({
    providedIn: 'root',
})
export class TutorService {
    private readonly backend = `${matricula_academica.api_url}estudiante-docente`;

    constructor(private readonly http: HttpClient) {}

    // Endpoint: listar tutores con cantidad de estudiantes
    getTutores(): Observable<ApiResponse<TutorListado[]>> {
        return this.http
            .get<ApiResponse<TutorListadoBackend[]>>(`${this.backend}/tutores`)
            .pipe(
                map((response) => ({
                    typeResponse: response.typeResponse,
                    message: response.message,
                    statusCode: response.statusCode,
                    data: (response.data ?? []).map((item) => {
                        const persona = item.docente?.persona;
                        const nombre = `${persona?.nombre ?? ''} ${
                            persona?.apellido ?? ''
                        }`.trim();

                        return {
                            docenteId: Number(item.docente?.id ?? 0),
                            nombre: nombre || 'Sin nombre',
                            codigo: item.docente?.codigo ?? '',
                            correo: persona?.correoElectronico ?? '',
                            estado: item.docente?.estado ?? '',
                            cantidadEstudiantes: Number(
                                item.totalEstudiantes ?? 0
                            ),
                        };
                    }),
                }))
            );
    }

    // Endpoint: listar estudiantes por tutor
    getEstudiantesPorTutor(
        tutorId: number
    ): Observable<ApiResponse<Estudiante[]>> {
        return this.http.get<ApiResponse<Estudiante[]>>(
            `${this.backend}/tutores/${tutorId}/estudiantes`
        );
    }
}
