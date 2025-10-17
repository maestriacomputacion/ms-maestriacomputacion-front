import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MaterialApoyo } from '../models/material-apoyo';
import { ApiResponse } from '../models/api-response.model';
import { matricula_academica } from 'src/environments/environment';

const backendMateriales = (path: string = '') =>
    `${matricula_academica.api_url}materiales${path ? '/' + path : ''}`;

@Injectable({
    providedIn: 'root',
})
export class MaterialApoyoService {
    constructor(private readonly http: HttpClient) {}

    listMaterialApoyo(): Observable<ApiResponse<MaterialApoyo[]>> {
        return this.http
            .get<ApiResponse<MaterialApoyo[]>>(backendMateriales())
            .pipe(
                map((resp) => ({
                    typeResponse: resp.typeResponse,
                    message: resp.message,
                    statusCode: resp.statusCode,
                    data: (resp.data || []).map(
                        (item: any) =>
                            ({
                                id: item.id,
                                nombre: item.nombre,
                                descripcion: item.descripcion,
                                enlace: item.enlace,
                                estado: item.estado,
                            } as MaterialApoyo)
                    ),
                }))
            );
    }

    getMaterialApoyo(id: number): Observable<MaterialApoyo> {
        return this.http
            .get<ApiResponse<MaterialApoyo>>(backendMateriales(String(id)))
            .pipe(map((resp) => resp.data || ({} as MaterialApoyo)));
    }

    createMaterialApoyo(
        material: MaterialApoyo
    ): Observable<ApiResponse<MaterialApoyo>> {
        const payload = {
            nombre: material.nombre,
            descripcion: material.descripcion,
            enlace: material.enlace,
            estado: material.estado || 'ACTIVO',
        };
        return this.http.post<ApiResponse<MaterialApoyo>>(
            backendMateriales(),
            payload
        );
    }

    updateMaterialApoyo(
        id: number,
        material: MaterialApoyo
    ): Observable<ApiResponse<MaterialApoyo>> {
        const payload = {
            nombre: material.nombre,
            descripcion: material.descripcion,
            enlace: material.enlace,
            estado: material.estado,
        };
        return this.http.put<ApiResponse<MaterialApoyo>>(
            backendMateriales(String(id)),
            payload
        );
    }

    deleteMaterialApoyo(id: number): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(
            backendMateriales(String(id))
        );
    }
}
