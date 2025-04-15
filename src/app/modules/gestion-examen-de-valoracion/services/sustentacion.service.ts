import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { backendGestionTrabajoDeGrado } from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';
import { Sustentacion } from '../models/sustentacion';

@Injectable({
    providedIn: 'root',
})
export class SustentacionService {
    constructor(private http: HttpClient) {}

    createSustentacionDocente(
        sustentacion: Sustentacion,
        idTrabajoGrado: number
    ): Observable<any> {
        return this.http.post<any>(
            backendGestionTrabajoDeGrado(
                `sustentacion_proyecto_investigacion/insertarInformacionDocente/${idTrabajoGrado}`
            ),
            sustentacion,
            {
                headers: getHeaders(),
            }
        );
    }

    verificarEgresado(idTrabajoGrado: number): Observable<any> {
        return this.http.get<any>(
            backendGestionTrabajoDeGrado(
                `sustentacion_proyecto_investigacion/verificarEgresado/${idTrabajoGrado}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    createSustentacionEstudiante(
        sustentacion: Sustentacion,
        idTrabajoGrado: number
    ): Observable<any> {
        return this.http.post<any>(
            backendGestionTrabajoDeGrado(
                `sustentacion_proyecto_investigacion/insertarInformacionEstudiante/${idTrabajoGrado}`
            ),
            sustentacion,
            {
                headers: getHeaders(),
            }
        );
    }

    createSustentacionCoordinadorFase1(
        sustentacion: any,
        idTrabajoGrado: number
    ): Observable<any> {
        return this.http.post<any>(
            backendGestionTrabajoDeGrado(
                `sustentacion_proyecto_investigacion/insertarInformacionCoordinadoFase1/${idTrabajoGrado}`
            ),
            sustentacion,
            {
                headers: getHeaders(),
            }
        );
    }

    createSustentacionCoordinadorFase2(
        sustentacion: Sustentacion,
        idTrabajoGrado: number
    ): Observable<any> {
        return this.http.post<any>(
            backendGestionTrabajoDeGrado(
                `sustentacion_proyecto_investigacion/insertarInformacionCoordinadoFase2/${idTrabajoGrado}`
            ),
            sustentacion,
            {
                headers: getHeaders(),
            }
        );
    }

    createSustentacionCoordinadorFase3(
        sustentacion: any,
        idTrabajoGrado: number
    ): Observable<any> {
        return this.http.post<any>(
            backendGestionTrabajoDeGrado(
                `sustentacion_proyecto_investigacion/insertarInformacionCoordinadoFase3/${idTrabajoGrado}`
            ),
            sustentacion,
            {
                headers: getHeaders(),
            }
        );
    }

    createSustentacionCoordinadorFase4(
        sustentacion: Sustentacion,
        idTrabajoGrado: number
    ): Observable<any> {
        return this.http.post<any>(
            backendGestionTrabajoDeGrado(
                `sustentacion_proyecto_investigacion/insertarInformacionCoordinadoFase4/${idTrabajoGrado}`
            ),
            sustentacion,
            {
                headers: getHeaders(),
            }
        );
    }

    updateSustentacionDocente(
        sustentacion: Sustentacion,
        sustentacionId: number
    ): Observable<any> {
        return this.http.put<any>(
            backendGestionTrabajoDeGrado(
                `sustentacion_proyecto_investigacion/actualizarInformacionDocente/${sustentacionId}`
            ),
            sustentacion,
            {
                headers: getHeaders(),
            }
        );
    }

    updateSustentacionCoordinadorFase1(
        sustentacion: any,
        sustentacionId: number
    ): Observable<any> {
        return this.http.put<any>(
            backendGestionTrabajoDeGrado(
                `sustentacion_proyecto_investigacion/actualizarInformacionCoordinadoFase1/${sustentacionId}`
            ),
            sustentacion,
            {
                headers: getHeaders(),
            }
        );
    }

    updateSustentacionCoordinadorFase2(
        sustentacion: Sustentacion,
        sustentacionId: number
    ): Observable<any> {
        return this.http.put<any>(
            backendGestionTrabajoDeGrado(
                `sustentacion_proyecto_investigacion/actualizarInformacionCoordinadoFase2/${sustentacionId}`
            ),
            sustentacion,
            {
                headers: getHeaders(),
            }
        );
    }

    updateSustentacionCoordinadorFase3(
        sustentacion: any,
        sustentacionId: number
    ): Observable<any> {
        return this.http.put<any>(
            backendGestionTrabajoDeGrado(
                `sustentacion_proyecto_investigacion/actualizarInformacionCoordinadoFase3/${sustentacionId}`
            ),
            sustentacion,
            {
                headers: getHeaders(),
            }
        );
    }

    updateSustentacionEstudiante(
        sustentacion: Sustentacion,
        sustentacionId: number
    ): Observable<any> {
        return this.http.put<any>(
            backendGestionTrabajoDeGrado(
                `sustentacion_proyecto_investigacion/actualizarInformacionEstudiante/${sustentacionId}`
            ),
            sustentacion,
            {
                headers: getHeaders(),
            }
        );
    }

    updateSustentacionCoordinadorFase4(
        sustentacion: Sustentacion,
        sustentacionId: number
    ): Observable<any> {
        return this.http.put<any>(
            backendGestionTrabajoDeGrado(
                `sustentacion_proyecto_investigacion/actualizarInformacionCoordinadoFase4/${sustentacionId}`
            ),
            sustentacion,
            {
                headers: getHeaders(),
            }
        );
    }

    getSustentacionDocente(trabajoDeGradoId: number): Observable<Sustentacion> {
        return this.http.get<Sustentacion>(
            backendGestionTrabajoDeGrado(
                `sustentacion_proyecto_investigacion/listarInformacionDocente/${trabajoDeGradoId}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    getSustentacionEstudiante(trabajoDeGradoId: number): Observable<any> {
        return this.http.get<any>(
            backendGestionTrabajoDeGrado(
                `sustentacion_proyecto_investigacion/listarInformacionEstudiante/${trabajoDeGradoId}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    getSustentacionCoordinadorFase1(trabajoDeGradoId: number): Observable<any> {
        return this.http.get<any>(
            backendGestionTrabajoDeGrado(
                `sustentacion_proyecto_investigacion/listarInformacionCoordinadorFase1/${trabajoDeGradoId}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    getSustentacionCoordinadorFase2(trabajoDeGradoId: number): Observable<any> {
        return this.http.get<any>(
            backendGestionTrabajoDeGrado(
                `sustentacion_proyecto_investigacion/listarInformacionCoordinadorFase2/${trabajoDeGradoId}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    getSustentacionCoordinadorFase3(trabajoDeGradoId: number): Observable<any> {
        return this.http.get<any>(
            backendGestionTrabajoDeGrado(
                `sustentacion_proyecto_investigacion/listarInformacionCoordinadorFase3/${trabajoDeGradoId}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    getSustentacionCoordinadorFase4(trabajoDeGradoId: number): Observable<any> {
        return this.http.get<any>(
            backendGestionTrabajoDeGrado(
                `sustentacion_proyecto_investigacion/listarInformacionCoordinadorFase4/${trabajoDeGradoId}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }
}
