import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, combineLatest } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class DocumentosService {
    private apiUrl = 'http://localhost:8020'; // URL de la API del servidor

    constructor(private http: HttpClient) {}

    // Método para obtener todos los documentos
    getDocumentosActas(): Observable<any[]> {
        return this.http
            .get<any[]>(this.apiUrl + '/api/actas/estado/true')
            .pipe(catchError(this.handleError<any[]>('/api/actas', [])));
    }

    // Método para obtener todos los documentos
    getDocumentosOficios(): Observable<any[]> {
        return this.http
            .get<any[]>(this.apiUrl + '/api/oficios/estado/true')
            .pipe(catchError(this.handleError<any[]>('/api/oficios', [])));
    }

    // Método para obtener todos los documentos
    getDocumentosOtros(): Observable<any[]> {
        return this.http
            .get<any[]>(this.apiUrl + '/api/otros/estado/true')
            .pipe(catchError(this.handleError<any[]>('/api/otros', [])));
    }

    // Método para obtener un documento por su ID
    getDocumentoById(id: number): Observable<any> {
        const url = `${this.apiUrl}/${id}`;
        return this.http
            .get<any>(url)
            .pipe(
                catchError(this.handleError<any>(`getDocumentoById id=${id}`))
            );
    }

    // Método para crear un nuevo documento tipo acta
    createDocumentoActa(documento: any): Observable<any> {
        return this.http
            .post<any>(this.apiUrl + '/api/actas', documento, this.httpOptions)
            .pipe( catchError(error => {
                // Aquí capturas el error completo y devuelves el mensaje con detalles
                console.log(error)
                const errorMessage = `Error al crear el documento tipo Acta: ${error.message}`;
                return throwError(error);
            }));
    }

    // Método para crear un nuevo documento tipo Oficio
    createDocumentoOficio(documento: any): Observable<any> {
        return this.http
            .post<any>(
                this.apiUrl + '/api/oficios',
                documento,
                this.httpOptions
            )
            .pipe(catchError(this.handleError<any>('createDocumentoOficio')));
    }

    // Método para crear un nuevo documento tipo Oficio
    createDocumentoOtro(documento: any): Observable<any> {
        return this.http
            .post<any>(this.apiUrl + '/api/otros', documento, this.httpOptions)
            .pipe(catchError(this.handleError<any>('createDocumentoOtro')));
    }

    // Método para actualizar un documento existente
    updateDocumento(documento: any): Observable<any> {
        console.log(documento)
        if (documento.tipo === 'Acta') {
            return this.updateDocumentoActa(documento);
        } else if (documento.tipo === 'Oficio') {
            return this.updateDocumentoOficio(documento);
        } else if (documento.tipo === 'Otro') {
            return this.updateDocumentoOtro(documento);
        } else {
            // Manejar tipo de documento no reconocido
            return throwError(() => new Error('Tipo de documento no válido'));
        }
    }

    // Método para actualizar un documento tipo Acta
    private updateDocumentoActa(documento: any): Observable<any> {
        console.log(documento, documento.idDocMaestria.idDocMaestria)
        const url = `${this.apiUrl}/api/actas/${documento.idActa}`;
        return this.http
            .put<any>(url, documento, this.httpOptions)
            .pipe(catchError(this.handleError<any>('updateDocumentoActa')));
    }

    // Método para actualizar un documento tipo Oficio
    private updateDocumentoOficio(documento: any): Observable<any> {
        const url = `${this.apiUrl}/api/oficios/${documento.idOficio}`;
        return this.http
            .put<any>(url, documento, this.httpOptions)
            .pipe(catchError(this.handleError<any>('updateDocumentoOficio')));
    }

    // Método para actualizar un documento tipo Otro
    private updateDocumentoOtro(documento: any): Observable<any> {
        const url = `${this.apiUrl}/api/otros/${documento.idOtroDoc}`;
        return this.http
            .put<any>(url, documento, this.httpOptions)
            .pipe(catchError(this.handleError<any>('updateDocumentoOtro')));
    }

    validarDocumentoPorNumeroActa(numeroActa: string): Observable<boolean> {
        const url = `${this.apiUrl}?numeroActa=${numeroActa}`;
        return this.http.get<any[]>(url).pipe(
            map((documentos) => documentos.length > 0), // Comprueba si hay documentos con el numeroActa dado
            catchError(
                this.handleError<boolean>('validarDocumentoPorNumeroActa')
            )
        );
    }

    // Método para obtener todos los documentos combinados
    getDocumentosCombinados(): Observable<any[]> {
        const actas$ = this.getDocumentosActas();
        const oficios$ = this.getDocumentosOficios();
        const otros$ = this.getDocumentosOtros();

        return combineLatest([actas$, oficios$, otros$]).pipe(
            map(([actas, oficios, otros]) => [...actas, ...oficios, ...otros]),
            catchError(this.handleError<any[]>('documentos combinados', []))
        );
    }

    // Función para manejar errores de peticiones HTTP
    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.error(error);
            // Puedes agregar lógica adicional aquí, como enviar errores a un servicio de logs
            return of(result as T);
        };
    }

    // Manejo de errores
    // private handleError<T>(operation = 'operation', result?: T) {
    //     return (error: any): Observable<T> => {
    //         console.error(error);
    //         // Puedes manejar los mensajes de error aquí, por ejemplo, mostrando mensajes en la interfaz de usuario.
    //         return throwError(result as T);
    //     };
    // }

    // Opciones de encabezado HTTP
    private httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
}
