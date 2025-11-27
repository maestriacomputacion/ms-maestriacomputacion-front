import { PeriodoAcademicoDTORespuesta } from "./periodo-academico.dto";

export interface ConfiguracionReporteFinanciero {
    esReporteFinal: boolean;
    biblioteca: number;
    recursosComputacionales: number;
    valorMatricula: number;
    valorSMLV: number;
    totalNeto: number;
    totalDescuentos: number;
    totalIngresos: number;
    objPeriodoAcademico: PeriodoAcademicoDTORespuesta;
}

export interface ProyeccionEstudiante {
    codigoEstudiante: string;
    estaPago: boolean;
    porcentajeVotacion: number;
    porcentajeBeca: number;
    porcentajeEgresado: number;
}

export interface ReporteProyeccionEstudiantes {
    estudiantes: ProyeccionEstudiante[];
    objConfiguracion: ConfiguracionReporteFinanciero;
    periodo: PeriodoAcademicoDTORespuesta;
}

export interface GastoGeneral {
    idGastoGeneral: number;
    categoria: string;
    descripcion: string;
    monto: number;
}

export interface Grupo {
    nombre: string;
}

export interface ReportePorGrupos {
    totalNeto: number;
    aportePrimerSemestre: number;
    aporteSegundoSemestre: number;
    participacionPrimerSemestre: number;
    participacionSegundoSemestre: number;
    participacionPorAño: number;
    presupuestoPorGrupoItem1: number;
    presupuestoPorGrupoItem2: number;
    presupuestoPorGrupo: number;
    imprevistos: number;
    presupuestoPorGrupoImprevistos: number;
    vigenciasAnteriores: number;
    gastosGenerales: GastoGeneral[];
    objGrupo: Grupo;
}

export interface ConfiguracionReporteGrupos {
    AUIPorcentaje: number;
    excedentesMaestria: number;
    AUIValor: number;
    ingresosNetos: number;
    valorADistribuir: number;
    item1: number;
    item2: number;
    imprevistos: number;
    objPeriodoAcademico: PeriodoAcademicoDTORespuesta;
    gastosGenerales: GastoGeneral[];
    reportePorGrupos: ReportePorGrupos[];
}

export interface PorcentajeGrupo {
    nombreGrupo: string;
    porcentaje: number;
}

export interface ValorGrupo {
    nombreGrupo: string;
    valor: number;
}

export interface Items {
    item1: number;
    item2: number;
}
