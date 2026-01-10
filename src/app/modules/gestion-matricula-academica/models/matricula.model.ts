import { Persona } from '../../gestion-estudiantes/models/persona';
import { Estudiante } from '../../gestion-estudiantes/models/estudiante';

export interface CursoMatriculaDetalle {
    cursoId: number;
    observacion: string;
}

export interface EstudianteMatriculaCurso {
    estudianteId: number;
    cursos: CursoMatriculaDetalle[];
}

export interface MatriculaEstudiantesRequest {
    matriculaEstudianteCursos: EstudianteMatriculaCurso[];
}

export interface DocenteBasico {
    id: number;
    persona?: Persona;
    codigo?: string;
    facultad?: string;
    departamento?: string;
}

export interface AsignaturaBasico {
    id: number;
    nombre: string;
    codigo: string;
    estado: boolean;
    areaFormacion: number;
    tipo?: string;
    creditos: number;
}

export interface PeriodoBasico {
    id: number;
    fechaInicio: string;
    fechaFin: string;
    fechaFinMatricula: string;
    tagPeriodo: number;
    descripcion?: string;
    estado: string;
}

export interface CursoDetallado {
    id: number;
    grupo: string;
    periodo: PeriodoBasico;
    periodoDescripcion?: string;
    asignatura: AsignaturaBasico;
    docentes: DocenteBasico[];
    materiales: any[];
    horario?: string;
    salon?: string;
    observacion?: string;
}

export interface MatriculaNoRealizada {
    id?: number;
    estudiante: Estudiante;
    curso: CursoDetallado;
    periodo?: PeriodoBasico;
    motivo: string;
    observacion?: string;
}

export interface MatriculaRealizada {
    id: number;
    estudiante: Estudiante;
    curso: CursoDetallado;
    periodo: PeriodoBasico;
    estado: string;
    observacion: string;
}

export interface MatriculaEliminada {
    id?: number;
    estudiante: Estudiante;
    curso: CursoDetallado;
    periodo?: PeriodoBasico;
    motivo?: string;
    observacion?: string;
    fechaEliminacion?: string;
}

export interface MatriculaResponseData {
    matriculasRealizadas: MatriculaRealizada[];
    matriculasNoRealizadas: MatriculaNoRealizada[];
    matriculasEliminadas?: MatriculaEliminada[];
}

export interface MatriculaResumen {
    cursoId: number;
    periodoId?: number;
    periodoDescripcion: string;
    asignatura: string;
    grupo: string;
    estado: string;
    cantidadEstudiantes: number;
}

export interface MatriculaResumenBackend {
    idCurso: number;
    asignatura: string;
    grupo: string;
    periodo: PeriodoBasico;
    estado: string;
    cantidadEstudiante: number;
}
