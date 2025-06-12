import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface PeriodoAcademico {
    id: string;
    fechaInicio: string;
    fechaFin: string;
    fechaFinMatricula: string;
    periodoTag: number;
    descripcion: string;
}

@Injectable({ providedIn: 'root' })
export class PeriodoAcademicoService {
    private readonly periodos: PeriodoAcademico[] = [
        {
            id: '2023-1',
            fechaInicio: '2023-01-23',
            fechaFin: '2023-06-16',
            fechaFinMatricula: '2023-05-31',
            periodoTag: 1,
            descripcion: 'Primer semestre 2023',
        },
        {
            id: '2023-2',
            fechaInicio: '2023-07-17',
            fechaFin: '2023-12-01',
            fechaFinMatricula: '2023-11-15',
            periodoTag: 2,
            descripcion: 'Segundo semestre 2023',
        },
        {
            id: '2024-1',
            fechaInicio: '2024-01-22',
            fechaFin: '2024-06-14',
            fechaFinMatricula: '2024-05-31',
            periodoTag: 1,
            descripcion: 'Primer semestre 2024',
        },
        {
            id: '2024-2',
            fechaInicio: '2024-07-15',
            fechaFin: '2024-11-29',
            fechaFinMatricula: '2024-11-10',
            periodoTag: 2,
            descripcion: 'Segundo semestre 2024',
        },
    ];

    getPeriodos(): Observable<ApiResponse<PeriodoAcademico[]>> {
        return of({
            typeResponse: 'SUCCESS',
            message: 'Periodos cargados correctamente',
            data: this.periodos,
            statusCode: 200,
        });
    }
}
