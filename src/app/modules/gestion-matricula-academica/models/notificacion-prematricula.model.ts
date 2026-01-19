export interface NotificacionPrematriculaTutor {
    tutorId: number;
    nombre: string;
    codigo: string;
    correo: string;
    totalEstudiantesConMatriculaActiva: number;
    estudiantes?: NotificacionPrematriculaEstudiante[] | null;
}

export interface NotificacionPrematriculaEstudiante {
    id?: number;
    codigo?: string | null;
    correoUniversidad?: string | null;
    persona?: {
        nombre?: string | null;
        apellido?: string | null;
        correoElectronico?: string | null;
    } | null;
}
