import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiResponse } from '../models/api-response.model';
import { EstudianteCorreo } from '../models/correos.model';
import { NotificacionPrematriculaTutor } from '../models/notificacion-prematricula.model';
import { matricula_academica } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CorreoMatriculaFinalService {
    constructor(private readonly http: HttpClient) {}

    // Endpoint: listar estudiantes matriculados
    getEstudiantesConMatriculaFinal(): Observable<
        ApiResponse<EstudianteCorreo[]>
    > {
        const url = `${matricula_academica.api_url}estudiante-docente/matriculados`;
        return this.http
            .get<ApiResponse<EstudianteMatriculadoBackend[]>>(url)
            .pipe(
                map((response) => ({
                    typeResponse: response.typeResponse,
                    message: response.message,
                    statusCode: response.statusCode,
                    data: (response.data ?? []).map((item) => ({
                        id: Number(item.id),
                        codigo: item.codigo ?? '',
                        nombre: `${item.persona?.nombre ?? ''} ${
                            item.persona?.apellido ?? ''
                        }`.trim(),
                        correo:
                            item.correoUniversidad ??
                            item.persona?.correoElectronico ??
                            '',
                    })),
                }))
            );
    }

    // Endpoint: /matricula/notificar-matricula-final
    enviarCorreoMatriculaFinal(payload: {
        estudianteIds: number[];
    }): Observable<ApiResponse<NotificacionPrematriculaTutor[]>> {
        const url = `${matricula_academica.api_url}matricula/notificar-matricula-final`;
        return this.http.post<ApiResponse<NotificacionPrematriculaTutor[]>>(
            url,
            payload
        );
    }

    // Endpoint: /matricula/notificar-matricula-final/cursos
    enviarCorreoMatriculaFinalPorCursos(payload: {
        cursoIds: number[];
    }): Observable<ApiResponse<NotificacionPrematriculaTutor[]>> {
        const url = `${matricula_academica.api_url}matricula/notificar-matricula-final/cursos`;
        return this.http.post<ApiResponse<NotificacionPrematriculaTutor[]>>(
            url,
            payload
        );
    }
}

type EstudianteMatriculadoBackend = {
    id: number;
    codigo?: string | null;
    correoUniversidad?: string | null;
    persona?: {
        nombre?: string | null;
        apellido?: string | null;
        correoElectronico?: string | null;
    } | null;
};
