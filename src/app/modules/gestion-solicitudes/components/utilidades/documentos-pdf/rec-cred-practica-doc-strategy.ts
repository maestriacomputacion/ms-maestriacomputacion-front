import { jsPDF } from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';
import { GestorService } from '../../../services/gestor.service';

export class SolicitudRecoCredPracticaDocente implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private pdfService: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        // Texto para el asunto
        const textAsunto = `Asunto: Solicitud de reconocimiento de créditos por actividades de práctica docente\n`;

        // Texto para la solicitud
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar el reconocimiento y asignación de los créditos que corresponden a la realización de las actividades de práctica docente enumeradas a continuación, para cada una se adjunta la documentación y/o material de soporte requerido para su estudio.`;

        // Obtener los nombres de los archivos adjuntos
        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        // Añadir contenido común
        let cursorY = this.pdfService.agregarContenidoComun(doc, marcaDeAgua);

        // Añadir asunto y solicitud
        cursorY = this.pdfService.agregarAsuntoYSolicitud(doc, cursorY, textAsunto, textSolicitud, marcaDeAgua);

        // Salto de línea
        doc.text('', 5, cursorY);
        cursorY += 5;

        // Añadir actividades seleccionadas
        for (let index = 0; index < this.servicioRadicar.actividadesSeleccionadas.length; index++) {
            const actividad = `• Actividad ${index + 1}: ${
                this.servicioRadicar.actividadesSeleccionadas[index].nombre
            } - ${this.servicioRadicar.horasAsignables[index]}h`;

            cursorY = this.pdfService.agregarTexto(doc, {
                text: actividad,
                startY: cursorY,
                fontStyle: 'regular',
                alignment: 'left',
                watermark: marcaDeAgua,
            });
        }

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

export class RespuestaComiteRecoCredPracticaDocente implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });
        const { radicado } = this.servicioGestor.infoSolicitud.datosComunSolicitud;
        const [dia, mes, año] = this.servicioGestor.conceptoComite.fechaAval.split('/');
        const mesEnLetras = this.servicioUtilidades.obtenerMesEnLetras(Number(mes));

        const asunto = `Asunto: Respuesta a Solicitud ${radicado} de reconocimiento de créditos\n`;
        const cuerpo = `Reciba un cordial saludo. Me dirijo a usted para informar que en la sesión del ${dia} de ${mesEnLetras} de ${año}, el Comité de Programa revisó su solicitud con radicado ${radicado}, referente al reconocimiento de créditos por actividades de práctica docente, decidiendo no avalar la solicitud. A continuación se expone el concepto:`;
        const concepto = `\n${this.servicioGestor.conceptoComite.conceptoComite}`;
        const remitente = `${this.servicioGestor.InfoCoordinador.nombreCompleto.toUpperCase()}\n${
            this.servicioGestor.InfoCoordinador.tratamiento == 'sr.' ? 'Coordinador' : 'Coordinadora'
        } Maestría en Computación`;

        let cursorY = this.servicioPDF.agregarContenidoComun(documento, marcaDeAgua, 'solicitante');
        cursorY = this.servicioPDF.agregarAsuntoYSolicitud(documento, cursorY, asunto, cuerpo, marcaDeAgua);
        cursorY = this.servicioPDF.agregarTexto(documento, { text: concepto, startY: cursorY, alignment: 'justify' });
        cursorY = this.servicioPDF.agregarDespedida(documento, cursorY + 5, marcaDeAgua, 'respuesta');
        cursorY = this.servicioPDF.agregarTexto(documento, {
            text: remitente,
            startY: cursorY + 10,
            watermark: marcaDeAgua,
        });

        return documento;
    }
}

export class OficioConcejoRecoCredPracticaDocente implements DocumentoPDFStrategy {
    constructor(private servicioRadicar: RadicarService, private servicioPDF: PdfService) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });
        return documento;
    }
}

export class RespuestaConcejoRecoCredPracticaDocente implements DocumentoPDFStrategy {
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

        const txtAsunto = `Asunto: Respuesta a Solicitud ${radicado} de reconocimiento de créditos\n`;
        const txtCuerpo = `Reciba un cordial saludo. Por medio de la presente, me dirijo a usted para informarle que el día ${
            fechaConcejo[0]
        } de ${mesEnLetras} de ${
            fechaConcejo[2]
        } se recibió respuesta del Consejo de Facultad referente a su solicitud ${radicado} de reconocimiento de créditos por actividades de práctica docente. ${
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
