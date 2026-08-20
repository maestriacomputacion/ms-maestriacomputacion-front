import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { backendGestionMatriculaFinanciera, backendGestionSolicitudes } from 'src/app/core/constants/api-url';
import { PeriodoAcademicoDTOPeticion, PeriodoAcademicoDTORespuesta } from '../dto/periodo-academico.dto';
import { EstudianteDTORespuesta } from '../dto/estudiante.dto';

export interface SolicitudCertificadoVotacion {
    id_Certificado: string;
    id_Estudiante: string;
    estado: string;
}

@Injectable()
export class GestionMatriculaFinancieraApiService {

    constructor(private http: HttpClient) { }

    obtenerEstudiantes(periodo: PeriodoAcademicoDTOPeticion): Observable<EstudianteDTORespuesta[]> {
        return this.http.post<EstudianteDTORespuesta[]>(backendGestionMatriculaFinanciera('estudiantes'), periodo);
    }

    obtenerEstudiante(codigo: string, tagPeriodo?: number, anio?: number): Observable<EstudianteDTORespuesta> {
        let url = backendGestionMatriculaFinanciera(`estudiantes/${codigo}`);
        const params: string[] = [];
        if (tagPeriodo != null) params.push(`tagPeriodo=${tagPeriodo}`);
        if (anio != null) params.push(`anio=${anio}`);
        if (params.length > 0) url += '?' + params.join('&');
        return this.http.get<EstudianteDTORespuesta>(url);
    }

    obtenerPeriodosAcademicos(): Observable<PeriodoAcademicoDTORespuesta[]> {
        return this.http.get<PeriodoAcademicoDTORespuesta[]>(backendGestionMatriculaFinanciera('periodos'));
    }

    obtenerSolicitudesCertificadoVotacion(): Observable<SolicitudCertificadoVotacion[]> {
        return this.http.get<SolicitudCertificadoVotacion[]>(
            backendGestionSolicitudes('gestionSolicitud/obtener-solicitudes-certificado-votacion')
        );
    }

    tieneDescuentoVoto(codigo: string): Observable<boolean> {
        return this.http.get<boolean>(backendGestionMatriculaFinanciera(`estudiantes/${codigo}/descuento-voto`));
    }
}
