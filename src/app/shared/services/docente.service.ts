import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    backend,
    backendGestionTrabajoDeGrado,
} from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';
import { Docente } from 'src/app/modules/gestion-docentes/models/docente';

@Injectable({
    providedIn: 'root',
})
export class DocenteService {
    constructor(private http: HttpClient) {}

    // filterDocentes(filter: string): Observable<Docente[]> {
    //     return this.http.get<Docente[]>(
    //         backend(`docentes/filtrar/${filter.trim()}`),
    //         { headers: getHeaders() }
    //     );
    // }

    // listDocentes(): Observable<Docente[]> {
    //     return this.http.get<Docente[]>(backend('docentes'), {
    //         headers: getHeaders(),
    //     });
    // }

    listarDocentes(): Observable<any[]> {
        return this.http.get<Docente[]>(
            backendGestionTrabajoDeGrado(
                'solicitud_examen_valoracion/listarDocentes'
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    obtenerDocente(id: number): Observable<any> {
        return this.http.get<Docente>(
            backendGestionTrabajoDeGrado(
                `solicitud_examen_valoracion/docente/${id}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }
}
