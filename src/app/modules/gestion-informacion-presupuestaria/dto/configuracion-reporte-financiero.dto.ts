import { PeriodoAcademicoDto } from './periodo-financiero.dto';

export interface ConfiguracionReporteFinancieroDTORespuesta {
    id: number;
    biblioteca: number;
    recursosComputacionales: number;
    valorSMLV: number;
    esReporteFinal: boolean;
    periodo: PeriodoAcademicoDto;
    porcentajeVotacionFijo: number;
    porcentajeEgresadoFijo: number;
}

export interface ConfiguracionReporteFinancieroDTOPeticion {
    biblioteca: number;
    recursosComputacionales: number;
    valorSMLV: number;
    esReporteFinal: boolean;
    objPeriodoFinanciero?: PeriodoAcademicoDto;
}
