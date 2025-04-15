import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { backendGestionEgresados } from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';
import { Empresa } from '../models/empresa';

@Injectable({
    providedIn: 'root',
})
export class EmpresaService {
    constructor(private http: HttpClient) {}

    getEmpresa(id: number): Observable<any> {
        return this.http.get<Empresa>(
            backendGestionEgresados(`empresa/${id}`),
            {
                headers: getHeaders(),
            }
        );
    }

    addEmpresa(empresa: Empresa): Observable<any> {
        return this.http.post<any>(
            backendGestionEgresados('empresa'),
            empresa,
            {
                headers: getHeaders(),
            }
        );
    }

    updateEmpresa(id: number, empresa: Empresa): Observable<any> {
        return this.http.put<any>(
            backendGestionEgresados(`empresa/${id}`),
            empresa,
            {
                headers: getHeaders(),
            }
        );
    }

    listEmpresas(id: number): Observable<Empresa[]> {
        return this.http.get<Empresa[]>(
            backendGestionEgresados(`empresa/listarEmpresas/${id}`),
            {
                headers: getHeaders(),
            }
        );
    }
}
