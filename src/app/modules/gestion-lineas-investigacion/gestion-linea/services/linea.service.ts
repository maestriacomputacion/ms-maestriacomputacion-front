import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Linea } from '../models/linea';
import { backend } from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LineaService {
    constructor(private http: HttpClient) {}

    createLinea(linea: Linea) {
        return this.http.post<any>(backend('lineas-investigacion'), linea, {
            headers: getHeaders(),
        });
    }

    listLineas(): Observable<Linea[]> {
        return this.http.get<Linea[]>(backend('lineas-investigacion'), {
            headers: getHeaders(),
        });
    }

    updateLinea(id: number, linea: Linea) {
        return this.http.put<any>(
            backend(`lineas-investigacion/${id}`),
            linea,
            {
                headers: getHeaders(),
            }
        );
    }

    getLinea(id: number) {
        return this.http.get<Linea>(backend(`lineas-investigacion/${id}`), {
            headers: getHeaders(),
        });
    }

    deleteLinea(id: number) {
        return this.http.patch<any>(
            backend(`lineas-investigacion/${id}`),
            { headers: getHeaders() }
        );
    }

    cambiarEstadoLinea(id: number, estado: string) {
        return this.http.patch(
            backend(`lineas-investigacion/${id}/estado`),
            { estado },
            { headers: getHeaders(), responseType: 'text' }
        );
    }

    getLineaInvestigacion(id: number) {
        return this.http.get<any>(backend(`lineas-investigacion/${id}`), {
            headers: getHeaders(),
        });
    }
}
