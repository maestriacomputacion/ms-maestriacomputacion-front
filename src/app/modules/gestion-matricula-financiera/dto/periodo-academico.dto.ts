export interface PeriodoAcademicoDTORespuesta {
    id?: number;
    periodo?: number;
    anio?: number;
    tagPeriodo?: number;
    fechaInicio?: string;
    fechaFin?: string;
    fechaFinMatricula?: string;
    descripcion?: string;
    estado?: string;
}

export interface PeriodoAcademicoDTOPeticion {
    tagPeriodo?: number;
    anio?: number;
    fechaInicio?: string;
    fechaFin?: string;
    fechaFinMatricula?: string;
    descripcion?: string;
    estado?: string;
}
