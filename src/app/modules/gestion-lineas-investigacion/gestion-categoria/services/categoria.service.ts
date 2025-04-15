import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { backend } from 'src/app/core/constants/api-url';
import { Categoria } from '../models/categoria';
import { getHeaders } from 'src/app/core/constants/header';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CategoriaService {
    constructor(private http: HttpClient) {}

    createCategoria(categoria: Categoria) {
        return this.http.post<any>(
            backend('lineas-investigacion/categoria'),
            categoria,
            {
                headers: getHeaders(),
            }
        );
    }

    //lineas-investigacion/categoria/5
    updateCategoria(id: number, categoria: Categoria) {
        return this.http.put<any>(
            backend(`lineas-investigacion/categoria/${id}`),
            categoria,
            {
                headers: getHeaders(),
            }
        );
    }

    getCategoria(id: number) {
        return this.http.get<Categoria>(
            backend(`lineas-investigacion/categoria/${id}`),
            {
                headers: getHeaders(),
            }
        );
    }

    listCategorias(): Observable<Categoria[]> {
        return this.http.get<Categoria[]>(
            backend('lineas-investigacion/categoria'),
            {
                headers: getHeaders(),
            }
        );
    }

    deleteCategoria(id: number) {
        return this.http.patch<any>(
            backend(`lineas-investigacion/categoria/eliminar/${id}`),
            { headers: getHeaders() }
        );
    }

    cambiarEstadoCategoria(id: number, estado: string) {
        return this.http.patch(
            backend(`lineas-investigacion/categoria/${id}/estado`),
            { estado },
            { headers: getHeaders(), responseType: 'text' }
        );
    }
}
