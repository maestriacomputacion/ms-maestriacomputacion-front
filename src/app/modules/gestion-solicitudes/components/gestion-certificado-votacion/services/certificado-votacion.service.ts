import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { httpConfig } from '../../../environments/http-config';

export interface CertificadoVotacion {
  id_Certificado: string;
  id_Estudiante: string;
  estado: string;
  fecha_creacion: string;
  fecha_modificacion: string;
  estadoEstudiante: string;
}

export interface DocumentoCertificadoVotacion {
  documento_firmado: Uint8Array;
}

export interface AcademicPeriod {
  label: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class CertificadoVotacionService {
  private apiUrl = httpConfig.apiUrl;
  private apiUrlSub = httpConfig.apiUrlSub;

  constructor(private http: HttpClient) {}

  private manejarError(error: any) {
    console.error('Ocurrió un error', error);
    return throwError('Algo salió mal; por favor, intenta nuevamente más tarde.');
  }

  obtenerCertificado() {
    const url = `${httpConfig.apiGesion}${httpConfig.obtenerCertificadosVotos}`;
    return this.http.get<CertificadoVotacion[]>(url).pipe(
      catchError(this.manejarError)
    );
  }

  downloadCertificado(params: { estado_solicitud: string, estado_estudiante: string }): Observable<Blob> {
    const url = `${httpConfig.apiGesion}${httpConfig.descargarCertificadosVotos}`;
    
    const headers = new HttpHeaders({
      'Accept': 'application/zip',
      'Content-Type': 'application/json'
    });
  
    return this.http.post(url, params, {
      responseType: 'blob',
      headers: headers
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error en la descarga';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código de error: ${error.status}, mensaje: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
  
  actualizarEstadoSolicitud(body: any): Observable<any> {
    const url = `${this.apiUrl}${httpConfig.actualizarEstadoSolicitud}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(url, body, { headers }).pipe(catchError(this.manejarError));
  } 
  
}