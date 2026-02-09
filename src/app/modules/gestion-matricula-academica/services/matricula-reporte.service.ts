import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { matricula_academica } from 'src/environments/environment';

export type MatriculaReporteFormato = 'pdf' | 'xlsx';

@Injectable({ providedIn: 'root' })
export class MatriculaReporteService {
    private readonly backend = `${matricula_academica.api_url}matricula`;

    constructor(private readonly http: HttpClient) {}

    descargarReporteMatriculaEstudiantes(
        formato: MatriculaReporteFormato
    ): Observable<HttpResponse<Blob>> {
        // Segun backend: sin formato => PDF por defecto, con formato=xlsx => Excel.
        let params = new HttpParams();
        if (formato === 'xlsx') {
            params = params.set('formato', 'xlsx');
        }

        return this.http.get(`${this.backend}/reporte`, {
            params,
            responseType: 'blob',
            observe: 'response',
        });
    }
}

