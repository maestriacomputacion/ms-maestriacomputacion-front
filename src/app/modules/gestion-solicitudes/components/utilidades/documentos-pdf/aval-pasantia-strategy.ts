import { jsPDF } from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';
import { GestorService } from '../../../services/gestor.service';

export class SolicitudAvalPasantia implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private pdfService: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        // Texto para el asunto
        const textAsunto = `Asunto: Solicitud de aval para la realización de una pasantía de investigación\n`;

        // Texto para la solicitud
        const rangoFechas = this.servicioUtilidades.describirRangoFechas(
            this.servicioRadicar.fechasEstancia[0],
            this.servicioRadicar.fechasEstancia[1]
        );
        const textSolicitud = `Reciban un cordial saludo. Me dirijo a ustedes con el fin de solicitar el aval para la realización de una estancia de investigación en la ${this.servicioRadicar.UniversidadExternaPasantia}, ${this.servicioRadicar.lugarEstancia}, durante el periodo comprendido entre el ${rangoFechas}.\n\nLa estancia se llevará a cabo con la colaboración del ${this.servicioRadicar.grupoInvestigacionExternoPanatia} de la ${this.servicioRadicar.UniversidadExternaPasantia}, bajo la supervisión del docente ${this.servicioRadicar.docenteExternoPas}. Adjunto a esta solicitud la documentación y formatos requeridos para su revisión.`;

        // Adjuntos
        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        // Añadir contenido común
        let cursorY = this.pdfService.agregarContenidoComun(doc, marcaDeAgua);

        // Añadir asunto y solicitud
        cursorY = this.pdfService.agregarAsuntoYSolicitud(doc, cursorY, textAsunto, textSolicitud, marcaDeAgua);

        // Salto de línea
        doc.text('', 5, cursorY);
        cursorY += 5;

        // Añadir despedida
        cursorY = this.pdfService.agregarDespedida(doc, cursorY, marcaDeAgua);

        // Añadir espacios para firmas
        cursorY = this.pdfService.agregarEspaciosDeFirmas(doc, cursorY, false, true, marcaDeAgua);

        // Añadir listado de adjuntos
        this.pdfService.agregarListadoAdjuntos(doc, cursorY, textAdjuntos, marcaDeAgua);

        // Retornar el documento generado
        return doc;
    }
}

export class RespuestaComiteAvalPasantia implements DocumentoPDFStrategy {
    // Se deben incluir todos los servicios que define la fabrica asi no se usen
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });

        const { radicado } = this.servicioGestor.infoSolicitud.datosComunSolicitud;
        const fechaComite = this.servicioGestor.conceptoComite.fechaAval.split('/');
        const mesEnLetras = this.servicioUtilidades.obtenerMesEnLetras(Number(fechaComite[1]));

        const txtAsunto = `Asunto: Respuesta a Solicitud ${radicado} de Aval para realización de Pasantía de Investigación\n`;
        const txtCuerpo = `Reciba un cordial saludo. Por medio de la presente me dirijo a usted con el fin de informar que en sesión del día ${fechaComite[0]} de ${mesEnLetras} de ${fechaComite[2]} el Comité de Programa revisó su solicitud con radicado ${radicado} referente al Aval para la realización de una Pasantía de Investigación, decidiendo no avalar la solicitud y emite el siguiente concepto:`;
        const txtConcepto = `\n${this.servicioGestor.conceptoComite.conceptoComite}`;
        const txtRemitente = `${this.servicioGestor.InfoCoordinador.nombreCompleto.toUpperCase()}\n${
            this.servicioGestor.InfoCoordinador.tratamiento == 'sr.' ? 'Coordinador' : 'Coordinadora'
        } Maestría en Computación`;

        let posicionY = this.servicioPDF.agregarContenidoComun(documento, marcaDeAgua, 'solicitante');
        posicionY = this.servicioPDF.agregarAsuntoYSolicitud(documento, posicionY, txtAsunto, txtCuerpo, marcaDeAgua);
        posicionY = this.servicioPDF.agregarTexto(documento, {
            text: txtConcepto,
            startY: posicionY,
            alignment: 'justify',
        });

        posicionY = this.servicioPDF.agregarDespedida(documento, posicionY + 5, marcaDeAgua, 'respuesta');
        posicionY = this.servicioPDF.agregarTexto(documento, {
            text: txtRemitente,
            startY: posicionY + 10,
            watermark: marcaDeAgua,
        });

        return documento;
    }
}

