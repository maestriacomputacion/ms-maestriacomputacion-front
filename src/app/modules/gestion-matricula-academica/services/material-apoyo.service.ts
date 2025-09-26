import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MaterialApoyo } from '../models/material-apoyo';

@Injectable({
    providedIn: 'root',
})
export class MaterialApoyoService {
    constructor(private readonly http: HttpClient) {}

    listMaterialApoyo(): Observable<any> {
        return this.http.get<any>(
            'assets/app/modules/gestion-matricula-academica/data/material-apoyo.json'
        );
    }

    getMaterialApoyo(id: number): Observable<MaterialApoyo> {
        // Para integración real, se usará un endpoint tipo `/material-apoyo/{id}`
        return this.http.get<MaterialApoyo>(
            'assets/app/modules/gestion-matricula-academica/data/material-apoyo.json'
        );
    }

    // Métodos de creación, actualización y eliminación quedan listos para integración futura
    createMaterialApoyo(material: MaterialApoyo): Observable<any> {
        // return this.http.post<any>('URL_API/material-apoyo', material);
        return this.http.get<any>(
            'assets/app/modules/gestion-matricula-academica/data/material-apoyo.json'
        );
    }

    updateMaterialApoyo(id: number, material: MaterialApoyo): Observable<any> {
        // return this.http.put<any>(`URL_API/material-apoyo/${id}`, material);
        return this.http.get<any>(
            'assets/app/modules/gestion-matricula-academica/data/material-apoyo.json'
        );
    }

    deleteMaterialApoyo(id: number): Observable<any> {
        // return this.http.delete<any>(`URL_API/material-apoyo/${id}`);
        return this.http.get<any>(
            'assets/app/modules/gestion-matricula-academica/data/material-apoyo.json'
        );
    }
}
