import { jsPDF } from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';
import { GestorService } from '../../../services/gestor.service';

export class SolicitudHomologAsignaturasPos implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private pdfService: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        // Texto para el asunto
        const textAsunto = `Asunto: Solicitud de homologación de asignaturas cursadas en otros programas de posgrado\n`;

        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;
        // Texto para la solicitud
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar la homologación de las asignaturas relacionadas en la tabla a continuación, las cuales fueron cursadas en el programa de posgrado, ${this.servicioRadicar.datosInstitucionHomologar.programa} de la ${this.servicioRadicar.datosInstitucionHomologar.institucion}.`;

        // Añadir contenido común
        let cursorY = this.pdfService.agregarContenidoComun(doc, marcaDeAgua);

        // Añadir asunto y solicitud
        cursorY = this.pdfService.agregarAsuntoYSolicitud(doc, cursorY, textAsunto, textSolicitud, marcaDeAgua);

        // Datos para la tabla
        const headers = ['No.', 'Asignatura', 'Créditos', 'Intensidad (h/semana)', 'Calificación'];

        const data = this.servicioRadicar.datosAsignaturasAHomologar.map((item, index) => [
            (index + 1).toString(),
            item.asignatura,
            item.creditos.toString(),
            item.intensidad.toString(),
            item.calificacion.toString(),
        ]);

        // Añadir tabla
        cursorY = this.pdfService.agregarTablaPersonalizada(doc, cursorY, headers, data, marcaDeAgua);

        // Añadir despedida
        cursorY = this.pdfService.agregarDespedida(doc, cursorY, marcaDeAgua);

        // Añadir espacios para firmas
        cursorY = this.pdfService.agregarEspaciosDeFirmas(doc, cursorY, false, true, marcaDeAgua);

        cursorY = this.pdfService.agregarListadoAdjuntos(doc, cursorY, textAdjuntos, marcaDeAgua);

        // Retornar el documento generado
        return doc;
    }
}

export class RespuestaComiteHomologAsignaturasPos implements DocumentoPDFStrategy {
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

        const asunto = `Asunto: Respuesta a Solicitud ${radicado} de homologación de asignaturas\n`;
        const cuerpo = `Reciba un cordial saludo. Me dirijo a usted para informar que en la sesión del ${dia} de ${mesEnLetras} de ${año}, el Comité de Programa revisó su solicitud con radicado ${radicado}, referente a la homologación de asignaturas, decidiendo no avalar la solicitud. A continuación se expone el concepto:`;
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

export class OficioConcejoHomologAsignaturasPos implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });
        const [dia, mes, año] = this.servicioGestor.conceptoComite.fechaAval.split('/');
        const mesEnLetras = this.servicioUtilidades.obtenerMesEnLetras(Number(mes));
        const { nombreSolicitante, apellidoSolicitante, numeroIdentSolicitante, tipoIdentSolicitante } =
            this.servicioGestor.infoSolicitud.datosComunSolicitud;

        const asunto = `Asunto: Solicitud de Homologación de asignaturas para el/la estudiante ${nombreSolicitante} ${apellidoSolicitante}\n`;
        const cuerpo = `${this.servicioGestor.InfoDecano.tratamiento == 'sr.' ? 'Estimado' : 'Estimada'} ${
            this.servicioGestor.InfoDecano.nombreCompleto.split(' ')[0]
        }, reciba un cordial saludo. Me dirijo a usted para informar que el ${dia} de ${mesEnLetras} de ${año}, el Comité de Programa avaló la homologación de las asignaturas cursadas por el/la estudiante ${nombreSolicitante.toUpperCase()} ${apellidoSolicitante.toUpperCase()}, identificado con ${tipoIdentSolicitante} ${numeroIdentSolicitante} en el programa de ${
            this.servicioGestor.infoSolicitud.datosSolicitudHomologacion.programaProcedencia
        } (${
            this.servicioGestor.infoSolicitud.datosSolicitudHomologacion.institutoProcedencia
        }). Agradezco su colaboración en las gestiones necesarias para el registro de dichas homologaciones.`;
        const remitente = `${this.servicioGestor.InfoCoordinador.nombreCompleto.toUpperCase()}\n${
            this.servicioGestor.InfoCoordinador.tratamiento == 'sr.' ? 'Coordinador' : 'Coordinadora'
        } Maestría en Computación`;

        let cursorY = this.servicioPDF.agregarContenidoComun(documento, marcaDeAgua, 'consejo');
        cursorY = this.servicioPDF.agregarAsuntoYSolicitud(documento, cursorY, asunto, cuerpo, marcaDeAgua);

        const encabezados = ['No.', 'Asignatura', 'Créditos', 'Intensidad (h/semana)', 'Calificación'];
        const datosTabla = this.servicioGestor.conceptoComite.asignaturasHomologadas
            .filter((item) => item.aprobado)
            .map((item, index) => [
                (index + 1).toString(),
                item.nombreAsignatura,
                item.creditos.toString(),
                item.intensidadHoraria.toString(),
                item.calificacion.toString(),
            ]);

        cursorY = this.servicioPDF.agregarTablaPersonalizada(documento, cursorY, encabezados, datosTabla, marcaDeAgua);
        cursorY = this.servicioPDF.agregarDespedida(documento, cursorY + 5, marcaDeAgua);
        cursorY = this.servicioPDF.agregarTexto(documento, {
            text: remitente,
            startY: cursorY + 10,
            watermark: marcaDeAgua,
        });

        return documento;
    }
}

export class RespuestaConcejoHomologAsignaturasPos implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });
        const { radicado } = this.servicioGestor.infoSolicitud.datosComunSolicitud;
        const [dia, mes, año] = this.servicioGestor.conceptoConsejo.fechaAval.split('/');
        const mesEnLetras = this.servicioUtilidades.obtenerMesEnLetras(Number(mes));

        const asunto = `Asunto: Respuesta a Solicitud ${radicado} de homologación de asignaturas\n`;
        const cuerpo = `Reciba un cordial saludo. Me dirijo a usted para informar que el ${dia} de ${mesEnLetras} de ${año}, se recibió la respuesta del Consejo de Facultad referente a su solicitud con radicado ${radicado}. El Consejo ${
            this.servicioGestor.conceptoConsejo.avaladoConcejo === 'Si' ? 'aprueba' : 'no aprueba'
        } su solicitud bajo el siguiente concepto:`;
        const concepto = this.servicioGestor.conceptoConsejo.conceptoConcejo;
        const remitente = `${this.servicioGestor.InfoCoordinador.nombreCompleto.toUpperCase()}\n${
            this.servicioGestor.InfoCoordinador.tratamiento == 'sr.' ? 'Coordinador' : 'Coordinadora'
        } Maestría en Computación`;

        let cursorY = this.servicioPDF.agregarContenidoComun(documento, marcaDeAgua, 'solicitante');
        cursorY = this.servicioPDF.agregarAsuntoYSolicitud(documento, cursorY, asunto, cuerpo, marcaDeAgua);
        cursorY = this.servicioPDF.agregarTexto(documento, {
            text: concepto,
            startY: cursorY + 5,
            alignment: 'justify',
            watermark: marcaDeAgua,
        });
        cursorY = this.servicioPDF.agregarDespedida(documento, cursorY + 5, marcaDeAgua, 'respuesta');
        cursorY = this.servicioPDF.agregarTexto(documento, {
            text: remitente,
            startY: cursorY + 10,
            watermark: marcaDeAgua,
        });

        return documento;
    }
}
