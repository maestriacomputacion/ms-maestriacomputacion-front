import { Injectable } from '@angular/core';
import {
    ConfiguracionReporteFinancieroDTORespuesta
} from '../dto/configuracion-reporte-financiero.dto';
import {
    ConfiguracionReporteFinanciero,
    ConfiguracionReporteGrupos,
    GastoGeneral,
    Materia,
    PeriodoFinanciero,
    ProyeccionEstudiante,
    ReportePorGrupoFila,
    ReportePorGrupos,
    ReporteProyeccionEstudiantes,
    ReporteEstudiantes
} from '../models/domain-models';
import { GastoGeneralDTORespuesta } from '../dto/gasto-general.dto';
import { PeriodoAcademicoDto } from '../dto/periodo-financiero.dto';
import { MateriaDto, ProyeccionEstudianteDTORespuesta } from '../dto/proyeccion-estudiante.dto';
import { ConsultaReportePorGruposDTORespuesta, ReportePorGrupoDTORespuesta } from '../dto/reporte-por-grupos.dto';
import { ReporteProyeccionEstudiantesDTORespuesta } from '../dto/reporte-proyeccion-estudiantes.dto';
import { ReporteEstudiantesDTORespuesta } from '../dto/reporte-estudiantes.dto';

@Injectable()
export class GestionInformacionPresupuestariaMapperService {

    mappearDeRespuestaAPeriodoFinanciero(dto: PeriodoAcademicoDto): PeriodoFinanciero {
        return {
            periodo: dto.tagPeriodo,
            año: dto.anio
        };
    }

    mappearDeRespuestaAConfiguracionReporteFinanciero(dto: ConfiguracionReporteFinancieroDTORespuesta): ConfiguracionReporteFinanciero {
        return {
            id: dto.id,
            esReporteFinal: dto.esReporteFinal,
            biblioteca: dto.biblioteca,
            recursosComputacionales: dto.recursosComputacionales,
            valorSMLV: dto.valorSMLV,
            porcentajeVotacionFijo: dto.porcentajeVotacionFijo ?? 0.10,
            porcentajeEgresadoFijo: dto.porcentajeEgresadoFijo ?? 0.05,
            objPeriodoFinanciero: this.mappearDeRespuestaAPeriodoFinanciero(dto.periodo)
        };
    }

    mappearDeRespuestaAMateria(dto: MateriaDto): Materia {
        return {
            codigo: dto.codigo,
            nombre: dto.nombre,
            creditos: dto.creditos
        };
    }

    mappearDeRespuestaAProyeccionEstudiante(dto: ProyeccionEstudianteDTORespuesta): ProyeccionEstudiante {
        return {
            id: dto.id,
            esSimulado: dto.esSimulado ?? false,
            codigoEstudiante: dto.codigoEstudiante,
            nombre: dto?.nombre ?? '',
            apellido: dto?.apellido ?? '',
            identificacion: Number(dto?.identificacion) || 0,
            estaPago: dto.estaPago ?? false,
            aplicaVotacion: dto.aplicaVotacion ?? false,
            porcentajeBeca: dto.porcentajeBeca || 0,
            aplicaEgresado: dto.aplicaEgresado ?? false,
            grupoInvestigacion: dto?.grupoInvestigacion ?? '',
            valorEnSMLV: dto.valorEnSMLV,
            materias: (dto.materias ?? []).map(m => this.mappearDeRespuestaAMateria(m)),
            estadoMatriculaFinanciera: dto.estadoMatriculaFinanciera,
            valorMatricula: dto.valorMatricula,
            valorDescuentoVoto: dto.valorDescuentoVoto,
            valorDescuentoBeca: dto.valorDescuentoBeca,
            valorDescuentoEgresado: dto.valorDescuentoEgresado,
            totalDescuentos: dto.totalDescuentos,
            valorNeto: dto.valorNeto,
            totalNetoConDerechos: dto.totalNetoConDerechos
        };
    }

    mappearDeRespuestaAReporteProyeccionEstudiantes(dto: ReporteProyeccionEstudiantesDTORespuesta): ReporteProyeccionEstudiantes {
        return {
            estudiantes: (dto.estudiantes ?? []).map(e => this.mappearDeRespuestaAProyeccionEstudiante(e)),
            objConfiguracion: this.mappearDeRespuestaAConfiguracionReporteFinanciero(dto.configuracion),
            periodo: this.mappearDeRespuestaAPeriodoFinanciero(dto.periodo),
            totalNeto: dto.totalNeto,
            totalDescuentos: dto.totalDescuentos,
            totalIngresos: dto.totalIngresos
        };
    }

    mappearDeRespuestaAReporteEstudiantes(dto: ReporteEstudiantesDTORespuesta): ReporteEstudiantes {
        return {
            estudiantes: (dto.estudiantes ?? []).map(e => this.mappearDeRespuestaAProyeccionEstudiante(e)),
            objConfiguracion: this.mappearDeRespuestaAConfiguracionReporteFinanciero(dto.configuracion),
            periodo: this.mappearDeRespuestaAPeriodoFinanciero(dto.periodo),
            totalNeto: dto.totalNeto,
            totalDescuentos: dto.totalDescuentos,
            totalIngresos: dto.totalIngresos
        };
    }

