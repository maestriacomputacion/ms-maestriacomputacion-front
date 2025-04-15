import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import { PDFDocument, rgb } from 'pdf-lib';
import { GestorService } from '../../../services/gestor.service';
import { RadicarService } from '../../../services/radicar.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpService } from '../../../services/http.service';
import { DatosSolicitudRequest } from '../../../models/solicitudes/datosSolicitudRequest';

import { DatosAvalSolicitud, DetallesRechazo, SolicitudRecibida } from '../../../models/indiceModelos';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UtilidadesService } from '../../../services/utilidades.service';
import { Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormulariorechazoComponent } from '../../gestion-coordinacion/complementos/formulariorechazo/formulariorechazo.component';
import { AutenticacionService } from 'src/app/modules/gestion-autenticacion/services/autenticacion.service';

@Component({
    selector: 'app-visoraval',
    templateUrl: './visoraval.component.html',
    styleUrls: ['./visoraval.component.scss'],
    providers: [DialogService, ConfirmationService, MessageService],
})
export class VisoravalComponent implements OnInit {
    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHander(event: Event) {
        event.returnValue = true;
        return '¿Estás seguro de que quieres salir de la página?';
    }

    @ViewChild('firmaImage') firmaImage: ElementRef;

    solicitudSeleccionada: SolicitudRecibida;
    datosSolicitud: DatosSolicitudRequest;

    rol: string;

    mostrarOficio: boolean = false;
    mostrarBtnFirmar: boolean = false;
    mostrarBtnRechazar: boolean = false;
    firmaEnProceso: boolean = false;
    mostrarBtnAvalar: boolean = false;
    mostrarPFSet: boolean = true;
    habilitarAval: boolean = false;
    avalEnProceso: boolean = false;
    rechazoEnProceso: boolean = false;
    deshabilitarRechazo: boolean = false;
    deshabilitarAval: boolean = false;
    cargandoDatos: boolean = true;

    pdfSolicitud: File;

    urlPdf: SafeResourceUrl;
    //urlPdfSolicitud: SafeResourceUrl;

    urlOficioPdf: SafeResourceUrl;
    OficioPdfBase64: string = '';

    docsAdjuntos: File[] = [];
    enlacesAdjuntos: string[] = [];

    ref: DynamicDialogRef;

    constructor(
        public gestor: GestorService,
        public radicar: RadicarService,
        public http: HttpService,
        private router: Router,
        private sanitizer: DomSanitizer,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private utilidades: UtilidadesService,
        public dialogService: DialogService,
        private auth: AutenticacionService
    ) {}

    ngOnInit(): void {
        this.recuperarSolicitudSeleccionada();

        this.http
            .verificarSiEsDirector(this.gestor.solicitudSeleccionada.idSolicitud, this.auth.getLoggedInUser().email)
            .subscribe(
                (esDirector) => {
                    if (esDirector) {
                        this.rol = 'Director';
                    } else {
                        this.rol = 'Tutor';
                    }
                },
                (error) => console.error('Error al verificar el rol de director', error)
            );

        console.log(this.rol);
    }

