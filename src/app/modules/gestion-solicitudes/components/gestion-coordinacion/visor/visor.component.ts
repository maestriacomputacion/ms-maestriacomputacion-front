import { Component, OnDestroy, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { GestorService } from '../../../services/gestor.service';
import { HttpService } from '../../../services/http.service';
import { DatosSolicitudRequest } from '../../../models/solicitudes/datosSolicitudRequest';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UtilidadesService } from '../../../services/utilidades.service';
import { SeguimientoService } from '../../../services/seguimiento.service';
import { EventoHistorial, SolicitudRecibida } from '../../../models/indiceModelos';

import * as JSZip from 'jszip';
import { TramiteComponent } from '../tramite/tramite.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-visor',
    templateUrl: './visor.component.html',
    styleUrls: ['./visor.component.scss'],
})
export class VisorComponent implements OnInit, OnDestroy {
    urlOficioPdf: SafeResourceUrl;
    urlPdf: SafeResourceUrl;
    solicitudSeleccionada: SolicitudRecibida;
    datosSolicitud: DatosSolicitudRequest;

    cargandoDatos: boolean = true;

    docsAdjuntos: File[] = [];
    enlacesAdjuntos: string[] = [];

    mostrarGestor: boolean = false;

    private descargaArchivosSubscription: Subscription;

    constructor(
        public gestor: GestorService,
        public http: HttpService,
        public seguimiento: SeguimientoService,
        private utilidades: UtilidadesService,
        private sanitizer: DomSanitizer
    ) {}

    ngOnInit(): void {
        this.recuperarSolicitudSeleccionada();
        this.descargaArchivosSubscription = this.gestor.descargarArchivos$.subscribe(() => {
            this.descargarTodosLosArchivos();
        });
    }

    // Método de limpieza de suscripción al destruir el componente
    ngOnDestroy(): void {
        if (this.descargaArchivosSubscription) {
            this.descargaArchivosSubscription.unsubscribe();
        }
    }

    // Recupera la solicitud seleccionada del localStorage y carga los datos
    recuperarSolicitudSeleccionada(): void {
        const solicitudSeleccionadaJson = localStorage.getItem('solicitudSeleccionada');

        if (solicitudSeleccionadaJson) {
            this.solicitudSeleccionada = JSON.parse(solicitudSeleccionadaJson) as SolicitudRecibida;
            this.gestor.solicitudSeleccionada = this.solicitudSeleccionada;
            this.cargarDatosSolicitud();
        }
    }

    // Carga los datos de la solicitud desde el servidor
    cargarDatosSolicitud(): void {
        this.http.obtenerInfoSolGuardada(this.solicitudSeleccionada.idSolicitud).subscribe(
            async (infoSolicitud: DatosSolicitudRequest) => {
                this.datosSolicitud = infoSolicitud;
                this.gestor.infoSolicitud = infoSolicitud;
                console.log(this.gestor.infoSolicitud);
                this.abrirOficioPdf();
                this.extraerAdjuntos(this.solicitudSeleccionada.codigoSolicitud);
                this.gestor.estadoSolicitud = infoSolicitud.datosComunSolicitud.estadoSolicitud;

                this.restringirLaVista(this.gestor.estadoSolicitud);
                this.cargarHistorialDeSeguimiento();
                this.cargandoDatos = false;
            },
            (error) => {
                console.error('Error al cargar la información de la solicitud:', error);
            }
        );
    }

    // Carga el historial de seguimiento de la solicitud
    cargarHistorialDeSeguimiento(): void {
        this.seguimiento.radicado = this.datosSolicitud.datosComunSolicitud.radicado;

        this.http.consultarHistorialSolicitud(this.seguimiento.radicado).subscribe((data: EventoHistorial[]) => {
            this.seguimiento.historial = data;
        });
    }

    // Restringe la vista del gestor según el estado de la solicitud
    restringirLaVista(estadoSolicitud: string): void {
        switch (estadoSolicitud) {
            case 'Avalada':
            case 'En comité':
            case 'En concejo':
            case 'Resuelta':
            case 'Aprobada':
                this.mostrarGestor = true;
                break;

            default:
                break;
        }
    }

    // Abre el PDF del oficio
    abrirOficioPdf(): void {
        const oficioPdf = this.datosSolicitud.datosComunSolicitud?.oficioPdf;

        if (oficioPdf) {
            const documento = this.utilidades.convertirBase64AFile(oficioPdf);
            this.urlOficioPdf = this.utilidades.crearUrlSeguroParaPDF(documento);
        }
    }

    // Abre un archivo PDF adjunto
    abrirArchivo(nombreDocumento: string): void {
        const documento = this.docsAdjuntos.find((doc) => doc.name === nombreDocumento);

        if (documento) {
            this.urlPdf = this.utilidades.crearUrlSeguroParaPDF(documento);
        }
    }

