import { PeriodoAcademicoDTORespuesta } from "./periodo-academico.dto";
import { GastoGeneralDTORespuesta } from "./gasto-general.dto";
import { ReportePorGruposDTORespuesta } from "./reporte-por-grupos.dto";

export interface ConfiguracionReporteGruposDTORespuesta {
    AUIPorcentaje: number;
    excedentesMaestria: number;
    AUIValor: number;
    ingresosNetos: number;
    valorADistribuir: number;
    item1: number;
    item2: number;
    imprevistos: number;
    objPeriodoAcademico: PeriodoAcademicoDTORespuesta;
    gastosGenerales: GastoGeneralDTORespuesta[];
    reportePorGrupos: ReportePorGruposDTORespuesta[];
}
