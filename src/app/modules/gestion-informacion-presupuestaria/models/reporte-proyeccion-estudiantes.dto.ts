import { ProyeccionEstudianteDTORespuesta, ProyeccionEstudianteDTOPeticion } from "./proyeccion-estudiante.dto";
import { ConfiguracionReporteFinancieroDTORespuesta } from "./configuracion-reporte-financiero.dto";
import { PeriodoAcademicoDTORespuesta } from "./periodo-academico.dto";

export interface ReporteProyeccionEstudiantesDTORespuesta {
    estudiantes: ProyeccionEstudianteDTORespuesta[];
    objConfiguracion: ConfiguracionReporteFinancieroDTORespuesta;
    periodo: PeriodoAcademicoDTORespuesta;
}

export interface ReporteProyeccionEstudiantesDTOPeticion {
    objConfiguracion: ConfiguracionReporteFinancieroDTORespuesta;
}