    // Extrae los archivos adjuntos según el tipo de solicitud
    extraerAdjuntos(tipoSolicitud: string): void {
        const procesarDocumentosAdjuntos = (documentosAdjuntos: any[]): void => {
            documentosAdjuntos?.forEach((docAdjunto) => {
                if (docAdjunto) {
                    this.docsAdjuntos.push(this.utilidades.convertirBase64AFile(docAdjunto));
                }
            });
        };

        const procesarEnlacesAdjuntos = (enlacesAdjuntos: any[]): void => {
            enlacesAdjuntos?.forEach((enlace) => {
                if (enlace) {
                    this.enlacesAdjuntos.push(enlace);
                }
            });
        };

        switch (tipoSolicitud) {
            case 'HO_ASIG_ESP':
            case 'HO_ASIG_POS':
                this.extraerAdjuntosHomologacion(procesarDocumentosAdjuntos);
                break;
            case 'AP_SEME':
                if (this.datosSolicitud.datosSolicitudAplazarSemestre.documentoAdjunto) {
                    this.docsAdjuntos.push(
                        this.utilidades.convertirBase64AFile(
                            this.datosSolicitud.datosSolicitudAplazarSemestre.documentoAdjunto
                        )
                    );
                }
                break;
            case 'CA_ASIG':
                if (this.datosSolicitud.dadicionCancelacionAsignatura.documentoAdjunto) {
                    this.docsAdjuntos.push(
                        this.utilidades.convertirBase64AFile(
                            this.datosSolicitud.dadicionCancelacionAsignatura.documentoAdjunto
                        )
                    );
                }
                break;
            case 'CU_ASIG':
                procesarDocumentosAdjuntos(this.datosSolicitud.datosSolicitudCursarAsignaturas.documentosAdjuntos);
                break;
            case 'AV_PASA_INV':
                procesarDocumentosAdjuntos(this.datosSolicitud.datoAvalPasantiaInv.documentosAdjuntos);
                break;
            case 'AP_ECON_INV':
                procesarDocumentosAdjuntos(this.datosSolicitud.datosApoyoEconomico.documentosAdjuntos);
                break;
            case 'RE_CRED_PAS':
                procesarDocumentosAdjuntos(this.datosSolicitud.datosReconocimientoCreditos.documentosAdjuntos);
                procesarEnlacesAdjuntos(this.datosSolicitud.datosReconocimientoCreditos.enlacesAdjuntos);
                break;
            case 'RE_CRED_PUB':
                procesarDocumentosAdjuntos(this.datosSolicitud.datosReconocimientoCreditos.documentosAdjuntos);
                break;
            case 'AP_ECON_ASI':
                procesarDocumentosAdjuntos(this.datosSolicitud.datosApoyoEconomicoCongreso.documentosAdjuntos);
                break;
            case 'PA_PUBL_EVE':
                procesarDocumentosAdjuntos(this.datosSolicitud.datosApoyoEconomicoPublicacion.documentosAdjuntos);
                break;
            case 'RE_CRED_PR_DOC':
                this.extraerAdjuntosActividadDocente(procesarDocumentosAdjuntos);
                break;
            case 'SO_BECA':
                procesarDocumentosAdjuntos([this.datosSolicitud.datoSolicitudBeca.formatoSolicitudBeca]);
                break;

            default:
                // No se realiza ninguna acción para estos tipos de solicitud
                break;
        }
    }

    // Extrae los adjuntos de homologación
    extraerAdjuntosHomologacion(procesarDocumentosAdjuntos: (documentosAdjuntos: any[]) => void): void {
        procesarDocumentosAdjuntos(this.datosSolicitud.datosSolicitudHomologacion.documentosAdjuntos);

        this.datosSolicitud.datosSolicitudHomologacion.datosAsignatura.forEach((asignatura) => {
            if (asignatura.contenidoProgramatico) {
                this.docsAdjuntos.push(this.utilidades.convertirBase64AFile(asignatura.contenidoProgramatico));
            }
        });
    }

    // Extrae los adjuntos de la actividad docente
    extraerAdjuntosActividadDocente(procesarDocumentosAdjuntos: (documentosAdjuntos: any[]) => void): void {
        this.datosSolicitud.datosActividadDocente?.forEach((actividad) => {
            procesarDocumentosAdjuntos(actividad.documentos);
            actividad.enlaces?.forEach((enlace) => this.enlacesAdjuntos.push(enlace));
        });
    }

    async descargarTodosLosArchivos(): Promise<void> {
        const zip = new JSZip();

        // Agregar el archivo del oficio PDF al ZIP si existe
        if (this.urlOficioPdf) {
            const urlOficio = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.urlOficioPdf);
            if (urlOficio) {
                try {
                    const response = await fetch(urlOficio);
                    const data = await response.blob();
                    zip.file(
                        `Carta de Solicitud - ${this.solicitudSeleccionada.nombreEstudiante.toUpperCase()}.pdf`,
                        data
                    ); // Usa timestamp para asegurar nombre único
                } catch (error) {
                    console.error('Error al descargar el archivo del oficio PDF:', error);
                }
            }
        }

        // Agregar los archivos adjuntos al ZIP con nombres únicos
        await Promise.all(
            this.docsAdjuntos.map(async (file, index) => {
                const fileUrl = URL.createObjectURL(file);
                try {
                    const response = await fetch(fileUrl);
                    const data = await response.blob();
                    zip.file(`Anexo ${index + 1} ${file.name}`, data); // Usa índice para asegurar nombre único
                } catch (error) {
                    console.error(`Error al descargar el archivo adjunto ${file.name}:`, error);
                } finally {
                    URL.revokeObjectURL(fileUrl); // Liberar memoria
                }
            })
        );

        // Generar el archivo ZIP y descargarlo
        zip.generateAsync({ type: 'blob' })
            .then((content) => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(content);

                a.download = `Solicitud ${
                    this.solicitudSeleccionada.abreviatura
                } - ${this.solicitudSeleccionada.nombreEstudiante.toUpperCase()}.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            })
            .catch((error) => {
                console.error('Error al generar el archivo ZIP:', error);
            });
    }
}