    mappearDeRespuestaAGastoGeneral(dto: GastoGeneralDTORespuesta): GastoGeneral {
        return {
            idGastoGeneral: dto.id,
            categoria: dto.categoria,
            descripcion: dto.descripcion,
            monto: dto.monto
        };
    }

    mappearDeRespuestaAReportePorGrupoFila(dto: ReportePorGrupoDTORespuesta): ReportePorGrupoFila {
        return {
            grupoId: dto.grupoId,
            nombreGrupo: dto.nombreGrupo,
            porcentajeParticipacion: dto.porcentajeParticipacion,
            porcentajePrimerSemestre: dto.porcentajePrimerSemestre ?? dto.porcentajeParticipacion,
            porcentajeSegundoSemestre: dto.porcentajeSegundoSemestre ?? dto.porcentajeParticipacion,
            vigenciasAnteriores: dto.vigenciasAnteriores,
            presupuestoPorGrupo: dto.presupuestoPorGrupo,
            aportePrimerSemestre: dto.aportePrimerSemestre,
            aporteSegundoSemestre: dto.aporteSegundoSemestre,
            participacionPrimerSemestre: dto.porcentajePrimerSemestre ?? dto.porcentajeParticipacion,
            participacionSegundoSemestre: dto.porcentajeSegundoSemestre ?? dto.porcentajeParticipacion,
            participacionPorAnio: dto.porcentajeParticipacion,
            presupuestoPorGrupoItem1: dto.presupuestoPorGrupoItem1 ?? 0,
            presupuestoPorGrupoItem2: dto.presupuestoPorGrupoItem2 ?? 0,
            imprevistos: dto.imprevistosValor ?? 0,
            presupuestoPorGrupoImprevistos: dto.totalNetoPeriodo ?? dto.presupuestoPorGrupo,
            totalNeto: dto.totalNeto ?? dto.presupuestoPorGrupo
        };
    }

    mappearDeRespuestaAReportePorGrupos(dto: ConsultaReportePorGruposDTORespuesta): ReportePorGrupos {
        const gastos = (dto.gastosGenerales ?? []).map(g => this.mappearDeRespuestaAGastoGeneral(g));
        const filasPorGrupo = (dto.reportesPorGrupo ?? []).map(f => this.mappearDeRespuestaAReportePorGrupoFila(f));
        
        const objConfiguracionReporteGrupos: ConfiguracionReporteGrupos = {
            id: dto.idConfiguracionReporteGrupos,
            aUIPorcentaje: dto.auiPorcentaje ?? 0,
            aUIValor: dto.auiValor ?? 0,
            excedentesMaestria: dto.excedentesMaestria ?? 0,
            ingresosNetos: dto.ingresosNetos ?? 0,
            totalGastosGenerales: dto.totalGastosGenerales ?? 0,
            valorADistribuir: dto.valorADistribuir ?? 0,
            item1: dto.item1 ?? 0,
            item2: dto.item2 ?? 0,
            imprevistos: dto.imprevistos ?? 0,
            transferenciaUnicauca: dto.transferenciaUnicauca ?? 0,
            objPeriodoFinanciero: this.mappearDeRespuestaAPeriodoFinanciero(dto.periodo),
            gastosGenerales: gastos
        };

        return {
            gastosGenerales: gastos,
            filasPorGrupo,
            anio: dto.anio,
            esEditable: dto.esEditable ?? false,
            ingresoPeriodo1: dto.ingresoPeriodo1 ?? 0,
            ingresoPeriodo2: dto.ingresoPeriodo2 ?? 0,
            totalIngresos: dto.totalIngresos ?? 0,
            transferenciaUnicauca: dto.transferenciaUnicauca ?? 0,
            totalNeto: dto.totalNeto ?? dto.valorADistribuir ?? 0,
            aportePrimerSemestre: dto.aportePrimerSemestre ?? dto.ingresoPeriodo1 ?? 0,
            aporteSegundoSemestre: dto.aporteSegundoSemestre ?? dto.ingresoPeriodo2 ?? 0,
            porcentajePrimerSemestre: dto.porcentajePrimerSemestre ?? dto.participacionPrimerSemestre ?? 0,
            porcentajeSegundoSemestre: dto.porcentajeSegundoSemestre ?? dto.participacionSegundoSemestre ?? 0,
            participacionPrimerSemestre: dto.participacionPrimerSemestre ?? dto.porcentajePrimerSemestre ?? 0,
            participacionSegundoSemestre: dto.participacionSegundoSemestre ?? dto.porcentajeSegundoSemestre ?? 0,
            participacionPorAnio: dto.participacionPorAnio ?? 0,
            // Estos son los totales agregados para la fila "Total" en la tabla principal (ahora vienen del back)
            presupuestoPorGrupoItem1: dto.totalItem1 ?? 0,
            presupuestoPorGrupoItem2: dto.totalItem2 ?? 0,
            presupuestoPorGrupo: dto.valorADistribuir ?? 0,
            imprevistos: dto.totalImprevistos ?? 0,
            presupuestoPorGrupoImprevistos: dto.valorADistribuir ?? 0,
            // Sincronización de vigencias anteriores (ahora viene del back)
            vigenciasAnteriores: dto.totalVigenciasAnteriores ?? 0,

            objConfiguracionReporteGrupos
        };
    }

}
