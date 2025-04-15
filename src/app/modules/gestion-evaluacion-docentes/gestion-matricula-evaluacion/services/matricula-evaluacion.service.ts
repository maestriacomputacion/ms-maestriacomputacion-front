import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { backendEvalucionDocente } from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';

@Injectable({
    providedIn: 'root',
})
export class MatriculaEvaluacionService {
    constructor(private readonly http: HttpClient) { }

    listarEvaluciones(): Observable<any> {
        return this.http.get<any>(backendEvalucionDocente('evaluacion/list'), {
            headers: getHeaders(),
        });
    }

    obtenerEvaluacionMetadata(anio: number, periodo: number): Observable<any> {
        const url = backendEvalucionDocente(`evaluacion/metadata?anio=${anio}&periodo=${periodo}`);
        return this.http.get<any>(url, { headers: getHeaders() });
    }

    registrarEvaluacion(body: {
        anio: number;
        periodo: number;
        id_cuestionario: number;
        fecha_inicio: string;
        fecha_fin: string;
    }): Observable<any> {
        const url = backendEvalucionDocente('evaluacion');
        return this.http.post<any>(url, body, { headers: getHeaders() });
    }


    actualizarEstadoEvaluacion(id: number, estado: string): Observable<string> {
        const url = backendEvalucionDocente(`evaluacion/${id}`);
        return this.http.patch(url, { estado }, { headers: getHeaders(), responseType: 'text' });
    }

}
