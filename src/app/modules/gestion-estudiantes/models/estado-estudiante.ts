import { Prorroga } from "./prorroga";
import { Reingreso } from "./reingreso";

export interface EstadoEstudiante {
    id?: number;
    codigo?: string;
    nombre?: string;
    apellido?: string;
    director?: string;
    codirector?: string;
    semestreAcademico?: number;
    semestreFinanciero?: number;
    estadoMaestria?: string;
    prorrogas?: Prorroga[];
    reingresos?: Reingreso[];
  }
