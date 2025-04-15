import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { backendGestionTrabajoDeGrado } from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';
import { Experto } from 'src/app/modules/gestion-examen-de-valoracion/models/experto';

@Injectable({
    providedIn: 'root',
})
export class ExpertoService {
    constructor(private http: HttpClient) {}

    listExpertos(): Observable<any[]> {
        return this.http.get<Experto[]>(
            backendGestionTrabajoDeGrado(
                'solicitud_examen_valoracion/listarExpertos'
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    obtenerExperto(id: number): Observable<any> {
        return this.http.get<Experto>(
            backendGestionTrabajoDeGrado(
                `solicitud_examen_valoracion/experto/${id}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }
}
