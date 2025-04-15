import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { backendEvalucionDocente } from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';

@Injectable({
  providedIn: 'root',
})
export class EvaluacionDocenteService {
  constructor(private http: HttpClient) {}

  // Obtener cursos para evaluación por estudiante
  getCursosEvaluacion(idEstudiante: number): Observable<any> {
    return this.http.get<any>(backendEvalucionDocente(`evaluacion/cursosEvaluacion/?id_estudiante=${idEstudiante}`), {
      headers: getHeaders(),
    });
  }

  // Obtener cuestionario por ID
  getCuestionario(idCuestionario: number): Observable<any> {
    return this.http.get<any>(backendEvalucionDocente(`cuestionario/${idCuestionario}`), {
      headers: getHeaders(),
    });
  }

  // Guardar evaluación de respuestas
  guardarEvaluacion(payload: any): Observable<any> {
    return this.http.post<any>(backendEvalucionDocente('evaluacion/respuesta'), payload, {
      headers: getHeaders(),
    });
  }
}
