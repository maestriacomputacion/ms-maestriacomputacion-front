
import { Acta } from "./acta";
import { AreaFormacion } from "./areaFormacion";
import { ContenidoProgramatico } from "./contenidoProgramatico";
import { Docente } from "./docente";
import { LineaInvestigacion } from "./lineaInvestigacion";
import { Microcurriculo } from "./microcurriculo";
import { Oficio } from "./oficio";

export interface Asignatura {
    idAsignatura?: number;
    codigoAsignatura?:string;
    oficioFacultad?: number|Oficio;
    lineaInvestigacionAsignatura?: number|LineaInvestigacion;
    contenidoProgramatico?: number|ContenidoProgramatico;
    microcurriculo?: number|Microcurriculo;
    nombreAsignatura?: string;
    estadoAsignatura?: boolean;
    fechaAprobacion?: string|Date;
    areaFormacion?: string|AreaFormacion;
    tipoAsignatura?: string;
    creditos?: number;
    objetivoAsignatura?: string;
    contenidoAsignatura?: string;
    horasPresencial?: number;
    horasNoPresencial?: number;
    horasTotal?: number;
    idDocente?:number[];
    docentesAsignaturas?:Docente[];
    actasAsignaturas?:Acta[];


}
