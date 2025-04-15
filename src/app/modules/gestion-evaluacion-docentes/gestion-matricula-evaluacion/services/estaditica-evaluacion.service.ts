import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { backendEvalucionDocente } from 'src/app/core/constants/api-url'; // Ajusta según tu ruta del backend
import { getHeaders } from 'src/app/core/constants/header'; // Ajusta según tu configuración de headers

@Injectable({
  providedIn: 'root',
})
export class EstadisticaEvaluacionService {
  constructor(private readonly http: HttpClient) {}

  // Obtener estadísticas de evaluación
  getEstadisticasEvaluacion(idEvaluacion: number): Observable<any> {
    return this.http.get<any>(`${backendEvalucionDocente('evaluacion/estadistica/?id_evaluacion=')}${idEvaluacion}`, {
      headers: getHeaders(),
    });
  }

  // Obtener asignaturas para la evaluación
  getAsignaturasEvaluacion(idEvaluacion: number): Observable<any> {
    return this.http.get<any>(`${backendEvalucionDocente('evaluacion/asignatura/?id_evaluacion=')}${idEvaluacion}`, {
      headers: getHeaders(),
    });
  }

  // Obtener docentes por asignatura
  getDocentesPorAsignatura(idEvaluacion: number, idAsignatura: number): Observable<any> {
    return this.http.get<any>(`${backendEvalucionDocente('evaluacion/asignatura/docente/?id_evaluacion=')}${idEvaluacion}&id_asignatura=${idAsignatura}`, {
      headers: getHeaders(),
    });
  }

  // Obtener estadísticas por docente
  getEstadisticasDocente(idEvaluacion: number, idAsignatura: number, idDocente: number): Observable<any> {
    return this.http.get<any>(`${backendEvalucionDocente('evaluacion/estadistica/docente/?id_evaluacion=')}${idEvaluacion}&id_asignatura=${idAsignatura}&id_docente=${idDocente}`, {
      headers: getHeaders(),
    });
  }

  // Generar reporte en formato XLSX
  generarReporte(idEvaluacion: number): Observable<Blob> {
    return this.http.get<Blob>(`${backendEvalucionDocente('evaluacion/estadistica/resportes/?id_evaluacion=')}${idEvaluacion}`, {
      headers: getHeaders(),
      responseType: 'blob' as 'json', 
    });
  }

}
