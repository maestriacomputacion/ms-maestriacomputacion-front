import { PeriodoFinancieroDTORespuesta } from "./periodo-financiero.dto";
import { GastoGeneralDTORespuesta } from "./gasto-general.dto";

export interface ConfiguracionReporteGruposDTORespuesta {
    idConfiguracionReporteGrupos?: number;
    aUIPorcentaje: number;
    excedentesMaestria: number;
    aUIValor: number;
    ingresosNetos: number;
    valorADistribuir: number;
    item1: number;
    item2: number;
    imprevistos: number;
    objPeriodoFinanciero: PeriodoFinancieroDTORespuesta;
    gastosGenerales: GastoGeneralDTORespuesta[];
}




