import { DocenteDTORespuesta } from "./docente.dto";

export interface MateriaDTORespuesta {
    codigoOid?: string;
    materia?: string;
    creditos?: number;
    tipo?: string;
    grupoClase?: string;
    horario?: string;
    salon?: string;
    estadoMatricula?: string;
    observacion?: string;
    docente?: DocenteDTORespuesta;
}
