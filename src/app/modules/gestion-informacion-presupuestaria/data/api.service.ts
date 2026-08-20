import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { backendInfoPresupuestaria } from 'src/app/core/constants/api-url';
import { ConfiguracionReporteFinancieroDTOPeticion } from '../dto/configuracion-reporte-financiero.dto';
import { ProyeccionEstudianteDTOPeticion, CrearEstudianteSimuladoDTOPeticion, ActualizarEstudianteSimuladoDTOPeticion } from '../dto/proyeccion-estudiante.dto';
import { ProyectarPresupuestoDTOPeticion } from '../dto/proyectar-presupuesto.dto';
import { PeriodoAcademicoDto } from '../dto/periodo-financiero.dto';
import { ReporteProyeccionEstudiantesDTORespuesta } from '../dto/reporte-proyeccion-estudiantes.dto';
import { ReporteEstudiantesDTORespuesta } from '../dto/reporte-estudiantes.dto';
import { ConsultaReportePorGruposDTORespuesta } from '../dto/reporte-por-grupos.dto';
import { ActualizarParticipacionDTOPeticion } from '../dto/porcentaje-grupo.dto';
import { GastoGeneralDTOPeticion } from '../dto/gasto-general.dto';

@Injectable()
export class GestionInformacionPresupuestariaApiService {

    constructor(private http: HttpClient) {}

    obtenerPeriodos(): Observable<PeriodoAcademicoDto[]> {
        return this.http.get<PeriodoAcademicoDto[]>(backendInfoPresupuestaria('periodos'));
    }

    obtenerPeriodosActivos(): Observable<PeriodoAcademicoDto[]> {
        return this.http.get<PeriodoAcademicoDto[]>(backendInfoPresupuestaria('periodos/activos'));
    }

    obtenerPeriodosFinalizados(): Observable<PeriodoAcademicoDto[]> {
        return this.http.get<PeriodoAcademicoDto[]>(backendInfoPresupuestaria('periodos/finalizados'));
    }

    obtenerPeriodosActivosYFinalizados(): Observable<PeriodoAcademicoDto[]> {
        return this.http.get<PeriodoAcademicoDto[]>(backendInfoPresupuestaria('periodos/activos-y-finalizados'));
    }

    obtenerPeriodoProyeccion(): Observable<PeriodoAcademicoDto> {
        return this.http.get<PeriodoAcademicoDto>(backendInfoPresupuestaria('periodos/proyeccion'));
    }

    proyectarPresupuesto(dto: ProyectarPresupuestoDTOPeticion): Observable<PeriodoAcademicoDto> {
        return this.http.post<PeriodoAcademicoDto>(backendInfoPresupuestaria('periodos/proyeccion'), dto);
    }

    obtenerProyeccionEstudiantes(tagPeriodo?: number, anio?: number): Observable<ReporteProyeccionEstudiantesDTORespuesta> {
        let params = new HttpParams();
        if (tagPeriodo != null) params = params.set('tagPeriodo', tagPeriodo.toString());
        if (anio != null) params = params.set('anio', anio.toString());
        return this.http.get<ReporteProyeccionEstudiantesDTORespuesta>(
            backendInfoPresupuestaria('proyeccion-estudiantes'), { params }
        );
    }

    actualizarProyeccionEstudiante(dto: ProyeccionEstudianteDTOPeticion, tagPeriodo?: number, anio?: number): Observable<ReporteEstudiantesDTORespuesta> {
        let params = new HttpParams();
        if (tagPeriodo != null) params = params.set('tagPeriodo', tagPeriodo.toString());
        if (anio != null) params = params.set('anio', anio.toString());
        return this.http.put<ReporteEstudiantesDTORespuesta>(
            backendInfoPresupuestaria('proyeccion-estudiantes'), dto, { params }
        );
    }

    crearEstudianteSimulado(dto: CrearEstudianteSimuladoDTOPeticion): Observable<ReporteProyeccionEstudiantesDTORespuesta> {
        return this.http.post<ReporteProyeccionEstudiantesDTORespuesta>(
            backendInfoPresupuestaria('proyeccion-estudiantes/simulados'), dto
        );
    }

    actualizarEstudianteSimulado(id: number, dto: ActualizarEstudianteSimuladoDTOPeticion): Observable<ReporteProyeccionEstudiantesDTORespuesta> {
        return this.http.put<ReporteProyeccionEstudiantesDTORespuesta>(
            backendInfoPresupuestaria(`proyeccion-estudiantes/simulados/${id}`), dto
        );
    }

    eliminarEstudianteSimulado(id: number): Observable<ReporteProyeccionEstudiantesDTORespuesta> {
        return this.http.delete<ReporteProyeccionEstudiantesDTORespuesta>(
            backendInfoPresupuestaria(`proyeccion-estudiantes/simulados/${id}`)
        );
    }

    obtenerReporteFinanciero(tagPeriodo: number, anio: number): Observable<ReporteEstudiantesDTORespuesta> {
        const params = new HttpParams()
            .set('tagPeriodo', tagPeriodo.toString())
            .set('anio', anio.toString());
        return this.http.get<ReporteEstudiantesDTORespuesta>(
            backendInfoPresupuestaria('reporte-financiero'), { params }
        );
    }

