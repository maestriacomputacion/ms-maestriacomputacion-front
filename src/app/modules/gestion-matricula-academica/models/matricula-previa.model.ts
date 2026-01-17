export interface Estudiante {
    codigo: string;
    nombre: string;
    apellidos: string;
    director: string;
    coDirector: string;
    semestreAcademico: string;
}

export interface AsignaturaMatricular {
    id: number;
    grupo: string;
    nombreAsignatura: string;
    docentes: string;
    opciones: string;
    observacion: string;
    estadoMatricula?: string;
}