    // Recupera la solicitud seleccionada del localStorage y carga los datos
    recuperarSolicitudSeleccionada(): void {
        const solicitudSeleccionadaJson = localStorage.getItem('solicitudSeleccionadaTutorDirector');

        if (solicitudSeleccionadaJson) {
            this.solicitudSeleccionada = JSON.parse(solicitudSeleccionadaJson) as SolicitudRecibida;
            this.gestor.solicitudSeleccionada = this.solicitudSeleccionada;
            this.cargarDatosSolicitud();
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
            case 'RE_CRED_PR_DOC':
                this.extraerAdjuntosActividadDocente(procesarDocumentosAdjuntos);
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

        console.log(this.enlacesAdjuntos);
    }

    private verificarRestricciones() {
        if (this.datosSolicitud.datosComunSolicitud.estadoSolicitud != 'Radicada') {
            this.mostrarPFSet = false;
            this.mostrarBtnAvalar = false;
            this.mostrarBtnRechazar = false;
        } else {
            this.mostrarBtnAvalar = true;
            this.mostrarBtnRechazar = true;
        }
    }

    cargarDatosSolicitud() {
        this.http.obtenerInfoSolGuardada(this.solicitudSeleccionada.idSolicitud).subscribe(
            async (infoSolicitud: DatosSolicitudRequest) => {
                console.log(infoSolicitud);
                this.datosSolicitud = infoSolicitud;
                this.abrirOficioPdf();

                this.extraerAdjuntos(this.solicitudSeleccionada.codigoSolicitud);

                this.gestor.estadoSolicitud = infoSolicitud.datosComunSolicitud.estadoSolicitud;

                this.verificarRestricciones();

                this.cargandoDatos = false;
            },
            (error) => {
                console.error('Error al cargar la informacion de la solicitud:', error);
            }
        );
    }

    // Abre el PDF del oficio
    abrirOficioPdf(): void {
        const oficioPdfBase64 = this.datosSolicitud.datosComunSolicitud?.oficioPdf;

        if (oficioPdfBase64) {
            this.pdfSolicitud = this.utilidades.convertirBase64AFile(oficioPdfBase64);
            this.urlOficioPdf = this.utilidades.crearUrlSeguroParaPDF(this.pdfSolicitud);
        }
    }

    onUpload(event, firmante) {
        const reader = new FileReader();

        switch (this.rol) {
            case 'Tutor':
                this.radicar.firmaTutor = event.files[0];
                this.renderizarImagen(this.radicar.firmaTutor, this.rol);

                reader.onload = (e) => {
                    this.firmaImage.nativeElement.src = e.target.result;
                };
                reader.readAsDataURL(this.radicar.firmaTutor);

                break;

            case 'Director':
                this.radicar.firmaDirector = event.files[0];
                this.renderizarImagen(this.radicar.firmaDirector, this.rol);

                reader.onload = (e) => {
                    this.firmaImage.nativeElement.src = e.target.result;
                };
                reader.readAsDataURL(this.radicar.firmaDirector);

                break;

            default:
                break;
        }
        firmante.clear();
        this.mostrarBtnFirmar = true;
    }

    firmarSolicitud() {
        if (this.firmaEnProceso) {
            return;
        } else {
            this.firmaEnProceso = true;

            switch (this.rol) {
                case 'Tutor':
                    this.agregarImagenAPDF(
                        this.radicar.firmaTutorUrl.toString(), // Imagen en Base64
                        this.datosSolicitud.datosComunSolicitud.numPaginaTutor, // Número de página (por ejemplo, la primera página)
                        this.datosSolicitud.datosComunSolicitud.posXTutor, // Coordenada X
                        this.datosSolicitud.datosComunSolicitud.posYTutor - 0.2, // Coordenada Y
                        58.63, // Ancho
                        20 // Alto
                    );
                    break;
                case 'Director':
                    this.agregarImagenAPDF(
                        this.radicar.firmaDirectorUrl.toString(), // Imagen en Base64
                        this.datosSolicitud.datosComunSolicitud.numPaginaDirector, // Número de página (por ejemplo, la primera página)
                        this.datosSolicitud.datosComunSolicitud.posXDirector, // Coordenada X
                        this.datosSolicitud.datosComunSolicitud.posYDirector - 0.2, // Coordenada Y
                        58.63, // Ancho
                        20 // Alto
                    );
                    break;

                default:
                    break;
            }

            setTimeout(() => {
                this.mostrarOficio = false;

                setTimeout(() => {
                    this.mostrarOficio = true;
                    this.firmaEnProceso = false;
                    this.mostrarBtnFirmar = false;
                    this.habilitarAval = true;
                }, 100);
            }, 100);
        }
    }

    async agregarImagenAPDF(
        imagenBase64: string,
        paginaNumero: number,
        xMm: number, // Coordenada X en mm
        yMm: number, // Coordenada Y en mm
        anchoMm: number, // Ancho en mm
        altoMm: number // Alto en mm
    ) {
        try {
            let pdfBase64 = this.datosSolicitud.datosComunSolicitud.oficioPdf;

            // Eliminar el nombre del archivo para obtener solo el contenido Base64
            if (pdfBase64.includes(':')) {
                pdfBase64 = pdfBase64.split(':')[1];
            }

            // Decodificar PDF desde base64
            const pdfBytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));

            // Cargar el documento PDF con pdf-lib
            const pdfDoc = await PDFDocument.load(pdfBytes);

            // Obtener la página en la que deseas agregar la imagen
            const pagina = pdfDoc.getPage(paginaNumero - 1); // Restar 1 para usar índice basado en 0

            // Decodificar la imagen en base64
            const tipoImagen = imagenBase64.split(';')[0].split('/')[1]; // Obtener el tipo de imagen (png, jpeg, etc.)
            const imagenSinEncabezado = imagenBase64.includes(',') ? imagenBase64.split(',')[1] : imagenBase64;
            const imagenBytes = Uint8Array.from(atob(imagenSinEncabezado), (c) => c.charCodeAt(0));

            // Incorporar la imagen en el PDF
            let imagen;
            if (tipoImagen === 'png') {
                imagen = await pdfDoc.embedPng(imagenBytes);
            } else if (tipoImagen === 'jpeg' || tipoImagen === 'jpg') {
                imagen = await pdfDoc.embedJpg(imagenBytes);
            } else {
                throw new Error('Tipo de imagen no soportado. Solo se admiten PNG y JPEG.');
            }

            // Convertir las dimensiones y coordenadas de mm a puntos
            const mmToPoints = 2.83465;
            const x = xMm * mmToPoints;
            const y = yMm * mmToPoints;
            const ancho = anchoMm * mmToPoints;
            const alto = altoMm * mmToPoints;

            // Obtener la altura total en puntos de la página
            const { height: alturaPagina } = pagina.getSize();

            // Ajustar la coordenada Y
            const yAjustado = alturaPagina - y - alto;

            // Agregar la imagen a la página con las coordenadas y dimensiones proporcionadas
            pagina.drawImage(imagen, {
                x: x,
                y: yAjustado,
                width: ancho,
                height: alto,
            });

            // Serializar el documento PDF modificado a un Uint8Array
            const pdfModificadoBytes = await pdfDoc.save();

            // Convertir el PDF modificado a Base64 sin desbordar la pila
            const pdfModificadoBase64 = await this.arrayBufferToBase64(pdfModificadoBytes);

            // Si deseas mostrar o descargar el PDF modificado en el navegador
            const pdfModificadoBlob = new Blob([pdfModificadoBytes], {
                type: 'application/pdf',
            });

            this.pdfSolicitud = new File([pdfModificadoBlob], 'Carta de Solicitud.pdf', {
                type: 'application/pdf',
            });

            this.urlOficioPdf = this.utilidades.crearUrlSeguroParaPDF(this.pdfSolicitud);
        } catch (error) {
            console.error('Error al agregar la imagen al PDF:', error);
        }
    }

    // Función para convertir un ArrayBuffer a Base64
    arrayBufferToBase64(arrayBuffer: ArrayBuffer): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(new Blob([arrayBuffer]));
        });
    }

    async enviarOficioAvalado() {
        if (this.avalEnProceso || this.firmaEnProceso || this.rechazoEnProceso) {
            return;
        }

        if (this.habilitarAval) {
            this.avalEnProceso = true;
            this.deshabilitarRechazo = true;

            //await this.convertirOficioEnPDF();

            const convertirFileABase64 = async (file: File | null) =>
                file ? await this.utilidades.convertirFileABase64(file) : null;

            const firmoTutor = this.rol === 'Tutor' ? true : this.datosSolicitud.datosComunSolicitud.firmaTutor;
            const firmoDirector =
                this.rol === 'Director' ? true : this.datosSolicitud.datosComunSolicitud.firmaDirector;

            const aval: DatosAvalSolicitud = {
                idSolicitud: this.solicitudSeleccionada.idSolicitud,
                firmaTutor: firmoTutor,
                firmaDirector: firmoDirector,
                documentoPdfSolicitud: await convertirFileABase64(this.pdfSolicitud),
            };

            console.log(aval);

            this.http.guardarAvalesSolicitud(aval).subscribe(
                (resultado) => {
                    if (resultado) {
                        //this.gestor.ejecutarCargarSolicitudes();

                        // Remover la solicitud de la lista local
                        this.gestor.solicitudesTutorDirectorCache = this.gestor.solicitudesTutorDirectorCache.filter(
                            (solicitud) => solicitud.idSolicitud !== this.gestor.solicitudSeleccionada.idSolicitud
                        );

                        this.avalEnProceso = false;
                        this.confirmationService.confirm({
                            message: 'La solicitud se ha avalado exitosamente',
                            header: 'Solicitud avalada',
                            icon: 'pi pi-exclamation-circle',
                            acceptLabel: 'Aceptar',
                            rejectVisible: false,
                            accept: () => {
                                this.mostrarBtnRechazar = false;
                                this.mostrarBtnAvalar = false;
                                this.mostrarPFSet = false;
                            },
                            reject: () => {
                                this.mostrarBtnRechazar = false;
                                this.mostrarBtnAvalar = false;
                                this.mostrarPFSet = false;
                            },
                        });
                    } else {
                        this.avalEnProceso = false;
                        this.confirmationService.confirm({
                            message: 'Ha ocurrido un error inesperado al avalar la solicitud, intentelo nuevamente.',
                            header: 'Error de aval',
                            icon: 'pi pi-exclamation-triangle',
                            acceptLabel: 'Aceptar',
                            rejectVisible: false,
                            accept: () => {},
                        });
                    }
                },
                (error) => {
                    console.error('Error al enviar la solicitud:', error);
                }
            );
        } else {
            this.showWarn();
        }
    }

    rechazarSolicitud() {
        if (this.rechazoEnProceso || this.avalEnProceso) {
            return;
        }

        this.rechazoEnProceso = true;

        this.ref = this.dialogService.open(FormulariorechazoComponent, {
            header: 'No avalar solicitud',
            width: '60%',
            contentStyle: { 'max-height': '600px', overflow: 'hidden' },
            baseZIndex: 10000,
        });

        this.ref.onClose.subscribe((motivoRechazo: string) => {
            if (motivoRechazo !== undefined) {
                //lsierra@unicauca.edu.co
                //luz123@unicauca.edu.co
                const detalles: DetallesRechazo = {
                    idSolicitud: this.solicitudSeleccionada.idSolicitud,
                    emailRevisor: 'lsierra@unicauca.edu.co',
                    estado: 'NO_AVALADA',
                    comentario: motivoRechazo,
                };

                this.http.rechazarSolicitud(detalles).subscribe(
                    (resultado) => {
                        if (resultado) {
                            // Remover la solicitud de la lista local
                            this.gestor.solicitudesTutorDirectorCache =
                                this.gestor.solicitudesTutorDirectorCache.filter(
                                    (solicitud) =>
                                        solicitud.idSolicitud !== this.gestor.solicitudSeleccionada.idSolicitud
                                );

                            this.rechazoEnProceso = false;
                            this.gestor.estadoSolicitud = 'No Avalada';
                            this.confirmationService.confirm({
                                message: 'La solicitud se ha sido rechazada y se ha notificado al solicitante',
                                header: 'Solicitud no avalada',
                                icon: 'pi pi-exclamation-circle',
                                acceptLabel: 'Aceptar',
                                rejectVisible: false,
                                accept: () => {
                                    this.mostrarBtnRechazar = false;
                                    this.mostrarBtnAvalar = false;
                                    this.mostrarPFSet = false;
                                },
                                reject: () => {
                                    this.mostrarBtnRechazar = false;
                                    this.mostrarBtnAvalar = false;
                                    this.mostrarPFSet = false;
                                },
                            });
                        } else {
                            this.rechazoEnProceso = false;
                            this.confirmationService.confirm({
                                message:
                                    'Ha ocurrido un error inesperado al rechazar la solicitud, intentelo nuevamente.',
                                header: 'Error al rechazar',
                                icon: 'pi pi-exclamation-triangle',
                                acceptLabel: 'Aceptar',
                                rejectVisible: false,
                                accept: () => {},
                            });
                        }
                    },
                    (error) => {
                        console.error('Error al rechazar la solicitud:', error);
                    }
                );
            } else {
                // El diálogo se cerró sin confirmar
                this.rechazoEnProceso = false;
            }
        });
    }

    renderizarImagen(imagen: File, firmante: string): void {
        const reader = new FileReader();
        reader.onload = () => {
            switch (firmante) {
                case 'Tutor':
                    this.radicar.firmaTutorUrl = reader.result as string;
                    break;
                case 'Director':
                    this.radicar.firmaDirectorUrl = reader.result as string;
                    break;

                default:
                    break;
            }
        };
        reader.readAsDataURL(imagen);
    }

    /*
    convertirOficioEnPDF(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.oficio) {
                this.oficio
                    .crearPDF()
                    .then(() => {
                        resolve();
                    })
                    .catch((error) => {
                        reject(error);
                    });
            } else {
                resolve();
            }
        });
    }
*/
    abrirArchivo(nombreDocumento: string) {
        // Buscar el archivo por su nombre
        const documento = this.docsAdjuntos.find((doc) => doc.name === nombreDocumento);

        if (documento) {
            const tipoMIME = 'application/pdf';
            // Crear una nueva instancia de Blob con el tipo MIME especificado
            const blob = new Blob([documento], { type: tipoMIME });

            // Crear la URL segura
            const url = URL.createObjectURL(blob);
            this.urlPdf = this.sanitizer.bypassSecurityTrustResourceUrl(url);

            console.log(this.urlPdf);
        }
    }

    abrirEnlace(enlace: string): void {
        if (enlace) {
            const enlaceCompleto = enlace.startsWith('http') ? enlace : 'http://' + enlace;
            window.open(enlaceCompleto, '_blank');
        }
    }

    showWarn() {
        this.messageService.add({
            severity: 'warn',
            summary: 'Oficio no firmado',
            detail: 'Firme el oficio de la solicitud',
        });
    }

    mostrarFormularioRechazo() {
        this.ref = this.dialogService.open(FormulariorechazoComponent, {
            header: 'Choose a Product',
            width: '70%',
            contentStyle: { 'max-height': '500px', overflow: 'auto' },
            baseZIndex: 10000,
        });

        /*
        this.ref.onClose.subscribe((product: Product) => {
            if (product) {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Product Selected',
                    detail: product.name,
                });
            }
        });
        */
    }
}
