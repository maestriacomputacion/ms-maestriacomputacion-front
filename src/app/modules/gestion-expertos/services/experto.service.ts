import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { backend } from 'src/app/core/constants/api-url';
import { Experto } from '../models/experto';
import { getHeaders } from 'src/app/core/constants/header';

@Injectable({
    providedIn: 'root',
})
export class ExpertoService {
    constructor(private http: HttpClient) {}

    createExperto(experto: Experto) {
        return this.http.post<any>(backend('expertos'), experto, {
            headers: getHeaders(),
        });
    }

    updateExperto(id: number, experto: Experto) {
        return this.http.put<any>(backend(`expertos/${id}`), experto, {
            headers: getHeaders(),
        });
    }

    getExperto(id: number) {
        return this.http.get<Experto>(backend(`expertos/${id}`), {
            headers: getHeaders(),
        });
    }

    listExpertos(): Observable<Experto[]> {
        return this.http.get<Experto[]>(backend('expertos'), {
            headers: getHeaders(),
        });
    }

    uploadExpertos(file: File): Observable<any> {
        const formData: FormData = new FormData();
        formData.append('file', file, file.name);
        return this.http.post(backend('expertos/upload'), formData);
    }

    deleteExperto(id: number) {
        return this.http.patch<any>(backend(`expertos/eliminar-logico/${id}`), {
            headers: getHeaders(),
        });
    }

    obtenerLineasInvestigacion(): Observable<any[]> {
        return this.http.get<any[]>(
            backend('lineas-investigacion/categoria/listar/ACTIVO'),
            { headers: getHeaders() }
        );
    }

    cambiarEstadoExperto(id: number, estado: string) {
        return this.http.patch(
            backend(`expertos/${id}/estado`),
            { estado },
            { headers: getHeaders(), responseType: 'text' }
        );
    }
}