export class OficioConcejoAvalPasantia implements DocumentoPDFStrategy {
    // Se deben incluir todos los servicios que define la fabrica asi no se usen
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });

        const { fechaInicio } = this.servicioGestor.infoSolicitud.datoAvalPasantiaInv;
        const { fechaFin } = this.servicioGestor.infoSolicitud.datoAvalPasantiaInv;

        const fechaComite = this.servicioGestor.conceptoComite.fechaAval.split('/');
        const mesEnLetras = this.servicioUtilidades.obtenerMesEnLetras(Number(fechaComite[1]));

        const textAsunto = `Asunto: Solicitud Aval Académico para realización de Pasantía del estudiante ${this.servicioGestor.infoSolicitud.datosComunSolicitud.nombreSolicitante} ${this.servicioGestor.infoSolicitud.datosComunSolicitud.apellidoSolicitante} \n`;
        const textCuerpo = `${this.servicioGestor.InfoDecano.tratamiento == 'sr.' ? 'Estimado' : 'Estimada'} ${
            this.servicioGestor.InfoDecano.nombreCompleto.split(' ')[0]
        }, reciba cordial saludo. Comedidamente me dirijo a usted con el fin informar que en sesión del día ${
            fechaComite[0]
        } de ${mesEnLetras} de ${
            fechaComite[2]
        } el Comité de Programa avaló la solicitud presentada por el/la estudiante ${this.servicioGestor.infoSolicitud.datosComunSolicitud.nombreSolicitante.toUpperCase()} ${this.servicioGestor.infoSolicitud.datosComunSolicitud.apellidoSolicitante.toUpperCase()} para la realización de una Pasantía de Investigación en ${
            this.servicioGestor.infoSolicitud.datoAvalPasantiaInv.lugarPasantia
        } a llevarse a cabo del ${fechaInicio} al ${fechaFin}. Por lo tanto, muy formalmente solicito su colaboración para realizar las gestiones necesarias para la obtención del aval académico y el aval de la ORI.`;
        const txtRemitente = `${this.servicioGestor.InfoCoordinador.nombreCompleto.toUpperCase()}\n${
            this.servicioGestor.InfoCoordinador.tratamiento == 'sr.' ? 'Coordinador' : 'Coordinadora'
        } Maestría en Computación`;

        let posicionY = this.servicioPDF.agregarContenidoComun(documento, marcaDeAgua, 'consejo');
        posicionY = this.servicioPDF.agregarAsuntoYSolicitud(documento, posicionY, textAsunto, textCuerpo, marcaDeAgua);

        posicionY = this.servicioPDF.agregarDespedida(documento, posicionY + 5, marcaDeAgua);
        posicionY = this.servicioPDF.agregarTexto(documento, {
            text: txtRemitente,
            startY: posicionY + 10,
            watermark: marcaDeAgua,
        });

        return documento;
    }
}

export class RespuestaConcejoAvalPasantia implements DocumentoPDFStrategy {
    // Se deben incluir todos los servicios que define la fabrica asi no se usen
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });

        const { radicado } = this.servicioGestor.infoSolicitud.datosComunSolicitud;
        const fechaConcejo = this.servicioGestor.conceptoConsejo.fechaAval.split('/');
        const mesEnLetras = this.servicioUtilidades.obtenerMesEnLetras(Number(fechaConcejo[1]));

        const txtAsunto = `Asunto: Respuesta a Solicitud ${radicado} de Aval para realización de Pasantía de Investigación\n`;
        const txtCuerpo = `Reciba un cordial saludo. Por medio de la presente me dirijo a usted con el fin de informar que el día ${
            fechaConcejo[0]
        } de ${mesEnLetras} de ${
            fechaConcejo[2]
        }, se recibió respuesta del Consejo de Facultad referente a su solicitud ${radicado} de Aval para realización de Pasantía de Investigación. ${
            this.servicioGestor.conceptoConsejo.avaladoConcejo === 'Si'
                ? 'El Consejo decide aprobar su solicitud bajo el siguiente concepto:'
                : 'El Consejo decide no aprobar su solicitud bajo el siguiente concepto:'
        }`;
        const txtConcepto = `${this.servicioGestor.conceptoConsejo.conceptoConcejo}`;
        const txtRemitente = `${this.servicioGestor.InfoCoordinador.nombreCompleto.toUpperCase()}\n${
            this.servicioGestor.InfoCoordinador.tratamiento == 'sr.' ? 'Coordinador' : 'Coordinadora'
        } Maestría en Computación`;

        let posicionY = this.servicioPDF.agregarContenidoComun(documento, marcaDeAgua, 'solicitante');
        posicionY = this.servicioPDF.agregarAsuntoYSolicitud(documento, posicionY, txtAsunto, txtCuerpo, marcaDeAgua);
        posicionY = this.servicioPDF.agregarTexto(documento, {
            text: txtConcepto,
            startY: posicionY + 5,
            alignment: 'justify',
            watermark: marcaDeAgua,
        });
        posicionY = this.servicioPDF.agregarDespedida(documento, posicionY + 5, marcaDeAgua, 'respuesta');
        posicionY = this.servicioPDF.agregarTexto(documento, {
            text: txtRemitente,
            startY: posicionY + 10,
            watermark: marcaDeAgua,
        });

        return documento;
    }
}
