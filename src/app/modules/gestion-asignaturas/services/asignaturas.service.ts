import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Asignatura } from '../models/asignatura';
import { Observable, of, timeout, throwError } from 'rxjs';

import { catchError } from 'rxjs/operators';
import { Acta } from '../models/acta';
import { ConfirmationService, MessageService } from 'primeng/api';

@Injectable({
    providedIn: 'root',
})
export class AsignaturasService {
    private apiUrl = 'http://localhost:8021/api/asignaturas';
    private apiUrlDocentes = 'http://localhost:8091/api/docentes';

    private actas: Acta[] = [];

    constructor(
        private http: HttpClient,
        private messageService: MessageService
    ) {}

    // Método para obtener la lista de docentes
    getListaDocentes(): Observable<any[]> {
        return this.http
            .get<any[]>(this.apiUrlDocentes, this.httpOptions)
            .pipe(catchError(this.handleError<any[]>('getListaDocentes', [])));
    }

    // Método para obtener la lista de asignaturas
    getListaAsignaturas(): Observable<any[]> {
        return this.http
            .get<any[]>(this.apiUrl)
            .pipe(
                catchError(this.handleError<any[]>('getListaAsignaturas', []))
            );
    }

    // Agregar un método para obtener los detalles de una asignatura por su ID
    getDetalleAsignatura(id: number): Observable<any> {
        const url = this.apiUrl + `/completa/${id}`;
        return this.http.get(url);
    }

    // Método para obtener una asignatura que sera editada
    // getAsignaturaEditar(): Observable<any[]> {
    //     return this.http
    //         .get<any[]>(this.apiUrl)
    //         .pipe(
    //             catchError(this.handleError<any[]>('getListaAsignaturas', []))
    //         );
    // }

    // Función para manejar errores
    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.error(error);

            let errorMessage =
                'Ha ocurrido un error. Por favor, intenta nuevamente.';

            if (error.error) {
                if (typeof error.error === 'string') {
                    errorMessage = error.error;
                } else if (error.error instanceof ErrorEvent) {
                    errorMessage = 'Error en la conexión.';
                } else if (error.error.message) {
                    errorMessage = error.error.message;
                }
            }

            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage,
            });

            return throwError(result as T);
        };
    }

    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
        }),
    };
    // Método para registrar la asignatura
    registrarAsignatura(asignatura: any): Observable<any> {
        return this.http
            .post<any>(this.apiUrl, asignatura, this.httpOptions)
            .pipe(catchError(this.handleError<any>('registrarAsignatura')));
    }

    // Método para validar si la asignatura
    // validarAsignaturaUnica(codigoAsignatura: string): boolean {
    //     // Verificar si el código de asignatura ya existe en el arreglo de asignaturas
    //     const existeAsignatura = this.asignaturas.some(
    //         (asignatura) => asignatura.codigoAsignatura === codigoAsignatura
    //     );
    //     return existeAsignatura;
    // }

    editarAsignatura(asignatura: any): Observable<any> {
        return this.http
            .put<any>(
                `${this.apiUrl}/${asignatura.idAsignatura}`,
                asignatura,
                this.httpOptions
            )
            .pipe(catchError(this.handleError<any>('editarAsignatura')));
    }

    // Método para validar si el nombre de una asignatura existe en la base de datos
    validarNombreAsignatura(nombre: string): Observable<boolean> {
        const endpoint = `${this.apiUrl}/nombre/${nombre}`;
        debugger;
        return this.http.get<boolean>(endpoint);
    }

    private asignaturaData: any;

    // Guardar la asignatura en el servicio
    setAsignaturaData(asignatura: any) {
        this.asignaturaData = asignatura;
    }

    // Obtener la asignatura del servicio
    getAsignaturaData() {
        return this.asignaturaData;
    }

    // Limpiar la asignatura almacenada en el servicio
    clearAsignaturaData() {
        this.asignaturaData = null;
    }
}
