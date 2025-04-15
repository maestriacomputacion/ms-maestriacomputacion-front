import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { backendGestionTrabajoDeGrado } from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';
import { Respuesta } from '../models/respuesta';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RespuestaService {
    constructor(private http: HttpClient) {}

    createRespuestaExamen(
        respuesta: Respuesta,
        trabajoDeGradoId: number
    ): Observable<any> {
        return this.http.post<any>(
            backendGestionTrabajoDeGrado(
                `respuesta_examen_valoracion/${trabajoDeGradoId}`
            ),
            respuesta,
            {
                headers: getHeaders(),
            }
        );
    }

    updateRespuestaExamen(
        respuestaId: number,
        respuesta: Respuesta
    ): Observable<any> {
        return this.http.put<any>(
            backendGestionTrabajoDeGrado(
                `respuesta_examen_valoracion/${respuestaId}`
            ),
            respuesta,
            {
                headers: getHeaders(),
            }
        );
    }

    deleteRespuestaExamen(respuestaId: number): Observable<any> {
        return this.http.delete<any>(
            backendGestionTrabajoDeGrado(
                `respuesta_examen_valoracion/${respuestaId}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    getRespuestasExamen(trabajoDeGradoId: number): Observable<any> {
        return this.http.get<any>(
            backendGestionTrabajoDeGrado(
                `respuesta_examen_valoracion/${trabajoDeGradoId}`
            ),
            { headers: getHeaders() }
        );
    }

    insertarInformacionCancelado(
        idTrabajoGrado: number,
        observacion: any
    ): Observable<any> {
        return this.http.post<any>(
            backendGestionTrabajoDeGrado(
                `respuesta_examen_valoracion/insertarInformacionCancelado/${idTrabajoGrado}`
            ),
            observacion,
            {
                headers: getHeaders(),
            }
        );
    }

    getFormatosB(trabajoDeGradoId: number): Observable<any> {
        return this.http.get<any>(
            backendGestionTrabajoDeGrado(
                `respuesta_examen_valoracion/obtenerFormatosB/${trabajoDeGradoId}`
            ),
            { headers: getHeaders() }
        );
    }
}
