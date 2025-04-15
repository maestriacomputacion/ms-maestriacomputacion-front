
import { Movilidad } from "./movilidad";
import { Persona } from "./persona";
import { lineasInvestigacion } from "./linea-investigacion";

export interface Experto {
    id?: number;
    persona?: Persona;
    tituloexper?: string;
    universidadtitexp?: string;
    copiadocidentidad?: string;
    universidadexp?: string;
    facultadexp?: string;
    grupoinvexp?: string;
    lineasInvestigacion?: lineasInvestigacion[]; 
    observacionexp?: string;
    estado?:string;
    movilidad?:Movilidad;

    
}