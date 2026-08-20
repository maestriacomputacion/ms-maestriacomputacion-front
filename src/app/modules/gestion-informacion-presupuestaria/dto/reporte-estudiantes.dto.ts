import { ProyeccionEstudianteDTORespuesta } from './proyeccion-estudiante.dto';
import { ConfiguracionReporteFinancieroDTORespuesta } from './configuracion-reporte-financiero.dto';
import { PeriodoAcademicoDto } from './periodo-financiero.dto';

export interface ReporteEstudiantesDTORespuesta {
    periodo: PeriodoAcademicoDto;
    configuracion: ConfiguracionReporteFinancieroDTORespuesta;
    estudiantes: ProyeccionEstudianteDTORespuesta[];
    totalNeto: number;
    totalDescuentos: number;
    totalIngresos: number;
}
