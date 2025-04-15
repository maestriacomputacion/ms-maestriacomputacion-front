import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GestorService } from '../../../services/gestor.service';
import {
    AprobarAsignaturas,
    DetallesRechazo,
    EnvioCorreoRequest,
    SolicitudEnComiteResponse,
    SolicitudEnConcejoResponse,
} from '../../../models/indiceModelos';
import { HttpService } from '../../../services/http.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormulariorechazoComponent } from '../complementos/formulariorechazo/formulariorechazo.component';
import { PdfService } from '../../../services/pdf.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { DocumentoPDFFactory } from '../../utilidades/documentos-pdf/documento-pdf-factory';
import { UtilidadesService } from '../../../services/utilidades.service';
import { el } from 'date-fns/locale';
import { forEach } from 'jszip';

interface RespuestaConcejo {
    aval: string;
    concepto: string;
    fecha: string;
}
@Component({
    selector: 'app-tramite',
    templateUrl: './tramite.component.html',
    styleUrls: ['./tramite.component.scss'],
    providers: [ConfirmationService, MessageService],
})
export class TramiteComponent implements OnInit {
    fechaSeleccionada: Date;
    fechaConsejo: Date;
    avalComite: SolicitudEnComiteResponse = {
        idSolicitud: null,
        enComite: false,
        avaladoComite: '',
        conceptoComite: '',
        numeroActa: '',
        fechaAval: '',
        asignaturasAprobadas: [],
        asignaturasHomologadas: [],
        asignaturasOtroPrograma: [],
        avalActPracticaDocente: [],
        reconocimientoCreditosPD: [],
    };

    respuestaConsejo: SolicitudEnConcejoResponse = {
        idSolicitud: null,
        enConcejo: false,
        avaladoConcejo: '',
        conceptoConcejo: '',
        numeroActa: '',
        fechaAval: '',
        documentosConcejo: [],
        asignaturasAprobadas: [],
        asignaturasHomologadas: [],
        asignaturasOtroPrograma: [],
        avalActPracticaDocente: [],
        reconocimientoCreditosPD: [],
    };

    bloquearConceptoComite: boolean = false;
    conceptoComiteGuardado: boolean = false;

    bloquearConceptoConsejo: boolean = false;
    conceptoConsejoGuardado: boolean = false;
    habilitarRespuestaSolicitantesConsejo: boolean = false;

    enviadaAComite: boolean = false;
    enviadaAConsejo: boolean = false;
    deshabilitarEnvioAComite: boolean = false;
    deshabilitarEnvioAConsejo: boolean = false;
    vaAlConcejo: boolean = true;
    habilitarConcejo: boolean = false;
    habilitarComite: boolean = false;
    habilitarTramiteGenerico: boolean = false;
    enviandoCorreo: boolean = false;

    habilitarRespuestaSolicitantes: boolean = false;

    mostrarBtnAprobar: boolean = false;
    mostrarBtnRechazar: boolean = false;
    mostrarBtnResolver: boolean = false;

    rechazoEnProceso: boolean = false;
    resolverEnProceso: boolean = false;

    asignaturasAprobadas: any[] = [];

    urlRespuestaComitePdf: SafeResourceUrl;
    urlOficioConcejoPdf: SafeResourceUrl;
    urlRespuestaConcejoPdf: SafeResourceUrl;
    urlDocumentoCargaConsejoPdf: SafeResourceUrl;

    archivosCargados: any[] = [];

    ref: DynamicDialogRef;

    constructor(
        private confirmationService: ConfirmationService,
        public gestor: GestorService,
        public http: HttpService,
        private dialogService: DialogService,
        private messageService: MessageService,
        private servicioPDF: PdfService,
        private factory: DocumentoPDFFactory,
        private servicioUtilidades: UtilidadesService
    ) {}

    ngOnInit(): void {
        this.servicioUtilidades.configurarIdiomaCalendario();
        this.cargarConceptosGuardados();
    }

    //valida si la solicitud es certificado de votacion
    isSolicitudTipoCerVoto(): boolean {
        return this.gestor.solicitudSeleccionada?.codigoSolicitud === 'CER_VOTO';
    }

