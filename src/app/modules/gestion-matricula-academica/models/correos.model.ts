// Tipo de correo.
export interface TipoCorreo {
    label: string;
    descripcion: string;
    icon: string;
    ruta?: string;
    accion?: 'enviar-prematricula';
}

// Curso usado en flujos de correo.
export interface CursoCorreo {
    id: number;
    grupo: string;
    asignaturaId: number;
    asignatura: string;
    docente: string;
    tipo?: string;
}

// Estudiante usado en flujos de correo.
export interface EstudianteCorreo {
    id: number;
    codigo: string;
    nombre: string;
    correo: string;
}

// Curso usado en reporte de ofertados.
export interface CursoOfertadoReporte {
    id: number;
    grupo: string;
    asignatura: string;
    idAsignatura?: number;
    docente: string;
    areaFormacion: string;
    tipoAsignatura: string;
}
