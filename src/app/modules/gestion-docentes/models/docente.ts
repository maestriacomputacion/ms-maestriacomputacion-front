import { LineaInvestigacion } from "./linea-investigacion";
import { Persona } from "./persona";
import { Titulo } from "./titulo";

export interface Docente {
    id?: number;
    estado?: string;
    persona?: Persona;
    codigo?: string;
    facultad?: string;
    departamento?: string;
    escalafon?: string;
    observacion?: string;
    lineasInvestigacion?: LineaInvestigacion[];
    tipoVinculacion?: string;
    titulos?: Titulo[];
}
