import { Pregunta } from "../../gestion-preguntas/models/pregunta";

export interface Cuestionario {
    id?: number;
    nombre?: string;
    cantidad_preguntas?: number;
    observacion?: string;
    estado?: string;
    fecha_creacion?: string;
    preguntas?: Pregunta[];
}