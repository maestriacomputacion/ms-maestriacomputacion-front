import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { backendGestionTrabajoDeGrado } from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';
import { Solicitud } from '../models/solicitud';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SolicitudService {
    constructor(private http: HttpClient) {}

    createSolicitudDocente(
        solicitud: Solicitud,
        idTrabajoGrado: number
    ): Observable<any> {
        return this.http.post<any>(
            backendGestionTrabajoDeGrado(
                `solicitud_examen_valoracion/insertarInformacionDocente/${idTrabajoGrado}`
            ),
            solicitud,
            {
                headers: getHeaders(),
            }
        );
    }

    createSolicitudCoordinadorFase1(
        solicitud: any,
        idTrabajoGrado: number
    ): Observable<any> {
        return this.http.post<any>(
            backendGestionTrabajoDeGrado(
                `solicitud_examen_valoracion/insertarInformacionCoordinadorFase1/${idTrabajoGrado}`
            ),
            solicitud,
            {
                headers: getHeaders(),
            }
        );
    }

    createSolicitudCoordinadorFase2(
        solicitud: any,
        idTrabajoGrado: number
    ): Observable<any> {
        return this.http.post<any>(
            backendGestionTrabajoDeGrado(
                `solicitud_examen_valoracion/insertarInformacionCoordinadorFase2/${idTrabajoGrado}`
            ),
            solicitud,
            {
                headers: getHeaders(),
            }
        );
    }

    getSolicitudDocente(idTrabajoGrado: number): Observable<any> {
        return this.http.get<any>(
            backendGestionTrabajoDeGrado(
                `solicitud_examen_valoracion/listarInformacionDocente/${idTrabajoGrado}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    getSolicitudCoordinadorFase1(idTrabajoGrado: number): Observable<any> {
        return this.http.get<any>(
            backendGestionTrabajoDeGrado(
                `solicitud_examen_valoracion/listarInformacionCoordinadorFase1/${idTrabajoGrado}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    getSolicitudCoordinadorFase2(idTrabajoGrado: number): Observable<any> {
        return this.http.get<any>(
            backendGestionTrabajoDeGrado(
                `solicitud_examen_valoracion/listarInformacionCoordinadorFase2/${idTrabajoGrado}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    updateSolicitudDocente(
        solicitud: Solicitud,
        idTrabajoGrado: number
    ): Observable<any> {
        return this.http.put<any>(
            backendGestionTrabajoDeGrado(
                `solicitud_examen_valoracion/actualizarInformacionDocente/${idTrabajoGrado}`
            ),
            solicitud,
            {
                headers: getHeaders(),
            }
        );
    }

    updateSolicitudCoordinadorFase1(
        solicitud: any,
        idTrabajoGrado: number
    ): Observable<any> {
        return this.http.put<any>(
            backendGestionTrabajoDeGrado(
                `solicitud_examen_valoracion/actualizarInformacionCoordinadorFase1/${idTrabajoGrado}`
            ),
            solicitud,
            {
                headers: getHeaders(),
            }
        );
    }

    updateSolicitudCoordinadorFase2(
        solicitud: Solicitud,
        idTrabajoGrado: number
    ): Observable<any> {
        return this.http.put<any>(
            backendGestionTrabajoDeGrado(
                `solicitud_examen_valoracion/actualizarInformacionCoordinadorFase2/${idTrabajoGrado}`
            ),
            solicitud,
            {
                headers: getHeaders(),
            }
        );
    }
}
