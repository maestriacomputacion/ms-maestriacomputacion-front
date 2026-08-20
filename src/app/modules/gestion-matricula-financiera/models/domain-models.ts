export type EstadoMatricula = 'PENDIENTE' | 'AL_DIA' | 'MORA' | 'EXONERADO' | 'BECADO' | 'ANULADO';

export interface PeriodoAcademico {
    id?: number;
    periodo?: number;
    año?: number;
    tagPeriodo?: number;
    fechaInicio?: string;
    fechaFin?: string;
    fechaFinMatricula?: string;
    descripcion?: string;
    estado?: string;
}

export interface Docente {
    nombre: string;
    apellido?: string;
}

export interface Materia {
    codigo_oid: string;
    materia: string;
    objDocente: Docente;
    grupoClase: string;
    estadoMatricula?: string;
}

export interface MatriculaAcademica {
    semestre: number;
    materias: Materia[];
    objPeriodoAcademico: PeriodoAcademico;
}

export interface MatriculaFinanciera {
    valorEnSMLV: number | null;
    objPeriodoAcademico: PeriodoAcademico;
}

export interface BecaFinanciera {
    resolucion: string;
    porcentaje: number;
    tipo: string;
    estado: string;
    avaladoConcejo: string | null;
}

export interface DescuentoFinanciero {
    resolucion: string;
    porcentaje: number;
    tipo: string;
    estado: string;
    avaladoConcejo: string | null;
}

export interface Estudiante {
    codigo: string;
    nombre: string;
    apellido: string;
    identificacion: number;
    cohorte: string;
    periodoIngreso: string;
    semestreFinanciero: number;
    semestreAcademico?: number;
    valorEnSMLV?: number | null;
    esEgresadoUnicauca?: boolean;
    aplicaVotacion?: boolean;
    grupoNombre?: string;
    matriculasFinancieras: MatriculaFinanciera[];
    descuentos: DescuentoFinanciero[];
    becas: BecaFinanciera[];
    becasDescuentos: BecaFinanciera[];
    materias: Materia[];
    estaPago?: boolean;
}
