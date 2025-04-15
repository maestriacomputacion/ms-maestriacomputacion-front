import { jsPDF } from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';
import { GestorService } from '../../../services/gestor.service';

export class SolicitudCancelacionAsignaturas implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private pdfService: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        // Texto para el asunto
        const textAsunto = `Asunto: Solicitud de cancelación de asignaturas\n`;

        // Texto para la solicitud
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar la cancelación de las asignaturas relacionadas en la tabla a continuación,`;

        // Texto para el motivo
        const textMotivo = `La presente solicitud obedece a que ${this.servicioRadicar.motivoDeSolicitud.toLowerCase()}.`;

        // Añadir contenido común
        let cursorY = this.pdfService.agregarContenidoComun(doc, marcaDeAgua);
        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        // Añadir asunto y solicitud
        cursorY = this.pdfService.agregarAsuntoYSolicitud(doc, cursorY, textAsunto, textSolicitud, marcaDeAgua);

        // Datos para la tabla
        const headers = ['No.', 'Asignatura', 'Grupo', 'Docente'];
        const data = this.servicioRadicar.datosAsignAdiCancel.map((item, index) => [
            (index + 1).toString(),
            item.nombreAsignatura,
            item.grupoAsignatura,
            item.docente.nombreTutor,
        ]);

        // Añadir tabla
        cursorY = this.pdfService.agregarTablaPersonalizada(doc, cursorY, headers, data, marcaDeAgua);

        // Añadir motivo
        cursorY = this.pdfService.agregarTexto(doc, {
            text: textMotivo,
            startY: cursorY,
            alignment: 'justify',
            watermark: marcaDeAgua,
        });

        // Salto de línea
        doc.text('', 5, cursorY);
        cursorY += 5;

        // Añadir despedida
        cursorY = this.pdfService.agregarDespedida(doc, cursorY, marcaDeAgua);

        // Añadir espacios para firmas
        cursorY = this.pdfService.agregarEspaciosDeFirmas(doc, cursorY, false, true, marcaDeAgua);

        if (textAdjuntos) {
            cursorY = this.pdfService.agregarListadoAdjuntos(doc, cursorY, textAdjuntos, marcaDeAgua);
        }

        // Retornar el documento generado
        return doc;
    }
}

export class RespuestaComiteCancelacionAsignaturas implements DocumentoPDFStrategy {
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

        const txtAsunto = `Asunto: Respuesta a Solicitud ${radicado} de Cancelación de Asignaturas\n`;
        const txtCuerpo = `Reciba un cordial saludo. Por medio de la presente me dirijo a usted con el fin de informar que en sesión del día ${fechaComite[0]} de ${mesEnLetras} de ${fechaComite[2]} el Comité de Programa revisó su solicitud con radicado ${radicado} referente a la Cancelación de Asignaturas, decidiendo no avalar la solicitud y emite el siguiente concepto:`;
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

export class OficioConcejoCancelacionAsignaturas implements DocumentoPDFStrategy {
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

        const textAsunto = `Asunto: Solicitud de Cancelación de Asignaturas para el/la estudiante ${this.servicioGestor.infoSolicitud.datosComunSolicitud.nombreSolicitante} ${this.servicioGestor.infoSolicitud.datosComunSolicitud.apellidoSolicitante} \n`;
        const textCuerpo = `${this.servicioGestor.InfoDecano.tratamiento == 'sr.' ? 'Estimado' : 'Estimada'} ${
            this.servicioGestor.InfoDecano.nombreCompleto.split(' ')[0]
        },\n\nReciba un cordial saludo. Me dirijo a usted de manera respetuosa para informarle que, en sesión del día ${
            fechaComite[0]
        } de ${mesEnLetras} de ${
            fechaComite[2]
        }, el Comité de Programa ha avalado la cancelación de las asignaturas relacionadas en este documento para el/la estudiante ${this.servicioGestor.infoSolicitud.datosComunSolicitud.nombreSolicitante.toUpperCase()} ${this.servicioGestor.infoSolicitud.datosComunSolicitud.apellidoSolicitante.toUpperCase()}. Por lo tanto, solicito su colaboración para llevar a cabo las gestiones necesarias para el registro de las cancelaciones mencionadas.`;

        const txtRemitente = `${this.servicioGestor.InfoCoordinador.nombreCompleto.toUpperCase()}\n${
            this.servicioGestor.InfoCoordinador.tratamiento == 'sr.' ? 'Coordinador' : 'Coordinadora'
        } de la Maestría en Computación`;

        let posicionY = this.servicioPDF.agregarContenidoComun(documento, marcaDeAgua, 'consejo');
        posicionY = this.servicioPDF.agregarAsuntoYSolicitud(documento, posicionY, textAsunto, textCuerpo, marcaDeAgua);

        const headers = ['No.', 'Asignatura', 'Grupo', 'Docente'];

        const data = this.servicioGestor.conceptoComite.asignaturasAprobadas
            .filter((item) => item.aprobado)
            .map((item, index) => [(index + 1).toString(), item.nombre, item.grupo, item.nombreDocente]);

        posicionY = this.servicioPDF.agregarTablaPersonalizada(documento, posicionY, headers, data, marcaDeAgua);
        posicionY = this.servicioPDF.agregarDespedida(documento, posicionY + 5, marcaDeAgua);
        posicionY = this.servicioPDF.agregarTexto(documento, {
            text: txtRemitente,
            startY: posicionY + 10,
            watermark: marcaDeAgua,
        });

        return documento;
    }
}

export class RespuestaConcejoCancelacionAsignaturas implements DocumentoPDFStrategy {
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

        const txtAsunto = `Asunto: Respuesta a Solicitud ${radicado} de Cancelación de Asignaturas\n`;
        const txtCuerpo = `Reciba un cordial saludo. Por medio de la presente, me dirijo a usted para informarle que el día ${
            fechaConcejo[0]
        } de ${mesEnLetras} de ${
            fechaConcejo[2]
        } se recibió respuesta del Consejo de Facultad referente a su solicitud ${radicado} de Cancelación de Asignaturas. ${
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
