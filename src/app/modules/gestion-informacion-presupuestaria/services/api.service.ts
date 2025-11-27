import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { backend } from 'src/app/core/constants/api-url';
import { ConfiguracionReporteFinancieroDTOPeticion, ConfiguracionReporteFinancieroDTORespuesta } from '../models/configuracion-reporte-financiero.dto';
import { ProyeccionEstudianteDTOPeticion, ProyeccionEstudianteDTORespuesta } from '../models/proyeccion-estudiante.dto';
import { PeriodoAcademicoDTOPeticion } from '../models/periodo-academico.dto';
import { ReporteProyeccionEstudiantesDTORespuesta } from '../models/reporte-proyeccion-estudiantes.dto';
import { ConfiguracionReporteGruposDTORespuesta } from '../models/configuracion-reporte-grupos.dto';
import { PorcentajeGrupoDTOPeticion } from '../models/porcentaje-grupo.dto';
import { GastoGeneralDTOPeticion, GastoGeneralDTORespuesta } from '../models/gasto-general.dto';
import { ItemsDTOPeticion } from '../models/items.dto';
import { ValorGrupoDTOPeticion } from '../models/valor-grupo.dto';

@Injectable({
    providedIn: 'root'
})
export class GestionInformacionPresupuestariaApiService {
    private readonly baseUrl = 'gestion-informacion-presupuestaria';

    constructor(private http: HttpClient) { }

    // Gestionar Reporte Estudiantes
    actualizarConfiguracionProyeccion(config: ConfiguracionReporteFinancieroDTOPeticion): Observable<ConfiguracionReporteFinancieroDTORespuesta> {
        return this.http.put<ConfiguracionReporteFinancieroDTORespuesta>(backend(`${this.baseUrl}/configuracion-proyeccion`), config);
    }

    actualizarProyeccionEstudiante(proyeccion: ProyeccionEstudianteDTOPeticion): Observable<ProyeccionEstudianteDTORespuesta> {
        return this.http.put<ProyeccionEstudianteDTORespuesta>(backend(`${this.baseUrl}/proyeccion-estudiante`), proyeccion);
    }

    obtenerReporteFinanciero(periodo: PeriodoAcademicoDTOPeticion): Observable<any> { // Replace 'any' with specific DTO if available
        return this.http.post<any>(backend(`${this.baseUrl}/reporte-financiero`), periodo);
    }

    obtenerProyeccionEstudiantes(): Observable<ReporteProyeccionEstudiantesDTORespuesta> {
        return this.http.get<ReporteProyeccionEstudiantesDTORespuesta>(backend(`${this.baseUrl}/proyeccion-estudiantes`));
    }

    // Gestionar Reporte por Grupos
    obtenerReporteGrupos(periodo: PeriodoAcademicoDTOPeticion): Observable<ConfiguracionReporteGruposDTORespuesta> {
        return this.http.post<ConfiguracionReporteGruposDTORespuesta>(backend(`${this.baseUrl}/reporte-grupos`), periodo);
    }

    actualizarPorcentajeParticipacionPrimerSemestre(porcentajes: PorcentajeGrupoDTOPeticion[]): Observable<ConfiguracionReporteGruposDTORespuesta> {
        return this.http.put<ConfiguracionReporteGruposDTORespuesta>(backend(`${this.baseUrl}/porcentaje-participacion-primer-semestre`), porcentajes);
    }

    actualizarPorcentajeParticipacionSegundoSemestre(porcentajes: PorcentajeGrupoDTOPeticion[]): Observable<ConfiguracionReporteGruposDTORespuesta> {
        return this.http.put<ConfiguracionReporteGruposDTORespuesta>(backend(`${this.baseUrl}/porcentaje-participacion-segundo-semestre`), porcentajes);
    }

    actualizarPorcentajeAUIUniversidad(nuevoValor: number): Observable<ConfiguracionReporteGruposDTORespuesta> {
        return this.http.put<ConfiguracionReporteGruposDTORespuesta>(backend(`${this.baseUrl}/porcentaje-aui-universidad`), { nuevoValor });
    }

    actualizarValorExcedentesMaestria(nuevoValor: number): Observable<ConfiguracionReporteGruposDTORespuesta> {
        return this.http.put<ConfiguracionReporteGruposDTORespuesta>(backend(`${this.baseUrl}/valor-excedentes-maestria`), { nuevoValor });
    }

    actualizarGastoGeneral(gasto: GastoGeneralDTOPeticion): Observable<GastoGeneralDTORespuesta> {
        return this.http.put<GastoGeneralDTORespuesta>(backend(`${this.baseUrl}/gasto-general`), gasto);
    }

    crearGastoGeneral(gasto: GastoGeneralDTOPeticion): Observable<GastoGeneralDTORespuesta> {
        return this.http.post<GastoGeneralDTORespuesta>(backend(`${this.baseUrl}/gasto-general`), gasto);
    }

    eliminarGastoGeneral(idGastoGeneral: number): Observable<boolean> {
        return this.http.delete<boolean>(backend(`${this.baseUrl}/gasto-general/${idGastoGeneral}`));
    }

    actualizarPorcentajeItems(items: ItemsDTOPeticion): Observable<ConfiguracionReporteGruposDTORespuesta> {
        return this.http.put<ConfiguracionReporteGruposDTORespuesta>(backend(`${this.baseUrl}/porcentaje-items`), items);
    }

    actualizarPorcentajeImprevistos(nuevoValor: number): Observable<ConfiguracionReporteGruposDTORespuesta> {
        return this.http.put<ConfiguracionReporteGruposDTORespuesta>(backend(`${this.baseUrl}/porcentaje-imprevistos`), { nuevoValor });
    }

    actualizarValorVigenciasAnteriores(valoresGrupo: ValorGrupoDTOPeticion[]): Observable<ConfiguracionReporteGruposDTORespuesta> {
        return this.http.put<ConfiguracionReporteGruposDTORespuesta>(backend(`${this.baseUrl}/valor-vigencias-anteriores`), valoresGrupo);
    }
}
