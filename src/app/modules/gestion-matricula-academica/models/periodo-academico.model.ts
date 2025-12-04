export interface PeriodoAcademico {
    id: string;
    fechaInicio: string;
    fechaFin: string;
    fechaFinMatricula: string;
    tagPeriodo: number;
    descripcion?: string | null;
    estado?: string;
}
