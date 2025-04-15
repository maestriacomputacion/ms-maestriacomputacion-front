import { jsPDF } from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';
import { GestorService } from '../../../services/gestor.service';

export class SolicitudDeBeca implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private pdfService: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        // Obtener datos del formulario
        const tipoBeca = this.servicioRadicar.formSolicitudBecaDescuento.get('tipoBeca').value;
        const justificacion = this.servicioRadicar.formSolicitudBecaDescuento.get('justificacion').value.toLowerCase();

        // Texto para el asunto
        const textAsunto = `Asunto: Solicitud de ${tipoBeca}\n`;

        // Texto para la solicitud
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar el otorgamiento de ${
            tipoBeca === 'Descuento en la matrícula' ? 'un' : 'una'
        } "${tipoBeca}".`;

        // Texto adicional según el tipo de beca
        const textMotivoBeca = ` La presente solicitud obedece a que ${justificacion}`;
        const textComplemento = ` Adjunto a esta solicitud el formato FA diligenciado con los datos correspondientes para su estudio.`;

        // Obtener los nombres de los archivos adjuntos
        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        // Añadir contenido común
        let cursorY = this.pdfService.agregarContenidoComun(doc, marcaDeAgua);

        // Añadir asunto y solicitud según el tipo de beca
        if (tipoBeca === 'Beca - Trabajo' || tipoBeca === 'Descuento en la matrícula') {
            cursorY = this.pdfService.agregarAsuntoYSolicitud(
                doc,
                cursorY,
                textAsunto,
                textSolicitud + textMotivoBeca,
                marcaDeAgua
            );
        } else if (tipoBeca === 'Beca - Convenio (cidesco)' || tipoBeca === 'Beca - Mejor promedio en pregrado') {
            cursorY = this.pdfService.agregarAsuntoYSolicitud(
                doc,
                cursorY,
                textAsunto,
                textSolicitud + textComplemento,
                marcaDeAgua
            );
        }

        // Salto de línea
        doc.text('', 5, cursorY);
        cursorY += 5;

        // Añadir despedida
        cursorY = this.pdfService.agregarDespedida(doc, cursorY, marcaDeAgua);

        // Añadir espacios para firmas
        cursorY = this.pdfService.agregarEspaciosDeFirmas(doc, cursorY, false, true, marcaDeAgua);

        // Añadir listado de adjuntos si es necesario
        if (
            tipoBeca === 'Beca - Convenio (cidesco)' ||
            tipoBeca === 'Beca - Mejor promedio en pregrado' ||
            (tipoBeca === 'Descuento en la matrícula' && this.servicioRadicar.documentosAdjuntos[0] !== undefined)
        ) {
            this.pdfService.agregarListadoAdjuntos(doc, cursorY, textAdjuntos, marcaDeAgua);
        }

        // Retornar el documento generado
        return doc;
    }
}

export class RespuestaComiteSolicitudDeBeca implements DocumentoPDFStrategy {
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
        const tipoBeca = this.servicioGestor.infoSolicitud.datoSolicitudBeca.tipo;

        const txtAsunto = `Asunto: Respuesta a Solicitud ${radicado} de ${tipoBeca}\n`;
        const txtCuerpo = `Reciba un cordial saludo. Por medio de la presente, me dirijo a usted para informarle que en sesión del día ${fechaComite[0]} de ${mesEnLetras} de ${fechaComite[2]}, el Comité de Programa revisó su solicitud con radicado ${radicado} referente a la ${tipoBeca}, decidiendo NO AVALAR la solicitud y emite el siguiente concepto:`;
        const txtConcepto = `\n${this.servicioGestor.conceptoComite.conceptoComite}`;
        const txtRemitente = `${this.servicioGestor.InfoCoordinador.nombreCompleto.toUpperCase()}\n${
            this.servicioGestor.InfoCoordinador.tratamiento == 'sr.' ? 'Coordinador' : 'Coordinadora'
        } de la Maestría en Computación`;

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

export class OficioConcejoSolicitudDeBeca implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });

        const fechaComite = this.servicioGestor.conceptoComite.fechaAval.split('/');
        const mesEnLetras = this.servicioUtilidades.obtenerMesEnLetras(Number(fechaComite[1]));
        const tipoBeca = this.servicioGestor.infoSolicitud.datoSolicitudBeca.tipo;

        const textAsunto = `Asunto: Solicitud de ${tipoBeca} para el/la estudiante ${this.servicioGestor.infoSolicitud.datosComunSolicitud.nombreSolicitante} ${this.servicioGestor.infoSolicitud.datosComunSolicitud.apellidoSolicitante}\n`;
        const textCuerpo = `${this.servicioGestor.InfoDecano.tratamiento == 'sr.' ? 'Estimado' : 'Estimada'} ${
            this.servicioGestor.InfoDecano.nombreCompleto.split(' ')[0]
        },\n\nReciba un cordial saludo. Me dirijo a usted de manera respetuosa para informarle que, en sesión del día ${
            fechaComite[0]
        } de ${mesEnLetras} de ${
            fechaComite[2]
        }, el Comité de Programa ha avalado la solicitud ${tipoBeca} realizada por ${this.servicioGestor.infoSolicitud.datosComunSolicitud.nombreSolicitante.toUpperCase()} ${this.servicioGestor.infoSolicitud.datosComunSolicitud.apellidoSolicitante.toUpperCase()}. Por lo tanto, solicito su colaboración para llevar a cabo las gestiones necesarias que permitan conceder la beca solicitada por el estudiante.`;

        const txtRemitente = `${this.servicioGestor.InfoCoordinador.nombreCompleto.toUpperCase()}\n${
            this.servicioGestor.InfoCoordinador.tratamiento == 'sr.' ? 'Coordinador' : 'Coordinadora'
        } de la Maestría en Computación`;

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

export class RespuestaConcejoSolicitudDeBeca implements DocumentoPDFStrategy {
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
        const tipoBeca = this.servicioGestor.infoSolicitud.datoSolicitudBeca.tipo;

        const txtAsunto = `Asunto: Respuesta a Solicitud ${radicado} de ${tipoBeca}\n`;
        const txtCuerpo = `Reciba un cordial saludo. Por medio de la presente, me dirijo a usted para informarle que el día ${
            fechaConcejo[0]
        } de ${mesEnLetras} de ${
            fechaConcejo[2]
        } se recibió respuesta del Consejo de Facultad referente a su solicitud ${radicado} de ${tipoBeca}. ${
            this.servicioGestor.conceptoConsejo.avaladoConcejo === 'Si'
                ? 'El Consejo decide aprobar su solicitud bajo el siguiente concepto:'
                : 'El Consejo decide no aprobar su solicitud bajo el siguiente concepto:'
        }`;
        const txtConcepto = `${this.servicioGestor.conceptoConsejo.conceptoConcejo}`;
        const txtRemitente = `${this.servicioGestor.InfoCoordinador.nombreCompleto.toUpperCase()}\n${
            this.servicioGestor.InfoCoordinador.tratamiento == 'sr.' ? 'Coordinador' : 'Coordinadora'
        } de la Maestría en Computación`;

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
