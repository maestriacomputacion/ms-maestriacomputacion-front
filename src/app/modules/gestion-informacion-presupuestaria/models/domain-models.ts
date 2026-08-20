export interface PeriodoFinanciero {
    periodo: number;
    año: number;
}

export interface Materia {
    codigo: string;
    nombre: string;
    creditos: number;
}

export interface ConfiguracionReporteFinanciero {
    id: number;
    esReporteFinal: boolean;
    biblioteca: number;
    recursosComputacionales: number;
    valorSMLV: number;
    porcentajeVotacionFijo: number;
    porcentajeEgresadoFijo: number;
    totalNeto?: number;
    totalDescuentos?: number;
    totalIngresos?: number;
    objPeriodoFinanciero: PeriodoFinanciero;
}

export interface ProyeccionEstudiante {
    id?: number;
    esSimulado?: boolean;
    codigoEstudiante: string;
    nombre: string;
    identificacion: number;
    apellido: string;
    estaPago: boolean;
    aplicaVotacion: boolean;
    porcentajeBeca: number;
    aplicaEgresado: boolean;
    grupoInvestigacion: string;
    valorEnSMLV?: number;
    estadoMatriculaFinanciera?: boolean;
    materias?: Materia[];

    // Campos calculados recibidos del backend
    valorMatricula?: number;
    valorDescuentoVoto?: number;
    valorDescuentoBeca?: number;
    valorDescuentoEgresado?: number;
    totalDescuentos?: number;
    valorNeto?: number;
    totalNetoConDerechos?: number;
}

export interface ReporteProyeccionEstudiantes {
    estudiantes: ProyeccionEstudiante[];
    objConfiguracion: ConfiguracionReporteFinanciero;
    periodo: PeriodoFinanciero;
    totalNeto?: number;
    totalDescuentos?: number;
    totalIngresos?: number;
}

export interface ReporteEstudiantes {
    estudiantes: ProyeccionEstudiante[];
    objConfiguracion: ConfiguracionReporteFinanciero;
    periodo: PeriodoFinanciero;
    totalNeto?: number;
    totalDescuentos?: number;
    totalIngresos?: number;
}

export interface GastoGeneral {
    idGastoGeneral: number;
    categoria: string;
    descripcion: string;
    monto: number;
}
export interface ConfiguracionReporteGrupos {
    id?: number;
    aUIPorcentaje: number;
    excedentesMaestria: number;
    aUIValor: number;
    ingresosNetos: number;
    totalGastosGenerales: number;
    valorADistribuir: number;
    item1: number;
    item2: number;
    imprevistos: number;
    transferenciaUnicauca?: number;
    objPeriodoFinanciero: PeriodoFinanciero;
    gastosGenerales: GastoGeneral[];
}


export interface ReportePorGrupoFila {
    grupoId: number;
    nombreGrupo: string;
    porcentajeParticipacion: number;
    porcentajePrimerSemestre: number;
    porcentajeSegundoSemestre: number;
    vigenciasAnteriores: number;
    presupuestoPorGrupo: number;
    aportePrimerSemestre: number;
    aporteSegundoSemestre: number;
    // Campos calculados/derivados usados por componentes y excel
    participacionPrimerSemestre: number;
    participacionSegundoSemestre: number;
    participacionPorAnio: number;
    presupuestoPorGrupoItem1: number;
    presupuestoPorGrupoItem2: number;
    imprevistos: number;
    presupuestoPorGrupoImprevistos: number;
    totalNeto: number;
}

export interface ReportePorGrupos {
    gastosGenerales: GastoGeneral[];
    objConfiguracionReporteGrupos: ConfiguracionReporteGrupos;
    filasPorGrupo: ReportePorGrupoFila[];
    anio?: number;
    esEditable?: boolean;
    ingresoPeriodo1?: number;
    ingresoPeriodo2?: number;
    totalIngresos: number;
    // Campos agregados usados por componentes y excel
    totalNeto: number;
    aportePrimerSemestre: number;
    aporteSegundoSemestre: number;
    porcentajePrimerSemestre: number;
    porcentajeSegundoSemestre: number;
    participacionPrimerSemestre: number;
    participacionSegundoSemestre: number;
    participacionPorAnio: number;
    presupuestoPorGrupoItem1: number;
    presupuestoPorGrupoItem2: number;
    presupuestoPorGrupo: number;
    imprevistos: number;
    presupuestoPorGrupoImprevistos: number;
    vigenciasAnteriores: number;
    transferenciaUnicauca?: number;
}

export interface PorcentajeGrupo {
    idGrupo: string;
    nombreGrupo: string;
    porcentaje: number;
}

export interface ValorGrupo {
    idGrupo: string;
    nombreGrupo: string;
    valor: number;
}

export interface Items {
    item1: number;
    item2: number;
}
