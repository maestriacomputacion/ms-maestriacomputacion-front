import { LineaInvestigacion } from "../../gestion-docentes/models/linea-investigacion";
import { Titulo } from "../../gestion-docentes/models/titulo";
import { Persona } from "./persona";

export interface Experto {
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
