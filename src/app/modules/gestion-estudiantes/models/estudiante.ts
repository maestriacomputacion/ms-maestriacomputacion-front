import { Beca } from "./beca";
import { Caracterizacion } from "./caracterizacion";
import { InformacionMaestria } from "./informacion-maestria";
import { Persona } from "./persona";
import { Prorroga } from "./prorroga";
import { Reingreso } from "./reingreso";

export interface Estudiante {
    id?: number;
    codigo?: string;
    persona?: Persona;
    idDirector?: number;
    idCodirector?: number;
    beca?: Beca;
    ciudadResidencia?: string;
    correoUniversidad?: string;
    fechaGrado?: string;
    tituloPregrado?: string;
    caracterizacion?: Caracterizacion;
    informacionMaestria?: InformacionMaestria;
    prorrogas?: Prorroga[];
    reingresos?: Reingreso[];
}
