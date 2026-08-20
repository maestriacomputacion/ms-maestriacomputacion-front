export interface PeriodoAcademicoDto {
    id: number;
    tagPeriodo: number;
    anio: number;
    fechaInicio: string;
    fechaFin: string;
    estado: string;
    activo: boolean;
    // Aliases de compatibilidad con componentes existentes
    periodo?: number;
    año?: number;
}

// Alias de compatibilidad — los componentes existentes siguen usando este nombre
export type PeriodoFinancieroDTORespuesta = PeriodoAcademicoDto;

// Alias de compatibilidad para peticiones legacy
export interface PeriodoFinancieroDTOPeticion {
    periodo: number;
    año: number;
}
