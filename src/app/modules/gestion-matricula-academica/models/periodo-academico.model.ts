// Periodo academico.
export interface PeriodoAcademico {
    id: string;
    fechaInicio: string;
    fechaFin: string;
    fechaFinMatricula: string;
    tagPeriodo: number;
    descripcion?: string | null;
    estado?: string;
}

// Payload sin id para crear/actualizar.
export type PeriodoAcademicoPayload = Omit<PeriodoAcademico, 'id'>;
