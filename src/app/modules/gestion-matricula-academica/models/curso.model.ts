import { PeriodoAcademico } from './periodo-academico.model';
import { Persona } from '../../gestion-estudiantes/models/persona';
import { MaterialApoyo } from './material-apoyo';

// Modelo de asignatura usado en cursos y catalogo.
export interface AsignaturaModel {
    id: number;
    nombre: string;
    codigo?: string;
    estado?: boolean;
    areaFormacion?: number;
    tipo?: string | null;
    creditos?: number;
}

// Modelo de docente con referencia a persona.
export interface DocenteModel {
    id: number;
    persona?: Persona;
    codigo?: string | null;
    facultad?: string | null;
    departamento?: string | null;
}

// Modelo de curso tal como llega del backend.
export interface BackendCurso {
    id: number;
    grupo: string;
    periodo?: PeriodoAcademico | null;
    periodoDescripcion?: string;
    asignatura: AsignaturaModel;
    docentes: DocenteModel[];
    materiales?: MaterialApoyo[];
    horario?: string | null;
    salon?: string | null;
    observacion?: string | null;
}

// Modelo de curso para la UI.
export interface CursoUI {
    id: number;
    grupo: string;
    asignaturaId: number;
    asignatura: string;
    docente: string; // concatenado
    fecha: string; // fecha formateada
    periodoEstado?: string; // estado del periodo (e.g., 'ACTIVO'|'INACTIVO')
    salon?: string | null; // salón asociado al curso
    horario?: string | null; // horario del curso
}

// Payload para registrar/actualizar cursos.
export interface CursoRegistroPayload {
    grupo: string;
    asignaturaId: number;
    docentesIds: number[];
    horario?: string;
    salon?: string;
    materialApoyoIds?: number[];
    observacion?: string;
}
