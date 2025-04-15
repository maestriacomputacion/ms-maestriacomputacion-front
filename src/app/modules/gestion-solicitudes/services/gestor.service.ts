import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable, of, Subject, tap } from 'rxjs';
import {
    InformacionRoles,
    SolicitudEnComiteResponse,
    SolicitudEnConcejoResponse,
    SolicitudRecibida,
} from '../models/indiceModelos';
import { DatosSolicitudRequest } from '../models/solicitudes/datosSolicitudRequest';

@Injectable({
    providedIn: 'root',
})
export class GestorService {
    // Emisor de evento para descarga de archivos
    private descargarArchivosSource = new Subject<void>();
    descargarArchivos$ = this.descargarArchivosSource.asObservable();

    // Propiedades para manejar el estado de la solicitud seleccionada
    solicitudSeleccionada: SolicitudRecibida;
    infoSolicitud: DatosSolicitudRequest;
    estadoSolicitud: string;
    conceptoComite: SolicitudEnComiteResponse;
    conceptoConsejo: SolicitudEnConcejoResponse;

    // Información del decano y coordinador (cargada desde el servidor)
    InfoDecano: InformacionRoles;
    InfoCoordinador: InformacionRoles;

    // Caché de solicitudes específicas para tutores/directores y coordinadores
    solicitudesTutorDirectorCache: SolicitudRecibida[] = [];
    solicitudesCoordinadorCache: SolicitudRecibida[] = [];
    filtroAnterior: string = ''; // Último filtro aplicado en solicitudes del coordinador

    // Caché por filtro y timestamps para gestionar la caducidad del caché (TTL de 10 minutos)
    private solicitudesPorFiltro: { [filtro: string]: SolicitudRecibida[] } = {};
    private cacheTimestamps: { [filtro: string]: number } = {};
    private cacheTTL: number = 10 * 60 * 1000; // 10 minutos en milisegundos

    constructor(private http: HttpService) {
        // Cargar información del rol de decano y coordinador al iniciar el servicio
        this.cargarInfoDeRol('Presidente', 'InfoDecano');
        this.cargarInfoDeRol('Coordinador', 'InfoCoordinador');
    }

    // Obtiene las solicitudes de tutor/director. Si el caché es válido, lo utiliza.
    obtenerSolicitudesTutorDirector(correoUsuario: string): Observable<SolicitudRecibida[]> {
        const now = Date.now();

        // Si el caché de tutor/director está vigente, retorna los datos almacenados
        if (this.solicitudesTutorDirectorCache.length && now - this.cacheTimestamps['tutorDirector'] < this.cacheTTL) {
            return of(this.solicitudesTutorDirectorCache);
        }

        // Si el caché ha expirado o no existe, realiza una petición al servidor
        return this.http.obtenerListaSolPendientesAval(correoUsuario).pipe(
            tap((solicitudes) => {
                this.solicitudesTutorDirectorCache = solicitudes;
                this.cacheTimestamps['tutorDirector'] = Date.now();
            })
        );
    }

    // Obtiene las solicitudes del coordinador usando el filtro. Utiliza caché si está vigente.
    obtenerSolicitudesCoordinador(filtro: string): Observable<SolicitudRecibida[]> {
        const now = Date.now();

        // Si hay datos en caché para el filtro y están vigentes, los devuelve
        if (this.solicitudesPorFiltro[filtro]?.length && now - this.cacheTimestamps[filtro] < this.cacheTTL) {
            this.solicitudesCoordinadorCache = this.solicitudesPorFiltro[filtro];
            return of(this.solicitudesCoordinadorCache);
        }

        // Si el caché ha expirado o no existe, realiza una petición al servidor
        return this.http.consultarSolicitudesCoordinacion(filtro).pipe(
            tap((solicitudes: SolicitudRecibida[]) => {
                this.solicitudesPorFiltro[filtro] = solicitudes;
                this.cacheTimestamps[filtro] = Date.now();
                this.solicitudesCoordinadorCache = solicitudes;
                this.filtroAnterior = filtro;
            })
        );
    }

    // Mueve una solicitud de un estado a otro, actualizando las listas de caché
    moverSolicitud(solicitud: SolicitudRecibida, estadoActual: string, nuevoEstado: string): void {
        this.eliminarSolicitudDeLista(solicitud, estadoActual);
        this.agregarSolicitudANuevaLista(solicitud, nuevoEstado);
    }

    // Elimina una solicitud de la lista de un filtro específico en caché
    private eliminarSolicitudDeLista(solicitud: SolicitudRecibida, filtro: string): void {
        if (this.solicitudesPorFiltro[filtro]) {
            this.solicitudesPorFiltro[filtro] = this.solicitudesPorFiltro[filtro].filter(
                (sol) => sol.idSolicitud !== solicitud.idSolicitud
            );
        }
    }

    // Agrega una solicitud a la lista de un nuevo estado en caché o recarga desde el servidor si ha caducado
    private agregarSolicitudANuevaLista(solicitud: SolicitudRecibida, filtro: string): void {
        const now = Date.now();

        // Si el caché para el nuevo estado está vigente, agrega la solicitud directamente
        if (this.solicitudesPorFiltro[filtro]?.length && now - this.cacheTimestamps[filtro] < this.cacheTTL) {
            this.solicitudesPorFiltro[filtro].push(solicitud);
        } else {
            // Si el caché ha expirado o no existe, recarga desde el servidor
            this.http.consultarSolicitudesCoordinacion(filtro).subscribe(
                (solicitudes: SolicitudRecibida[]) => {
                    this.solicitudesPorFiltro[filtro] = solicitudes;
                    this.cacheTimestamps[filtro] = Date.now();
                    this.solicitudesPorFiltro[filtro].push(solicitud); // Agregar la nueva solicitud
                },
                (error) => {
                    console.error('Error al actualizar la lista del filtro:', error);
                }
            );
        }
    }

    // Emite un evento para iniciar la descarga de archivos
    emitirDescargarArchivos() {
        this.descargarArchivosSource.next();
    }

    // Restablece los valores de la solicitud seleccionada y su estado
    restablecerValores() {
        this.solicitudSeleccionada = null;
        this.estadoSolicitud = '';
    }

    // Carga la información de un rol específico (decano o coordinador) desde el servidor
    private cargarInfoDeRol(rol: string, propiedad: 'InfoDecano' | 'InfoCoordinador'): void {
        this.http.consultarInfoDeRolExterno(rol).subscribe(
            (data: InformacionRoles) => {
                if (data) {
                    this[propiedad] = data;
                }
            },
            (error) => {
                console.error(`Error al obtener la información de ${rol.toLowerCase()}:`, error);
            }
        );
    }
}
