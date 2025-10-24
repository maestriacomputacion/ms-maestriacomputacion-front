export interface AsignaturaModel {
    id: number;
    nombre: string;
    codigo?: string;
    estado?: boolean;
    areaFormacion?: number;
    tipo?: any;
    creditos?: number;
}

export interface DocenteModel {
    id: number;
    nombre?: string | null;
    apellido?: string | null;
    correoElectronico?: string | null;
    telefono?: string | null;
    genero?: string | null;
    tipoIdentificacion?: any;
    codigo?: string | null;
    facultad?: string | null;
    departamento?: string | null;
}

import { PeriodoAcademico } from './periodo-academico.model';

export interface BackendCurso {
    id: number;
    grupo: string;
    periodo?: PeriodoAcademico | null;
    periodoDescripcion?: string;
    asignatura: AsignaturaModel;
    docentes: DocenteModel[];
    materiales?: any[];
    horario?: string | null;
    salon?: string | null;
    observacion?: string | null;
}

// Modelo usado en la UI
export interface CursoUI {
    id: number;
    grupo: string;
    asignatura: string;
    docente: string; // concatenado
    fecha: string; // fecha formateada
}
