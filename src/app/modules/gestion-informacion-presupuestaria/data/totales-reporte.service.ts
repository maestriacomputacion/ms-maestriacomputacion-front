import { Injectable } from '@angular/core';

export interface TotalesReporte {
    totalNeto: number;
    totalDescuentos: number;
    totalIngresos: number;
}

@Injectable()
export class TotalesReporteService {

    fromBackend(dto: {
        totalNeto?: number | null;
        totalDescuentos?: number | null;
        totalIngresos?: number | null;
    }): TotalesReporte {
        return {
            totalNeto:       dto.totalNeto       ?? 0,
            totalDescuentos: dto.totalDescuentos ?? 0,
            totalIngresos:   dto.totalIngresos   ?? 0,
        };
    }
}
