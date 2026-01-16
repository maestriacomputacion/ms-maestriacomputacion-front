import { Persona } from '../../gestion-estudiantes/models/persona';

export interface DocenteListado {
    id: number;
    persona: Persona;
    codigo: string;
    facultad: string;
    departamento: string;
    estado: string;
}

export interface TutorListadoBackend {
    docente: DocenteListado;
    totalEstudiantes: number;
}

export interface TutorListado {
    docenteId: number;
    nombre: string;
    codigo: string;
    correo: string;
    estado: string;
    cantidadEstudiantes: number;
}
