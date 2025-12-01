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

export interface MatriculaNoRealizada {
    estudianteId: number;
    cursoId: number;
    motivo: string;
}

export interface MatriculaRealizada {
    estudianteId: number;
    cursoId: number;
}

export interface MatriculaResponseData {
    matriculasRealizadas: MatriculaRealizada[];
    matriculasNoRealizadas: MatriculaNoRealizada[];
}
