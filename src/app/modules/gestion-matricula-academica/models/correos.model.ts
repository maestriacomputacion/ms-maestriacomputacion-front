export interface TipoCorreo {
    label: string;
    descripcion: string;
    icon: string;
}

export interface CursoCorreo {
    id: number;
    grupo: string;
    asignatura: string;
    docente: string;
    tipo: string;
}

export interface EstudianteCorreo {
    id: number;
    codigo: string;
    nombre: string;
    correo: string;
}

export interface CursoOfertadoReporte {
    id: number;
    grupo: string;
    asignatura: string;
    docente: string;
    areaFormacion: string;
    tipoAsignatura: string;
}
