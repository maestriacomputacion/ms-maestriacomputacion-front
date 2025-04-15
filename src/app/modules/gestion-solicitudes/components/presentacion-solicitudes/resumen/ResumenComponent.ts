import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';

import { Router } from '@angular/router';
import { RadicarService } from '../../../services/radicar.service';
import { AlmacenarSolicitudService } from '../../../services/almacenarSolicitud.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { UtilidadesService } from '../../../services/utilidades.service';
import { DocumentoPDFFactory } from '../../utilidades/documentos-pdf/documento-pdf-factory';

@Component({
    selector: 'app-resumen',
    templateUrl: './resumen.component.html',
    styleUrls: ['./resumen.component.scss'],
    providers: [ConfirmationService, MessageService],
})
export class ResumenComponent implements OnInit {
    @Output() cambioDePaso = new EventEmitter<number>();

    @ViewChild('firmaImage') firmaImage: ElementRef;

    codTipoSolicitudEscogida: string;
    urlVistaPreviaSolicitudPDF: SafeResourceUrl;

    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHander(event: Event) {
        event.returnValue = true;
        return '¿Estás seguro de que quieres salir de la página?';
    }

    mostrarOficio: boolean = true;

    firmaEnProceso: boolean = false;
    guardadoEnProceso: boolean = false;
    mostrarBtnFirmar: boolean = false;
    habilitarEnvio: boolean = false;
    bloquearBoton: boolean = false;