    obtenerIdConfiguracionReporteFinanciero(tagPeriodo: number, anio: number): Observable<number> {
        const params = new HttpParams()
            .set('tagPeriodo', tagPeriodo.toString())
            .set('anio', anio.toString());
        return this.http.get<number>(
            backendInfoPresupuestaria('configuracion-reporte-financiero/periodo'), { params }
        );
    }

    actualizarConfiguracionReporteFinanciero(id: number, config: ConfiguracionReporteFinancieroDTOPeticion): Observable<ReporteEstudiantesDTORespuesta> {
        return this.http.put<ReporteEstudiantesDTORespuesta>(
            backendInfoPresupuestaria(`configuracion-reporte-financiero/${id}`), config
        );
    }

    obtenerReportePorGrupos(anio: number): Observable<ConsultaReportePorGruposDTORespuesta> {
        const params = new HttpParams().set('anio', anio.toString());
        return this.http.get<ConsultaReportePorGruposDTORespuesta>(
            backendInfoPresupuestaria('reporte-por-grupos'), { params }
        );
    }

    actualizarParticipacionGrupo(dto: ActualizarParticipacionDTOPeticion): Observable<ConsultaReportePorGruposDTORespuesta> {
        return this.http.put<ConsultaReportePorGruposDTORespuesta>(
            backendInfoPresupuestaria('reporte-por-grupos/participacion'), dto
        );
    }

    actualizarPorcentajeAUI(periodoAcademicoId: number, porcentaje: number): Observable<ConsultaReportePorGruposDTORespuesta> {
        const params = new HttpParams()
            .set('periodoAcademicoId', periodoAcademicoId.toString())
            .set('porcentaje', porcentaje.toString());
        return this.http.put<ConsultaReportePorGruposDTORespuesta>(
            backendInfoPresupuestaria('reporte-por-grupos/aui'), null, { params }
        );
    }

    actualizarExcedentesMaestria(periodoAcademicoId: number, valor: number): Observable<ConsultaReportePorGruposDTORespuesta> {
        const params = new HttpParams()
            .set('periodoAcademicoId', periodoAcademicoId.toString())
            .set('valor', valor.toString());
        return this.http.put<ConsultaReportePorGruposDTORespuesta>(
            backendInfoPresupuestaria('reporte-por-grupos/excedentes'), null, { params }
        );
    }

    actualizarVigenciasAnterioresGrupo(periodoAcademicoId: number, grupoId: number, valor: number): Observable<ConsultaReportePorGruposDTORespuesta> {
        const params = new HttpParams()
            .set('periodoAcademicoId', periodoAcademicoId.toString())
            .set('grupoId', grupoId.toString())
            .set('valor', valor.toString());
        return this.http.put<ConsultaReportePorGruposDTORespuesta>(
            backendInfoPresupuestaria('reporte-por-grupos/vigencias'), null, { params }
        );
    }

    actualizarItems(periodoAcademicoId: number, item1: number, item2: number): Observable<ConsultaReportePorGruposDTORespuesta> {
        const params = new HttpParams()
            .set('periodoAcademicoId', periodoAcademicoId.toString())
            .set('item1', item1.toString())
            .set('item2', item2.toString());
        return this.http.put<ConsultaReportePorGruposDTORespuesta>(
            backendInfoPresupuestaria('reporte-por-grupos/items'), null, { params }
        );
    }

    actualizarImprevistos(periodoAcademicoId: number, porcentaje: number): Observable<ConsultaReportePorGruposDTORespuesta> {
        const params = new HttpParams()
            .set('periodoAcademicoId', periodoAcademicoId.toString())
            .set('porcentaje', porcentaje.toString());
        return this.http.put<ConsultaReportePorGruposDTORespuesta>(
            backendInfoPresupuestaria('reporte-por-grupos/imprevistos'), null, { params }
        );
    }

    crearGastoGeneral(periodoAcademicoId: number, dto: GastoGeneralDTOPeticion): Observable<ConsultaReportePorGruposDTORespuesta> {
        const params = new HttpParams().set('periodoAcademicoId', periodoAcademicoId.toString());
        return this.http.post<ConsultaReportePorGruposDTORespuesta>(
            backendInfoPresupuestaria('reporte-por-grupos/gastos'), dto, { params }
        );
    }

    actualizarGastoGeneral(id: number, periodoAcademicoId: number, dto: GastoGeneralDTOPeticion): Observable<ConsultaReportePorGruposDTORespuesta> {
        const params = new HttpParams().set('periodoAcademicoId', periodoAcademicoId.toString());
        return this.http.put<ConsultaReportePorGruposDTORespuesta>(
            backendInfoPresupuestaria(`reporte-por-grupos/gastos/${id}`), dto, { params }
        );
    }

    eliminarGastoGeneral(id: number, periodoAcademicoId: number): Observable<ConsultaReportePorGruposDTORespuesta> {
        const params = new HttpParams().set('periodoAcademicoId', periodoAcademicoId.toString());
        return this.http.delete<ConsultaReportePorGruposDTORespuesta>(
            backendInfoPresupuestaria(`reporte-por-grupos/gastos/${id}`), { params }
        );
    }
}
