import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MaterialApoyo } from '../models/material-apoyo';

@Injectable({
    providedIn: 'root',
})
export class MaterialApoyoService {
    constructor(private http: HttpClient) {}

    // Simulación de datos para material de apoyo
    private materialApoyoData: MaterialApoyo[] = [
        {
            id: 1,
            nombre: 'Guía de Métodos de Investigación',
            descripcion:
                'Documento con metodologías de investigación cuantitativa y cualitativa',
            enlace: 'https://drive.google.com/file/d/1ABC123/view?usp=sharing',
            estado: 'ACTIVO',
        },
        {
            id: 2,
            nombre: 'Manual de Redacción Académica',
            descripcion:
                'Guía para la redacción de artículos científicos y tesis',
            enlace: 'https://university.edu/resources/manual-redaccion.pdf',
            estado: 'ACTIVO',
        },
        {
            id: 3,
            nombre: 'Plantilla de Presentaciones',
            descripcion: 'Plantilla estándar para presentaciones de proyectos',
            enlace: 'https://drive.google.com/file/d/1XYZ789/view?usp=sharing',
            estado: 'ACTIVO',
        },
        {
            id: 4,
            nombre: 'Formato de Referencias Bibliográficas',
            descripcion: 'Guía de citación según normas APA 7ma edición',
            enlace: 'https://biblioteca.university.edu/apa-referencias.pdf',
            estado: 'INACTIVO',
        },
        {
            id: 5,
            nombre: 'Manual de Uso de Herramientas Estadísticas',
            descripcion:
                'Guía para uso de SPSS, R y Python en análisis de datos',
            enlace: 'https://analytics.university.edu/manual-herramientas.pdf',
            estado: 'ACTIVO',
        },
    ];

    listMaterialApoyo(): Observable<any> {
        // Simulamos la estructura de respuesta del backend
        const response = {
            typeResponse: 'SUCCESS',
            message: 'Lista de material de apoyo',
            data: [...this.materialApoyoData], // Crear una copia del array
            statusCode: 200,
        };

        return of(response);
    }

    getMaterialApoyo(id: number): Observable<MaterialApoyo> {
        const material = this.materialApoyoData.find((m) => m.id === id);
        return of(material || {});
    }

    createMaterialApoyo(material: MaterialApoyo): Observable<any> {
        // Modificar datos simulados localmente
        const newId =
            Math.max(...this.materialApoyoData.map((m) => m.id || 0)) + 1;
        const newMaterial = { ...material, id: newId, estado: 'ACTIVO' };

        this.materialApoyoData.push(newMaterial);

        const response = {
            typeResponse: 'SUCCESS',
            message: 'Material de apoyo registrado exitosamente',
            data: newMaterial,
            statusCode: 201,
        };

        return of(response);
    }

    updateMaterialApoyo(id: number, material: MaterialApoyo): Observable<any> {
        // Modificar datos simulados localmente
        const index = this.materialApoyoData.findIndex((m) => m.id === id);

        if (index !== -1) {
            this.materialApoyoData[index] = { ...material, id };
        }

        const response = {
            typeResponse: 'SUCCESS',
            message: 'Material de apoyo actualizado exitosamente',
            data: this.materialApoyoData[index],
            statusCode: 200,
        };

        return of(response);
    }

    deleteMaterialApoyo(id: number): Observable<any> {
        // Eliminar de datos simulados localmente
        const index = this.materialApoyoData.findIndex((m) => m.id === id);

        if (index !== -1) {
            this.materialApoyoData.splice(index, 1);
        }

        const response = {
            typeResponse: 'SUCCESS',
            message: 'Material de apoyo eliminado exitosamente',
            data: null,
            statusCode: 200,
        };

        return of(response);
    }
}