    aprobarSolicitudCerVoto() {
        this.confirmationService.confirm({
            message: '¿Está seguro que desea aprobar esta solicitud?',
            header: 'Confirmar Aprobación',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Si',
            accept: () => {
                // Hace llamado al servicio HTTP para cambiar el estado
                this.http.cambiarEstadoSolicitud(
                    this.gestor.solicitudSeleccionada.idSolicitud,
                    'Aprobada'
                ).subscribe(
                    (response) => {
                        this.gestor.estadoSolicitud = 'Aprobada';
                        this.gestor.moverSolicitud(
                            this.gestor.solicitudSeleccionada, 
                            'AVALADA',
                            'APROBADA'
                        );

                        this.confirmationService.confirm({
                            message: 'La solicitud ha sido aprobado y se ha notificado al solicitante',
                            header: 'Solicitud Aprobada',
                            icon: 'pi pi-exclamation-circle',
                            acceptLabel: 'Aceptar',
                            rejectVisible: false,
                            accept: () => {
                                this.mostrarBtnAprobar = false;
                                this.mostrarBtnRechazar = false;
                                this.mostrarBtnResolver = false;
                            },
                            reject: () => {
                                this.mostrarBtnAprobar = false;
                                this.mostrarBtnRechazar = false;
                                this.mostrarBtnResolver = false;
                            },
                        });
                    },
                    (error) => {
                        // Manejo de error
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo aprobar la solicitud'
                        });
                    }
                );
            }
        });
    }
    

    cargarConceptosGuardados() {
        this.http.consultarConceptoComite(this.gestor.solicitudSeleccionada.idSolicitud).subscribe(
            async (infoComite: SolicitudEnComiteResponse) => {
                console.log(infoComite);
                this.avalComite = infoComite;
                this.gestor.conceptoComite = infoComite;

                if (infoComite.fechaAval) {
                    this.fechaSeleccionada = this.convertirCadenaAFecha(infoComite.fechaAval);
                    this.avalComite.fechaAval = this.formatearFecha(this.fechaSeleccionada);
                }

                //Esta linea se debe llamar despues de haber consultado toda la info de comite/concejo en la BD
                this.restringirAcciones(this.gestor.solicitudSeleccionada.codigoSolicitud);
            },
            (error) => {
                console.error('Error al cargar la información del comité:', error);
            }
        );

        this.http.consultarConceptoConsejo(this.gestor.solicitudSeleccionada.idSolicitud).subscribe(
            async (infoConsejo: SolicitudEnConcejoResponse) => {
                console.log(infoConsejo);

                this.respuestaConsejo = infoConsejo;
                this.gestor.conceptoConsejo = infoConsejo;

                if (infoConsejo.fechaAval) {
                    this.fechaConsejo = this.convertirCadenaAFecha(infoConsejo.fechaAval);
                    this.respuestaConsejo.fechaAval = this.formatearFecha(this.fechaConsejo);
                }

                if (infoConsejo && infoConsejo.documentosConcejo && infoConsejo.documentosConcejo.length > 0) {
                    this.archivosCargados = [];

                    for (let index = 0; index < infoConsejo.documentosConcejo.length; index++) {
                        this.archivosCargados.push(
                            this.servicioUtilidades.convertirBase64AFile(infoConsejo.documentosConcejo[index])
                        );
                    }
                }

                //Esta linea se debe llamar despues de haber consultado toda la info de comite/concejo en la BD
                this.restringirAcciones(this.gestor.solicitudSeleccionada.codigoSolicitud);
            },
            (error) => {
                console.error('Error al cargar la información del comité:', error);
            }
        );
    }

    // Método enviar orden de dascargar archivos al componente padre
    onDescargarArchivos() {
        this.gestor.emitirDescargarArchivos();
    }

    onCheckboxChange() {
        this.gestor.conceptoComite = this.avalComite;
    }

    validarCambioEstadoConcejo() {
        if (this.deshabilitarEnvioAConsejo == false) {
            this.confirmationService.confirm({
                message:
                    '¿Esta seguro de cambiar el estado actual de la solicitud?. Este cambio no se puede deshacer y se reflejará en el historial de seguimiento.',
                header: 'Confirmar acción',
                icon: 'pi pi-exclamation-circle',
                acceptLabel: 'Si',
                rejectVisible: true,
                rejectLabel: 'No',
                accept: () => {
                    this.enviarSolicitudAConsejo();
                    //this.enviadaAConsejo = true;
                    this.deshabilitarEnvioAConsejo = true;
                },
                reject: () => {
                    //this.enviadaAConsejo = false;
                    this.respuestaConsejo.enConcejo = false;
                },
            });
        }
    }

    validarCambioEstadoComite() {
        if (this.deshabilitarEnvioAComite == false) {
            this.confirmationService.confirm({
                message:
                    '¿Esta seguro de cambiar el estado actual de la solicitud?. Este cambio no se puede deshacer y se reflejará en el historial de seguimiento.',
                header: 'Confirmar acción',
                icon: 'pi pi-exclamation-circle',
                acceptLabel: 'Si',
                rejectVisible: true,
                rejectLabel: 'No',
                accept: () => {
                    this.enviarSolicitudAComite();
                    this.deshabilitarEnvioAComite = true;
                },
                reject: () => {
                    this.avalComite.enComite = false;
                },
            });
        }
    }

    rechazarSolicitud() {
        if (this.rechazoEnProceso || this.resolverEnProceso) {
            return;
        }

        this.rechazoEnProceso = true;

        this.ref = this.dialogService.open(FormulariorechazoComponent, {
            header: 'Rechazar solicitud',
            width: '60%',
            contentStyle: { 'max-height': '600px', overflow: 'hidden' },
            baseZIndex: 10000,
        });

        this.ref.onClose.subscribe((motivoRechazo: string) => {
            if (motivoRechazo !== undefined) {
                //lsierra@unicauca.edu.co
                const detalles: DetallesRechazo = {
                    idSolicitud: this.gestor.solicitudSeleccionada.idSolicitud,
                    emailRevisor: 'lsierra@unicauca.edu.co',
                    estado: 'RECHAZADA',
                    comentario: motivoRechazo,
                };

                this.http.rechazarSolicitud(detalles).subscribe(
                    (resultado) => {
                        if (resultado) {
                            this.habilitarComite = false;//
                            this.rechazoEnProceso = false;
                            this.gestor.estadoSolicitud = 'Rechazada';
                            this.gestor.moverSolicitud(this.gestor.solicitudSeleccionada, 'AVALADA', 'RECHAZADA');
                            this.confirmationService.confirm({
                                message: 'La solicitud se ha sido rechazada y se ha notificado al solicitante',
                                header: 'Solicitud Rechazada',
                                icon: 'pi pi-exclamation-circle',
                                acceptLabel: 'Aceptar',
                                rejectVisible: false,
                                accept: () => {
                                    this.mostrarBtnAprobar = false;
                                    this.mostrarBtnRechazar = false;
                                    this.mostrarBtnResolver = false;
                                },
                                reject: () => {
                                    this.mostrarBtnAprobar = false;
                                    this.mostrarBtnRechazar = false;
                                    this.mostrarBtnResolver = false;
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

    enviarSolicitudAComite() {
        this.avalComite.enComite = true;
        this.avalComite.idSolicitud = this.gestor.solicitudSeleccionada.idSolicitud;

        this.http.guardarConceptoComite(this.avalComite).subscribe(
            (response) => {
                if (response) {
                    this.gestor.estadoSolicitud = 'En comité';
                    this.gestor.moverSolicitud(this.gestor.solicitudSeleccionada, 'AVALADA', 'EN_COMITE');
                }
            },
            (error) => {
                console.error('Error al cambiar el estado de la solicitud:', error);
            }
        );

        this.mostrarBtnRechazar = false;
    }

    enviarSolicitudAConsejo() {
        this.respuestaConsejo.enConcejo = true;
        this.respuestaConsejo.idSolicitud = this.gestor.solicitudSeleccionada.idSolicitud;

        this.http.guardarConceptoConsejo(this.respuestaConsejo).subscribe(
            (response) => {
                if (response) {
                    this.gestor.estadoSolicitud = 'En concejo';
                    this.gestor.moverSolicitud(this.gestor.solicitudSeleccionada, 'EN_COMITE', 'EN_CONCEJO');
                    this.cargarConceptosGuardados();
                }
            },
            (error) => {
                console.error('Error al cambiar el estado de la solicitud:', error);
            }
        );
    }

    async enviarCorreo(destinatario: string, tipoDocumento: string) {
        if (this.enviandoCorreo) {
            return;
        } else {
            this.enviandoCorreo = true;
            const contenidoCorreo: EnvioCorreoRequest = {
                destinatario: destinatario,
                oficio: await this.obtenerDocumentoPDFEnBase64(
                    this.gestor.solicitudSeleccionada.codigoSolicitud,
                    tipoDocumento,
                    false
                ),
            };

            this.http.enviarCorreo(contenidoCorreo).subscribe((response) => {});

            if (destinatario === 'concejo') {
                this.enviarSolicitudAConsejo();
                this.deshabilitarEnvioAConsejo = true;
                this.urlOficioConcejoPdf = null;
            }
            if (destinatario === 'solicitante') {
                this.http
                    .cambiarEstadoSolicitud(this.gestor.solicitudSeleccionada.idSolicitud, 'Resuelta')
                    .subscribe((response) => {
                        if (response) {
                            this.gestor.estadoSolicitud = 'Resuelta';
                            switch (tipoDocumento) {
                                case 'respuesta-comite':
                                    this.gestor.moverSolicitud(
                                        this.gestor.solicitudSeleccionada,
                                        'EN_COMITE',
                                        'Resuelta'
                                    );

                                    this.urlRespuestaComitePdf = null;
                                    break;

                                case 'respuesta-consejo':
                                    this.gestor.moverSolicitud(
                                        this.gestor.solicitudSeleccionada,
                                        'EN_CONCEJO',
                                        'Resuelta'
                                    );

                                    this.urlRespuestaConcejoPdf = null;
                                    break;
                            }
                        }
                    });
            }

            this.enviandoCorreo = false;
            this.mostrarAlertaFormulario('enviado');
        }
    }

    obtenerDocumentoPDFEnBase64(
        codigoSolicitud: string | null,
        tipoDocumento: string,
        agregarMarcaDeAgua: boolean
    ): Promise<string> | null {
        // Utiliza la fábrica para obtener la estrategia basada en el código de solicitud y tipo de documento
        const estrategia = this.factory.crearEstrategia(codigoSolicitud, tipoDocumento);

        // Verifica si se encontró una estrategia válida
        if (!estrategia) {
            console.error(
                `No se encontró una estrategia para el código de solicitud: ${codigoSolicitud} y tipo de documento: ${tipoDocumento}`
            );
            return null;
        }

        // Genera el documento PDF usando la estrategia
        const pdfDocConMarca = estrategia.generarDocumento(agregarMarcaDeAgua);

        // Función para crear un archivo PDF
        const crearArchivoPDF = (pdfDoc: any, nombreArchivo: string): File => {
            const pdfBlob = pdfDoc.output('blob');
            return new File([pdfBlob], nombreArchivo, { type: 'application/pdf' });
        };

        // Genera y retorna el PDF según el tipo de documento
        switch (tipoDocumento) {
            case 'respuesta-comite':
                return this.servicioUtilidades.convertirFileABase64(
                    crearArchivoPDF(pdfDocConMarca, 'respuesta-comite.pdf')
                );
            case 'respuesta-consejo':
                return this.servicioUtilidades.convertirFileABase64(
                    crearArchivoPDF(pdfDocConMarca, 'respuesta-consejo.pdf')
                );
            case 'oficio-consejo':
                return this.servicioUtilidades.convertirFileABase64(
                    crearArchivoPDF(pdfDocConMarca, 'oficio-consejo.pdf')
                );
            default:
                console.warn(`Tipo de documento no manejado: ${tipoDocumento}`);
                return null;
        }
    }

    guardarRespuestaComite() {
        // Ocultar versiones obsoletas de los documentos PDF en vista
        this.urlOficioConcejoPdf = null;
        this.urlRespuestaComitePdf = null;
        this.urlRespuestaConcejoPdf = null;

        if (this.validarFormularioComite()) {
            this.habilitarRespuestaSolicitantes = false;
            this.habilitarConcejo = false;

            if (this.conceptoComiteGuardado) {
                this.bloquearConceptoComite = false;
                this.conceptoComiteGuardado = false;

                // Lógica para editar
            } else {
                this.bloquearConceptoComite = true;
                this.conceptoComiteGuardado = true;

                // Lógica para guardar
                this.avalComite.fechaAval = this.formatearFecha(this.fechaSeleccionada);
                this.gestor.conceptoComite = this.avalComite;
                //this.gestor.asignaturasAceptadasComite = this.asignaturasAprobadas;
                //this.gestor.respuestaConsejo = this.respuestaConsejo;

                console.log(this.avalComite);

                this.http.guardarConceptoComite(this.avalComite).subscribe(
                    (response) => {
                        if (response) {
                            this.mostrarAlertaFormulario('guardado');
                        }
                    },
                    (error) => {
                        console.error('Error al guardar el concepto:', error);
                    }
                );

                //Si no va al concejo o no fue aprobada por el comite
                //habilitar respuestas tutor y solicitante y deshabilitar concejo
                if (!this.vaAlConcejo || this.avalComite.avaladoComite === 'No') {
                    this.habilitarRespuestaSolicitantes = true;
                }

                //Si va al concejo y fue aprobada por el comite habilitar el apartado del concejo
                if (this.vaAlConcejo && this.avalComite.avaladoComite === 'Si') {
                    this.habilitarConcejo = true;
                }
            }
        } else {
            this.mostrarAlertaFormulario('incompleto');
        }
    }

    async guardarRespuestaConsejo() {
        // Ocultar versiones obsoletas de los documentos PDF en vista
        this.urlRespuestaConcejoPdf = null;
        this.urlDocumentoCargaConsejoPdf = null;

        if (this.validarFormularioConcejo()) {
            this.habilitarRespuestaSolicitantesConsejo = false;

            if (this.conceptoConsejoGuardado) {
                this.bloquearConceptoConsejo = false;
                this.conceptoConsejoGuardado = false;

                // Lógica para editar
            } else {
                this.bloquearConceptoConsejo = true;
                this.conceptoConsejoGuardado = true;

                // Lógica para guardar
                this.respuestaConsejo.fechaAval = this.formatearFecha(this.fechaConsejo);
                this.gestor.conceptoConsejo = this.respuestaConsejo;

                this.respuestaConsejo.documentosConcejo = [];
                for (let index = 0; index < this.archivosCargados.length; index++) {
                    this.respuestaConsejo.documentosConcejo.push(
                        await this.servicioUtilidades.convertirFileABase64(this.archivosCargados[index])
                    );
                }

                this.http.guardarConceptoConsejo(this.respuestaConsejo).subscribe(
                    (response) => {
                        if (response) {
                            this.mostrarAlertaFormulario('guardado');
                        }
                        this.habilitarRespuestaSolicitantesConsejo = true;
                    },
                    (error) => {
                        console.error('Error al guardar el concepto:', error);
                    }
                );
            }
        } else {
            this.mostrarAlertaFormulario('incompleto');
        }
    }

    restringirAcciones(tipoSolicitud: string) {
        // Cuando la solicitud ya este en comite mostrar los campos para ingresar la respuesta
        if (this.avalComite.enComite) {
            this.deshabilitarEnvioAComite = true;

            //Bloquear la edicion si ya se han llenado los campos
            if (this.avalComite.avaladoComite != null) {
                this.conceptoComiteGuardado = true;
                this.bloquearConceptoComite = true;
            }
        }

        // Mostrar seccion de respuestas cuando la solicitud es rechazada por comite o solo requiere de su aval
        if (this.avalComite.avaladoComite === 'No' || (this.avalComite.avaladoComite === 'Si' && !this.vaAlConcejo)) {
            this.habilitarRespuestaSolicitantes = true;
        }

        // Habilitar envio al consejo si la solicitud fue avalada por el comité
        if (this.avalComite.avaladoComite === 'Si' && this.vaAlConcejo) {
            this.habilitarConcejo = true;
        }

        // Cuando la solicitud ya este en consejo mostrar los campos para ingresar la respuesta
        if (this.respuestaConsejo.enConcejo) {
            this.deshabilitarEnvioAConsejo = true;

            //Bloquear la edicion si ya se han llenado los campos
            if (this.respuestaConsejo.avaladoConcejo != null) {
                this.conceptoConsejoGuardado = true;
                this.bloquearConceptoConsejo = true;
            }
        }

        // Mostrar seccion de respuestas cuando la solicitud ha sido respondida por el consejo
        if (this.respuestaConsejo.avaladoConcejo === 'Si' || this.respuestaConsejo.avaladoConcejo === 'No') {
            this.habilitarRespuestaSolicitantesConsejo = true;
        }

        switch (tipoSolicitud) {
            case 'RE_CRED_PUB':
            case 'AV_COMI_PR':
            case 'RE_CRED_PAS':
            case 'RE_CRED_PR_DOC':
            case 'CU_ASIG':
                this.vaAlConcejo = false;
                break;

            default:
                break;
        }

        switch (this.gestor.estadoSolicitud) {
            case 'Avalada':
                this.mostrarBtnAprobar = true;
                this.mostrarBtnRechazar = true;
                this.habilitarComite = true;
                this.habilitarTramiteGenerico = this.gestor.solicitudSeleccionada.codigoSolicitud === 'SO_OTRA';

                break;

            case 'RECHAZADA':
                break;
            case 'En comité':
                this.enviadaAComite = true;
                this.habilitarComite = true;
                this.mostrarBtnRechazar = false;

                break;

            case 'En concejo':
                this.enviadaAConsejo = true;
                this.habilitarComite = true;
                this.mostrarBtnRechazar = false;
                break;

            case 'Resuelta':
                this.habilitarComite = true;
                if (this.vaAlConcejo && this.avalComite.avaladoComite === 'Si') {
                    this.habilitarConcejo = true;
                    this.deshabilitarEnvioAConsejo = true;
                }

                this.habilitarTramiteGenerico = this.gestor.solicitudSeleccionada.codigoSolicitud === 'SO_OTRA';

                this.mostrarBtnRechazar = false;
                break;
        }
    }

    previsualizarDocuementoPDF(codigoSolicitud: string | null, tipoDocumento: string, agregarMarcaDeAgua: boolean) {
        // Utiliza la fábrica para obtener la estrategia basada en el código de solicitud y tipo de documento
        const estrategia = this.factory.crearEstrategia(codigoSolicitud, tipoDocumento);

        // Verifica si se encontró una estrategia válida
        if (!estrategia) {
            console.error(
                `No se encontró una estrategia para el código de solicitud: ${codigoSolicitud} y tipo de documento: ${tipoDocumento}`
            );
            return;
        }

        // Genera el documento PDF usando la estrategia
        const pdfDocConMarca = estrategia.generarDocumento(agregarMarcaDeAgua);

        // Función para crear un archivo PDF y asignar su URL
        const crearArchivoPDF = (pdfDoc: any, nombreArchivo: string) => {
            const pdfBlob = pdfDoc.output('blob');
            const pdfFile = new File([pdfBlob], nombreArchivo, {
                type: 'application/pdf',
            });
            return this.servicioUtilidades.crearUrlSeguroParaPDF(pdfFile);
        };

        // Genera y asigna el PDF según el tipo de documento
        switch (tipoDocumento) {
            case 'respuesta-comite':
                this.urlRespuestaComitePdf = crearArchivoPDF(pdfDocConMarca, 'respuesta-comite.pdf');
                break;
            case 'respuesta-consejo':
                this.urlRespuestaConcejoPdf = crearArchivoPDF(pdfDocConMarca, 'respuesta-consejo.pdf');
                break;
            case 'oficio-consejo':
                this.urlOficioConcejoPdf = crearArchivoPDF(pdfDocConMarca, 'oficio-consejo.pdf');
                break;
            default:
                console.warn(`Tipo de documento no manejado: ${tipoDocumento}`);
                break;
        }
    }

    formatearFecha(fecha: Date) {
        if (fecha) {
            const dia = ('0' + fecha.getDate()).slice(-2); // Asegura que tenga dos dígitos
            const mes = ('0' + (fecha.getMonth() + 1)).slice(-2); // getMonth() es 0-11
            const anio = fecha.getFullYear();
            return `${dia}/${mes}/${anio}`;
        } else {
            return null;
        }
    }

    convertirCadenaAFecha(fechaStr: string): Date {
        const [dia, mes, anio] = fechaStr.split('/').map(Number);
        const fecha = new Date(anio, mes - 1, dia);
        return fecha;
    }

    private validarFormularioComite(): boolean {
        // Paso 1: Verificar si alguna de las listas tiene actividades (asegurando que no sean null)
        const tieneActividades =
            (this.avalComite.asignaturasAprobadas?.length || 0) > 0 ||
            (this.avalComite.asignaturasHomologadas?.length || 0) > 0 ||
            (this.avalComite.asignaturasOtroPrograma?.length || 0) > 0 ||
            (this.avalComite.reconocimientoCreditosPD?.length || 0) > 0 ||
            (this.avalComite.avalActPracticaDocente?.length || 0) > 0;

        // Paso 2: Verificar si al menos una actividad está aprobada en las listas, solo si tiene actividades
        const hayAsignaturasAprobadas =
            tieneActividades &&
            (this.hayAsignaturasAprobadas(this.avalComite.asignaturasAprobadas || []) ||
                this.hayAsignaturasAprobadas(this.avalComite.asignaturasHomologadas || []) ||
                this.hayAsignaturasAprobadas(this.avalComite.asignaturasOtroPrograma || []) ||
                this.hayAsignaturasAprobadas(this.avalComite.reconocimientoCreditosPD || []) ||
                this.hayAsignaturasAprobadas(this.avalComite.avalActPracticaDocente || []));

        console.log('TIENE ACTIVIDADES? ' + tieneActividades);
        console.log('HAY ASIGNATURAS APROBADAS? ' + hayAsignaturasAprobadas);

        // Verificación de que la fecha es válida
        const fechaValida = this.fechaSeleccionada instanceof Date && !isNaN(this.fechaSeleccionada.getTime());

        console.log('FECHA VALIDA? ' + fechaValida);

        return (
            this.avalComite.avaladoComite !== '' && // Verificación de que no sea vacío
            this.avalComite.conceptoComite !== '' &&
            fechaValida && // Asegura que la fecha no sea nula ni inválida
            this.avalComite.numeroActa !== '' &&
            (this.avalComite.avaladoComite === 'No' || // Si es 'No', no requiere asignaturas aprobadas
                !tieneActividades || // Si no hay actividades, no requiere asignaturas aprobadas
                hayAsignaturasAprobadas) // Si hay actividades, se verifica que al menos una esté aprobada
        );
    }

    // Método auxiliar para verificar si al menos una actividad está aprobada en una lista dada
    private hayAsignaturasAprobadas(lista: any[]): boolean {
        return lista.some((actividad) => actividad.aprobado === true);
    }

    private validarFormularioConcejo(): boolean {
        // Paso 1: Verificar si alguna de las listas tiene actividades (asegurando que no sean null)
        const tieneActividades =
            (this.respuestaConsejo.asignaturasAprobadas?.length || 0) > 0 ||
            (this.respuestaConsejo.asignaturasHomologadas?.length || 0) > 0 ||
            (this.respuestaConsejo.asignaturasOtroPrograma?.length || 0) > 0 ||
            (this.respuestaConsejo.reconocimientoCreditosPD?.length || 0) > 0 ||
            (this.respuestaConsejo.avalActPracticaDocente?.length || 0) > 0;

        // Paso 2: Verificar si al menos una actividad está aprobada en las listas, solo si tiene actividades
        const hayAsignaturasAprobadas =
            tieneActividades &&
            (this.hayAsignaturasAprobadas(this.respuestaConsejo.asignaturasAprobadas || []) ||
                this.hayAsignaturasAprobadas(this.respuestaConsejo.asignaturasHomologadas || []) ||
                this.hayAsignaturasAprobadas(this.respuestaConsejo.asignaturasOtroPrograma || []) ||
                this.hayAsignaturasAprobadas(this.respuestaConsejo.reconocimientoCreditosPD || []) ||
                this.hayAsignaturasAprobadas(this.respuestaConsejo.avalActPracticaDocente || []));

        // Validación de que la fecha del consejo es válida
        const fechaValida = this.fechaConsejo instanceof Date && !isNaN(this.fechaConsejo.getTime());

        return (
            (this.respuestaConsejo.avaladoConcejo === 'Si' || this.respuestaConsejo.avaladoConcejo === 'No') &&
            this.respuestaConsejo.conceptoConcejo !== '' &&
            fechaValida &&
            (this.respuestaConsejo.avaladoConcejo === 'No' || // Si es "No", no requiere asignaturas aprobadas
                !tieneActividades || // Si no hay actividades, no requiere asignaturas aprobadas
                hayAsignaturasAprobadas) // Si hay actividades, se verifica que al menos una esté aprobada
        );
    }

    mostrarAlertaFormulario(tipoAlerta: string) {
        switch (tipoAlerta) {
            case 'incompleto':
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Datos Incompletos',
                    detail: 'Ingrese toda la información requerida',
                });
                break;

            case 'guardado':
                this.messageService.add({
                    severity: 'success',
                    summary: 'Datos Registrados',
                    detail: 'Se ha guardado la información',
                });
                break;

            case 'enviado':
                this.messageService.add({
                    severity: 'success',
                    summary: 'Correo Enviado',
                    detail: 'Envio exitoso via correo',
                });
                break;

            default:
                break;
        }
    }

    onUpload(event, fubauto) {
        for (let doc of event.files) {
            const archivoPDF = new File([doc], doc.name, {
                type: 'application/pdf',
            });

            this.archivosCargados.push(archivoPDF);
        }

        fubauto.clear();
    }

    visualizarDocumentoConsejo(indice: number) {
        this.urlDocumentoCargaConsejoPdf = this.servicioUtilidades.crearUrlSeguroParaPDF(this.archivosCargados[indice]);
    }

    eliminarDocuementoConcejo(index: number) {
        this.archivosCargados.splice(index, 1);
    }

    getAsignaturasPorSolicitud(solicitud: any, codigoSolicitud: string): any[] {
        switch (codigoSolicitud) {
            case 'AD_ASIG':
            case 'CA_ASIG':
                return solicitud.asignaturasAprobadas;
            case 'HO_ASIG_POS':
            case 'HO_ASIG_ESP':
                return solicitud.asignaturasHomologadas;
            case 'CU_ASIG':
                return solicitud.asignaturasOtroPrograma;
            case 'AV_COMI_PR':
                return solicitud.avalActPracticaDocente;
            case 'RE_CRED_PR_DOC':
                return solicitud.reconocimientoCreditosPD;
            default:
                return [];
        }
    }

    getTituloPorSolicitud(codigoSolicitud: string, contexto: string): string {
        const contextoTexto = contexto === 'COMITE' ? 'comité' : 'consejo';

        switch (codigoSolicitud) {
            case 'AD_ASIG':
                return `Asignaturas aprobadas por el ${contextoTexto} para su adición`;
            case 'CA_ASIG':
                return `Asignaturas aprobadas por el ${contextoTexto} para su cancelación`;
            case 'HO_ASIG_POS':
            case 'HO_ASIG_ESP':
                return `Asignaturas aprobadas por el ${contextoTexto} para su homologación`;
            case 'CU_ASIG':
                return `Asignaturas aprobadas para cursar en otro programa según el ${contextoTexto}`;
            case 'AV_COMI_PR':
                return `Actividades de práctica docente aprobadas por el ${contextoTexto}`;
            case 'RE_CRED_PR_DOC':
                return `Actividades aprobadas para el reconocimiento de créditos por el ${contextoTexto}`;
            default:
                return `Asignaturas aprobadas por el ${contextoTexto}`;
        }
    }

    getDetalleAsignatura(asignatura: any, codigoSolicitud: string): string {
        console.log(this.avalComite);
        switch (codigoSolicitud) {
            case 'AD_ASIG':
            case 'CA_ASIG':
                return `${asignatura.nombre} GRUPO ${asignatura.grupo} - ${asignatura.nombreDocente}`;
            case 'HO_ASIG_POS':
            case 'HO_ASIG_ESP':
                return `${asignatura.nombreAsignatura} - ${asignatura.nombrePrograma} (${asignatura.nombreInstitucion})`;
            case 'CU_ASIG':
                return `${asignatura.nombreAsignatura} - ${asignatura.creditos} créditos - (${asignatura.nombrePrograma} - ${asignatura.nombreInstitucion})`;
            case 'AV_COMI_PR':
                return `${asignatura.nombreActividad}`;
            case 'RE_CRED_PR_DOC':
                return `${asignatura.nombreActividad}`;
            default:
                return `${asignatura.nombre}`;
        }
    }
}
