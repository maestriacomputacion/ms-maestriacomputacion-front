import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { backendGestionEgresados } from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';
import { CursoRequest, CursoResponse } from '../models/curso';

@Injectable({
    providedIn: 'root',
})
export class CursoService {
    constructor(private http: HttpClient) {}

    listarAsignaturas(): Observable<any> {
        return this.http.get<any>(
            backendGestionEgresados(`curso/listarCursosRegistrados`),
            {
                headers: getHeaders(),
            }
        );
    }

    listCursos(estudianteId: number): Observable<CursoResponse[]> {
        return this.http.get<CursoResponse[]>(
            backendGestionEgresados(
                `curso/listarCursosDictados/${estudianteId}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    getCurso(id: number): Observable<any> {
        return this.http.get<CursoResponse>(
            backendGestionEgresados(`curso/${id}`),
            {
                headers: getHeaders(),
            }
        );
    }

    addCurso(curso: CursoRequest): Observable<any> {
        return this.http.post<any>(backendGestionEgresados('curso'), curso, {
            headers: getHeaders(),
        });
    }

    updateCurso(id: number, curso: CursoRequest): Observable<any> {
        return this.http.put<any>(
            backendGestionEgresados(`curso/${id}`),
            curso,
            {
                headers: getHeaders(),
            }
        );
    }
}
