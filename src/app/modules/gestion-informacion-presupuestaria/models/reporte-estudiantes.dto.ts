import { EstudianteDTORespuesta } from "./estudiante.dto";
import { ConfiguracionReporteFinancieroDTORespuesta } from "./configuracion-reporte-financiero.dto";
import { PeriodoAcademicoDTORespuesta } from "./periodo-academico.dto";

export interface ReporteEstudiantesDTORespuesta {
    estudiantes: EstudianteDTORespuesta[];
    objConfiguracion: ConfiguracionReporteFinancieroDTORespuesta;
    periodo: PeriodoAcademicoDTORespuesta;
}
