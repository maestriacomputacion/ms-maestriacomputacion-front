import { GastoGeneralDTORespuesta } from './gasto-general.dto';
import { PeriodoAcademicoDto } from './periodo-financiero.dto';

export interface ReportePorGrupoDTORespuesta {
    grupoId: number;
    nombreGrupo: string;
    porcentajeParticipacion: number;
    porcentajePrimerSemestre: number;
    porcentajeSegundoSemestre: number;
    vigenciasAnteriores: number;
    presupuestoPorGrupo: number;
    presupuestoPorGrupoItem1: number;
    presupuestoPorGrupoItem2: number;
    subtotalPorGrupo?: number;
    imprevistosValor: number;
    totalNetoPeriodo?: number;
    totalNeto: number;
    aportePrimerSemestre: number;
    aporteSegundoSemestre: number;
}

export interface ConsultaReportePorGruposDTORespuesta {
    periodo: PeriodoAcademicoDto;
    anio?: number;
    esEditable?: boolean;
    ingresoPeriodo1?: number;
    ingresoPeriodo2?: number;
    auiPorcentaje: number;
    auiValor: number;
    excedentesMaestria: number;
    item1: number;
    item2: number;
    imprevistos: number;
    totalIngresos: number;
    /** Ingresos netos = totalIngresos - auiValor - excedentesMaestria */
    ingresosNetos?: number;
    /** Suma de gastos generales globales de la maestría */
    totalGastosGenerales?: number;
    valorADistribuir: number;
    totalItem1?: number;
    totalItem2?: number;
    totalImprevistos?: number;
    totalVigenciasAnteriores?: number;
    totalNeto?: number;
    aportePrimerSemestre?: number;
    aporteSegundoSemestre?: number;
    porcentajePrimerSemestre?: number;
    porcentajeSegundoSemestre?: number;
    participacionPrimerSemestre?: number;
    participacionSegundoSemestre?: number;
    participacionPorAnio?: number;
    transferenciaUnicauca?: number;
    reportesPorGrupo: ReportePorGrupoDTORespuesta[];

    gastosGenerales: GastoGeneralDTORespuesta[];
    idConfiguracionReporteGrupos: number;
}