    constructor(
        public radicar: RadicarService,
        public almacenar: AlmacenarSolicitudService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,

        private servicioUtilidades: UtilidadesService,
        private factory: DocumentoPDFFactory
    ) {
        try {
            this.codTipoSolicitudEscogida = this.radicar.tipoSolicitudEscogida.codigoSolicitud;

            this.cargarVistaPreviaPDF(this.codTipoSolicitudEscogida, 'carta-solicitud', true);
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('codigoSolicitud')) {
                this.router.navigate(['/gestionsolicitudes/portafolio/radicar/selector']);
            } else {
                console.error('Error no esperado:', error);
            }
        }
    }

    ngOnInit() {
        this.cargarVistaPreviaPDF(this.codTipoSolicitudEscogida, 'carta-solicitud', true);
        this.validarTipoSolicitud();
      }


    validarTipoSolicitud() {
        if (this.radicar.tipoSolicitudEscogida.codigoSolicitud === 'CER_VOTO') {
          this.mostrarBtnFirmar = false;
          this.habilitarEnvio = true;
        }
    }

    //validación para mostrar no mostrar firme en la interfaz
    isSolicitudTipoCerVoto(): boolean {
        return this.radicar.tipoSolicitudEscogida.codigoSolicitud === 'CER_VOTO';
      }

    cargarVistaPreviaPDF(codigoSolicitud: string | null, tipoDocumento: string, agregarMarcaDeAgua: boolean) {
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

        // Genera y asigna el PDF con marca de agua
        this.urlVistaPreviaSolicitudPDF = crearArchivoPDF(pdfDocConMarca, `${tipoDocumento}.pdf`);

        // Genera el PDF sin marca de agua
        const pdfDocSinMarca = estrategia.generarDocumento(false);
        const pdfFileSinMarca = new File([pdfDocSinMarca.output('blob')], `${tipoDocumento}.pdf`, {
            type: 'application/pdf',
        });

        // Asigna el documento generado
        this.radicar.oficioDeSolicitud = pdfFileSinMarca;
    }

    onUpload(event, firmante) {
        this.radicar.firmaSolicitante = event.files[0];
        this.renderizarImagen(this.radicar.firmaSolicitante);
        const reader = new FileReader();
        reader.onload = (e) => {
            this.firmaImage.nativeElement.src = e.target.result;
        };
        reader.readAsDataURL(this.radicar.firmaSolicitante);
        firmante.clear();
        this.mostrarBtnFirmar = true;
    }

    firmarSolicitud() {
        if (this.firmaEnProceso) {
            return;
        } else {
            this.firmaEnProceso = true;
            this.cargarVistaPreviaPDF(this.codTipoSolicitudEscogida, 'carta-solicitud', true);

            setTimeout(() => {
                this.mostrarOficio = false;

                setTimeout(() => {
                    this.mostrarOficio = true;
                    this.firmaEnProceso = false;
                    this.mostrarBtnFirmar = false;
                    this.habilitarEnvio = true;
                }, 1000);
            }, 100);
        }
    }

    showWarn() {
        this.messageService.add({
            severity: 'warn',
            summary: 'Documento no firmado',
            detail: 'Firme la carta de su solicitud',
        });
    }

    validarFirmaCargada() {
        if (this.radicar.firmaSolicitanteUrl && !this.mostrarBtnFirmar) {
            this.habilitarEnvio = true;
            return true;
        }
        return false;
    }

    async enviarSolicitud() {
        if (this.guardadoEnProceso) {
            return;
        }

        if (this.radicar.tipoSolicitudEscogida.codigoSolicitud === 'CER_VOTO' || this.validarFirmaCargada()) {
            this.guardadoEnProceso = true;

            try {
                const resultado = await this.almacenar.almacenarSolicitudEnBD();

                if (resultado != null) {
                    this.guardadoEnProceso = false;
                    this.confirmationService.confirm({
                        message:
                            'IMPORTANTE: Conserve este número de seguimiento ' +
                            resultado +
                            ' para que pueda consultar en cualquier momento el estado de su solicitud.',
                        header: 'Solicitud Creada: ' + resultado,
                        icon: 'pi pi-exclamation-circle',
                        acceptLabel: 'Aceptar',
                        rejectVisible: false,
                        accept: () => {
                            this.radicar.restrablecerValores();
                            this.router.navigate(['/gestionsolicitudes/portafolio/opciones']);
                        },
                        reject: () => {
                            this.radicar.restrablecerValores();
                            this.router.navigate(['/gestionsolicitudes/portafolio/opciones']);
                        },
                    });
                } else {
                    this.guardadoEnProceso = false;
                    this.habilitarEnvio = false;
                    this.confirmationService.confirm({
                        message:
                            'Ha ocurrido un error inesperado al enviar la solicitud, revisela e intente enviarla nuevamente.',
                        header: 'Error de envio',
                        icon: 'pi pi-exclamation-triangle',
                        acceptLabel: 'Aceptar',
                        rejectVisible: false,
                        accept: () => {},
                    });
                }
            } catch (error) {
                this.guardadoEnProceso = false;
                this.habilitarEnvio = false;
                this.confirmationService.confirm({
                    message:
                        'Ha ocurrido un error inesperado al enviar la solicitud, revisela e intente enviarla nuevamente.',
                    header: 'Error',
                    icon: 'pi pi-exclamation-triangle',
                    acceptLabel: 'Aceptar',
                    rejectVisible: false,
                    accept: () => {},
                });
            }
        } else {
            this.showWarn();
        }
    }

    renderizarImagen(imagen: File): void {
        const reader = new FileReader();
        reader.onload = () => {
            this.radicar.firmaSolicitanteUrl = reader.result as string;
        };
        reader.readAsDataURL(imagen);
    }

    navigateToBack() {
        if (this.guardadoEnProceso) {
            return;
        }

        if (
            ['SO_OTRA', 'AD_ASIG', 'CU_ASIG', 'RE_CRED_PR_DOC', 'AV_COMI_PR', 'SO_BECA'].includes(
                this.radicar.tipoSolicitudEscogida.codigoSolicitud
            )
        ) {
            this.cambioDePaso.emit(-2); // Retroceder 2 pasos
        } else {
            this.cambioDePaso.emit(-1); // Retroceder al paso anterior
        }
    }
}
