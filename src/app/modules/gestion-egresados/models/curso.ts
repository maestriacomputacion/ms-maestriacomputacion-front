export interface CursoRequest {
    idEstudiante?: number;
    idCurso?: number;
    orientadoA?: string;
    fechaInicio?: string;
    fechaFin?: string;
}

export interface CursoResponse {
    id?: number;
    nombre?: string;
    orientadoA?: string;
    fechaInicio?: string;
    fechaFin?: string;
}
