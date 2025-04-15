import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { backendGestionTrabajoDeGrado } from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';
import { Resolucion } from '../models/resolucion';

@Injectable({
    providedIn: 'root',
})
export class ResolucionService {
    constructor(private http: HttpClient) {}

    createResolucionDocente(
        resolucion: Resolucion,
        trabajoDeGradoId: number
    ): Observable<any> {
        return this.http.post<any>(
            backendGestionTrabajoDeGrado(
                `generacion_resolucion/insertarInformacionDocente/${trabajoDeGradoId}`
            ),
            resolucion,
            {
                headers: getHeaders(),
            }
        );
    }

    createResolucionCoordinadorFase1(
        resolucion: any,
        trabajoDeGradoId: number
    ): Observable<any> {
        return this.http.post<any>(
            backendGestionTrabajoDeGrado(
                `generacion_resolucion/insertarInformacionCoordinadorFase1/${trabajoDeGradoId}`
            ),
            resolucion,
            {
                headers: getHeaders(),
            }
        );
    }

    createResolucionCoordinadorFase2(
        resolucion: Resolucion,
        trabajoDeGradoId: number
    ): Observable<any> {
        return this.http.post<any>(
            backendGestionTrabajoDeGrado(
                `generacion_resolucion/insertarInformacionCoordinadorFase2/${trabajoDeGradoId}`
            ),
            resolucion,
            {
                headers: getHeaders(),
            }
        );
    }

    createResolucionCoordinadorFase3(
        resolucion: Resolucion,
        trabajoDeGradoId: number
    ): Observable<any> {
        return this.http.post<any>(
            backendGestionTrabajoDeGrado(
                `generacion_resolucion/insertarInformacionCoordinadorFase3/${trabajoDeGradoId}`
            ),
            resolucion,
            {
                headers: getHeaders(),
            }
        );
    }

    updateResolucionDocente(
        resolucion: any,
        trabajoDeGradoId: number
    ): Observable<any> {
        return this.http.put<any>(
            backendGestionTrabajoDeGrado(
                `generacion_resolucion/actualizarInformacionDocente/${trabajoDeGradoId}`
            ),
            resolucion,
            {
                headers: getHeaders(),
            }
        );
    }

    updateResolucionCoordinadorFase1(
        resolucion: any,
        trabajoDeGradoId: number
    ): Observable<any> {
        return this.http.put<any>(
            backendGestionTrabajoDeGrado(
                `generacion_resolucion/actualizarInformacionCoordinadorFase1/${trabajoDeGradoId}`
            ),
            resolucion,
            {
                headers: getHeaders(),
            }
        );
    }

    updateResolucionCoordinadorFase2(
        resolucion: any,
        trabajoDeGradoId: number
    ): Observable<any> {
        return this.http.put<any>(
            backendGestionTrabajoDeGrado(
                `generacion_resolucion/actualizarInformacionCoordinadorFase2/${trabajoDeGradoId}`
            ),
            resolucion,
            {
                headers: getHeaders(),
            }
        );
    }

    updateResolucionCoordinadorFase3(
        resolucion: any,
        trabajoDeGradoId: number
    ): Observable<any> {
        return this.http.put<any>(
            backendGestionTrabajoDeGrado(
                `generacion_resolucion/actualizarInformacionCoordinadorFase3/${trabajoDeGradoId}`
            ),
            resolucion,
            {
                headers: getHeaders(),
            }
        );
    }

    getResolucionDocente(trabajoDeGradoId: number): Observable<any> {
        return this.http.get<any>(
            backendGestionTrabajoDeGrado(
                `generacion_resolucion/listarInformacionDocente/${trabajoDeGradoId}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    getResolucionCoordinadorFase1(trabajoDeGradoId: number): Observable<any> {
        return this.http.get<any>(
            backendGestionTrabajoDeGrado(
                `generacion_resolucion/listarInformacionCoordinadorFase1/${trabajoDeGradoId}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    getResolucionCoordinadorFase2(trabajoDeGradoId: number): Observable<any> {
        return this.http.get<any>(
            backendGestionTrabajoDeGrado(
                `generacion_resolucion/listarInformacionCoordinadorFase2/${trabajoDeGradoId}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    getResolucionCoordinadorFase3(trabajoDeGradoId: number): Observable<any> {
        return this.http.get<any>(
            backendGestionTrabajoDeGrado(
                `generacion_resolucion/listarInformacionCoordinadorFase3/${trabajoDeGradoId}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }
}
