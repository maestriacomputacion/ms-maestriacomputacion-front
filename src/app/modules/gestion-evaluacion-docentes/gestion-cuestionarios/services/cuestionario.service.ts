import { Injectable } from '@angular/core';
import { Cuestionario } from '../models/cuestionario';
import { getHeaders } from 'src/app/core/constants/header';
import { backendEvalucionDocente } from 'src/app/core/constants/api-url';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CuestionarioService {
    constructor(private http: HttpClient) {}

    createCuestionario(cuestionario: Cuestionario) {
        return this.http.post<any>(backendEvalucionDocente('cuestionario'), cuestionario, {
            headers: getHeaders(),
        });
    }

    updateCuestionario(id: number, cuestionario: Cuestionario) {
        return this.http.put<any>(backendEvalucionDocente(`cuestionario/${id}`), cuestionario, {
            headers: getHeaders(),
        });
    }

    deleteCuestionario(id: number) {
        return this.http.patch<any>(
            backendEvalucionDocente(`cuestionario/eliminar-logico/${id}`),
            { headers: getHeaders() }
        );
    }

    listCuestionarios(): Observable<Cuestionario[]> {
        return this.http.get<Cuestionario[]>(backendEvalucionDocente('cuestionario'));
    }

    cambiarEstadoCuestionario(id: number, estado: string) {
        return this.http.patch(
            backendEvalucionDocente(`cuestionario/${id}/estado`),
            { estado },
            { headers: getHeaders(), responseType: 'text' }
        );
    }

    getCuestionario(id: number) {
        return this.http.get<Cuestionario>(backendEvalucionDocente(`cuestionario/${id}`), {
            headers: getHeaders(),
        });
    }

    addPreguntas(id: number, idPreguntas: number[]) {
        return this.http.post(
            backendEvalucionDocente(`cuestionario/preguntas`),
            { idPreguntas, idCuestionario: id},
            { headers: getHeaders() }
        );
    }
}
