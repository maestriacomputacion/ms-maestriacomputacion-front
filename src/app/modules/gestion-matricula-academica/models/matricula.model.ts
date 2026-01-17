import { Estudiante } from '../../gestion-estudiantes/models/estudiante';
import { AsignaturaModel, DocenteModel } from './curso.model';
import { MaterialApoyo } from './material-apoyo';

// Estudiante para payload de matricula por curso.
export interface EstudianteMatriculaCurso {
    estudianteId: number;
    observacion: string;
}

// Contenedor del request de matricula por curso.
export interface MatriculaEstudiantesRequest {
    cursoId: number;
    estudiantes: EstudianteMatriculaCurso[];
}

// Docente usado en respuestas de matricula.
export interface DocenteBasico extends DocenteModel {
    codigo?: string;
    facultad?: string;
    departamento?: string;
}

// Asignatura usada en respuestas de matricula.
export interface AsignaturaBasico extends AsignaturaModel {
    codigo: string;
    estado: boolean;
    areaFormacion: number;
    tipo?: string;
    creditos: number;
}

// Periodo usado en respuestas de matricula.
export interface PeriodoBasico {
    id: number;
    fechaInicio: string;
    fechaFin: string;
    fechaFinMatricula: string;
    tagPeriodo: number;
    descripcion?: string;
    estado: string;
}

// Detalle de curso usado en respuestas de matricula.
export interface CursoDetallado {
    id: number;
    grupo: string;
    periodo: PeriodoBasico;
    periodoDescripcion?: string;
    asignatura: AsignaturaBasico;
    docentes: DocenteBasico[];
    materiales: MaterialApoyo[];
    horario?: string;
    salon?: string;
    observacion?: string;
}

// Registro de matricula no realizado.
export interface MatriculaNoRealizada {
    id?: number;
    estudiante: Estudiante;
    curso: CursoDetallado;
    periodo?: PeriodoBasico;
    motivo: string;
    observacion?: string;
}

// Registro de matricula realizado.
export interface MatriculaRealizada {
    id: number;
    estudiante: Estudiante;
    curso: CursoDetallado;
    periodo: PeriodoBasico;
    estado: string;
    observacion: string;
}

// Registro de matricula eliminado.
export interface MatriculaEliminada {
    id?: number;
    estudiante: Estudiante;
    curso: CursoDetallado;
    periodo?: PeriodoBasico;
    motivo?: string;
    observacion?: string;
    fechaEliminacion?: string;
}

// Contenedor de respuesta de matricula en batch.
export interface MatriculaResponseData {
    matriculasProcesadas: MatriculaRealizada[];
    matriculasNoProcesadas: MatriculaNoRealizada[];
    matriculasEliminadas?: MatriculaEliminada[];
}

// Resumen de matricula para la UI.
export interface MatriculaResumen {
    cursoId: number;
    periodoId?: number;
    periodoDescripcion: string;
    asignatura: string;
    grupo: string;
    estado: string;
    cantidadEstudiantes: number;
}

// Resumen de matricula tal como llega del backend.
export interface MatriculaResumenBackend {
    idCurso: number;
    asignatura: string;
    grupo: string;
    periodo: PeriodoBasico;
    estado: string;
    cantidadEstudiante: number;
}

// Estudiante matriculado en un curso.
export interface EstudianteMatriculado {
    id: number;
    estudiante: Estudiante;
    estado: string;
    observacion: string;
}

// Curso seleccionado para matricula masiva.
export type CursoSeleccionado = {
    id: number;
    grupo: string;
    nombreAsignatura: string;
    docentes?: string;
    salon?: string;
};

// Estudiante con informacion adicional en UI de matricula.
export type EstudianteExtendido = Estudiante & {
    observaciones?: string;
    motivoError?: string;
    estadoMatricula?: string;
};

// Estado de navegacion para resultado de matricula.
export type MatriculaResultadoState = {
    matriculasProcesadas?: MatriculaRealizada[];
    matriculasNoProcesadas?: MatriculaNoRealizada[];
    matriculasEliminadas?: MatriculaEliminada[];
    origen?: string;
};

// Payload para matricula masiva por estudiantes.
export interface MatriculaEstudianteCurso {
    estudianteId: number;
    cursos: { cursoId: number }[];
}

// Payload batch para matriculas masivas.
export interface MatriculaBatchPayload {
    matriculaEstudianteCursos: MatriculaEstudianteCurso[];
}
