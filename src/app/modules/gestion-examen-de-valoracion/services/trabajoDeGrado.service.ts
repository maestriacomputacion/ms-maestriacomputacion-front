import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { backendGestionTrabajoDeGrado } from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';
import { Docente } from '../../gestion-docentes/models/docente';
import { Estudiante } from '../../gestion-estudiantes/models/estudiante';
import { Experto } from '../models/experto';

@Injectable({
    providedIn: 'root',
})
export class TrabajoDeGradoService {
    constructor(private http: HttpClient) {}

    private estudianteSeleccionadoSubject = new BehaviorSubject<Estudiante>(
        null
    );
    private trabajoSeleccionadoSubject = new BehaviorSubject<any>(null);
    private sustentacionSeleccionadaSubject = new BehaviorSubject<any>(null);
    private resolucionSeleccionadaSubject = new BehaviorSubject<any>(null);
    private evaluacionSeleccionadaSubject = new BehaviorSubject<any>(null);
    private respuestaSeleccionadaSubject = new BehaviorSubject<any>(null);
    private solicitudSeleccionadaSubject = new BehaviorSubject<any>(null);
    private tituloSeleccionadoSubject = new BehaviorSubject<string>(null);
    private evaluadorInternoSeleccionadoSubject = new BehaviorSubject<Docente>(
        null
    );
    private evaluadorExternoSeleccionadoSubject = new BehaviorSubject<Experto>(
        null
    );

    estudianteSeleccionado$: Observable<Estudiante> =
        this.estudianteSeleccionadoSubject.asObservable();

    trabajoSeleccionadoSubject$: Observable<any> =
        this.trabajoSeleccionadoSubject.asObservable();

    sustentacionSeleccionadaSubject$: Observable<any> =
        this.sustentacionSeleccionadaSubject.asObservable();

    resolucionSeleccionadaSubject$: Observable<any> =
        this.resolucionSeleccionadaSubject.asObservable();

    solicitudSeleccionadaSubject$: Observable<any> =
        this.solicitudSeleccionadaSubject.asObservable();

    respuestaSeleccionadaSubject$: Observable<any> =
        this.respuestaSeleccionadaSubject.asObservable();

    evaluacionSeleccionadaSubject$: Observable<any> =
        this.evaluacionSeleccionadaSubject.asObservable();

    tituloSeleccionadoSubject$: Observable<string> =
        this.tituloSeleccionadoSubject.asObservable();

    evaluadorInternoSeleccionadoSubject$: Observable<Docente> =
        this.evaluadorInternoSeleccionadoSubject.asObservable();

    evaluadorExternoSeleccionadoSubject$: Observable<Experto> =
        this.evaluadorExternoSeleccionadoSubject.asObservable();

    setEstudianteSeleccionado(estudiante: Estudiante) {
        this.estudianteSeleccionadoSubject.next(estudiante);
    }

    setTrabajoSeleccionado(trabajo: any) {
        this.trabajoSeleccionadoSubject.next(trabajo);
    }

    setSustentacionSeleccionada(sustentacion: any) {
        this.sustentacionSeleccionadaSubject.next(sustentacion);
    }

    setResolucionSeleccionada(resolucion: any) {
        this.resolucionSeleccionadaSubject.next(resolucion);
    }

    setSolicitudSeleccionada(solicitud: any) {
        this.solicitudSeleccionadaSubject.next(solicitud);
    }

    setRespuestaSeleccionada(respuesta: any) {
        this.respuestaSeleccionadaSubject.next(respuesta);
    }

    setEvaluacionSeleccionada(evaluacion: any) {
        this.evaluacionSeleccionadaSubject.next(evaluacion);
    }

    setTituloSeleccionadoSubject(titulo: string) {
        this.tituloSeleccionadoSubject.next(titulo);
    }

    setEvaluadorInternoSeleccionadoSubject(docente: Docente) {
        this.evaluadorInternoSeleccionadoSubject.next(docente);
    }
    setEvaluadorExternoSeleccionadoSubject(experto: Experto) {
        this.evaluadorExternoSeleccionadoSubject.next(experto);
    }

    getEstudiantes(): Observable<any> {
        return this.http.get<Estudiante[]>(
            backendGestionTrabajoDeGrado(`inicio_trabajo_grado`),
            {
                headers: getHeaders(),
            }
        );
    }
    createTrabajoDeGrado(estudianteId: number): Observable<any> {
        return this.http.post<any>(
            backendGestionTrabajoDeGrado(
                `inicio_trabajo_grado/${estudianteId}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    getTrabajoDeGrado(trabajoGradoId: number): Observable<any> {
        return this.http.get<any>(
            backendGestionTrabajoDeGrado(
                `inicio_trabajo_grado/buscarTrabajoGrado/${trabajoGradoId}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    listTrabajosDeGradoPorEstudiante(estudianteId: number): Observable<any> {
        return this.http.get<any>(
            backendGestionTrabajoDeGrado(
                `inicio_trabajo_grado/${estudianteId}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    listTrabajosDeGradoPorEstado(estados: number[]): Observable<any> {
        let params = new HttpParams();
        estados.forEach((estado) => {
            params = params.append('consultarEstados', estado.toString());
        });

        return this.http.get<any>(
            backendGestionTrabajoDeGrado(
                'inicio_trabajo_grado/listarInformacionEstados'
            ),
            {
                headers: getHeaders(),
                params: params,
            }
        );
    }

    cancelTrabajoDeGrado(trabajoGradoId: number): Observable<any> {
        return this.http.put<any>(
            backendGestionTrabajoDeGrado(
                `inicio_trabajo_grado/cancelarTrabajoGrado/${trabajoGradoId}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    deleteTrabajoDeGrado(trabajoGradoId: number): Observable<any> {
        return this.http.delete<any>(
            backendGestionTrabajoDeGrado(
                `inicio_trabajo_grado/${trabajoGradoId}`
            ),
            {
                headers: getHeaders(),
            }
        );
    }

    getFile(rutaArchivo: string): Observable<any> {
        const params = new HttpParams().set('rutaArchivo', rutaArchivo);
        return this.http.get(
            backendGestionTrabajoDeGrado(
                'inicio_trabajo_grado/descargarDocumento'
            ),
            { params, responseType: 'text' }
        );
    }

    verificarDocente(idTrabajoGrado: number): Observable<any> {
        const params = new HttpParams().set('idTrabajoGrado', idTrabajoGrado);
        return this.http.get(
            backendGestionTrabajoDeGrado(
                'inicio_trabajo_grado/verificarDocente'
            ),
            { params, responseType: 'text' }
        );
    }
}
