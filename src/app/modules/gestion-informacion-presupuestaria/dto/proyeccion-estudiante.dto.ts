export interface MateriaDto {
    codigo: string;
    nombre: string;
    creditos: number;
}

export interface ProyeccionEstudianteDTORespuesta {
    id?: number;
    codigoEstudiante: string;
    identificacion: number;
    nombre: string;
    apellido: string;
    estaPago: boolean;
    aplicaVotacion: boolean;
    porcentajeBeca: number;
    aplicaEgresado: boolean;
    grupoInvestigacion: string;
    valorEnSMLV: number;
    materias: MateriaDto[];
    estadoMatriculaFinanciera?: boolean;
    becaEstado?: string;
    esSimulado?: boolean;

    // Campos calculados recibidos del backend
    valorMatricula?: number;
    valorDescuentoVoto?: number;
    valorDescuentoBeca?: number;
    valorDescuentoEgresado?: number;
    totalDescuentos?: number;
    valorNeto?: number;
    totalNetoConDerechos?: number;
}

export interface ProyeccionEstudianteDTOPeticion {
    codigoEstudiante: string;
    estaPago: boolean;
    aplicaVotacion: boolean;
    porcentajeBeca: number;
    aplicaEgresado: boolean;
    grupoInvestigacion?: string;
    valorEnSMLV?: number | null;
}

export interface CrearEstudianteSimuladoDTOPeticion {
    periodoAcademicoId: number;
    nombre: string;
    apellido?: string;
    identificacion?: number | null;
    grupoInvestigacion?: string | null;
    valorEnSMLV?: number | null;
}

export interface ActualizarEstudianteSimuladoDTOPeticion {
    nombre: string;
    apellido?: string;
    identificacion?: number | null;
    estaPago: boolean;
    aplicaVotacion: boolean;
    porcentajeBeca: number;
    aplicaEgresado: boolean;
    grupoInvestigacion?: string | null;
    valorEnSMLV?: number | null;
}
