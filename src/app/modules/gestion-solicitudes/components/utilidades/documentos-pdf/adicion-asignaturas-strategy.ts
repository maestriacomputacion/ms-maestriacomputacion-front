import jsPDF from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { GestorService } from '../../../services/gestor.service';
import { UtilidadesService } from '../../../services/utilidades.service';

// Subestrategia para la carta de solicitud
export class SolicitudAdicionAsignaturas implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });
        const asunto = `Asunto: Solicitud de Adición de Asignaturas\n`;
        const cuerpoSolicitud = `Reciban un cordial saludo. Comedidamente me dirijo a ustedes con el fin de solicitar la adición de las asignaturas relacionadas a continuación.`;

        let cursorY = this.servicioPDF.agregarContenidoComun(documento, marcaDeAgua);
        cursorY = this.servicioPDF.agregarAsuntoYSolicitud(documento, cursorY, asunto, cuerpoSolicitud, marcaDeAgua);

        const encabezados = ['No.', 'Asignatura', 'Grupo', 'Docente'];
        const datosTabla = this.servicioRadicar.datosAsignAdiCancel.map((item, index) => [
            (index + 1).toString(),
            item.nombreAsignatura,
            item.grupoAsignatura,
            item.docente.nombreTutor,
        ]);

        cursorY = this.servicioPDF.agregarTablaPersonalizada(documento, cursorY, encabezados, datosTabla, marcaDeAgua);
        cursorY = this.servicioPDF.agregarDespedida(documento, cursorY, marcaDeAgua);
        cursorY = this.servicioPDF.agregarEspaciosDeFirmas(documento, cursorY, false, true, marcaDeAgua);

        return documento;
    }
}

// Subestrategia para la respuesta del comité
export class RespuestaComiteAdicionAsignaturas implements DocumentoPDFStrategy {
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

        const asunto = `Asunto: Respuesta a Solicitud ${radicado} de Adición de Asignaturas\n`;
        const cuerpo = `Reciba un cordial saludo. Me dirijo a usted para informar que en la sesión del ${dia} de ${mesEnLetras} de ${año}, el Comité de Programa revisó su solicitud con radicado ${radicado}, referente a la Adición de Asignaturas, decidiendo no avalar la solicitud. A continuación se expone el concepto:`;
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

// Subestrategia para el oficio para el concejo
export class OficioConcejoAdicionAsignaturas implements DocumentoPDFStrategy {
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

        const asunto = `Asunto: Solicitud de Adición de Asignaturas para estudiante ${nombreSolicitante} ${apellidoSolicitante}\n`;
        const cuerpo = `${this.servicioGestor.InfoDecano.tratamiento == 'sr.' ? 'Estimado' : 'Estimada'} ${
            this.servicioGestor.InfoDecano.nombreCompleto.split(' ')[0]
        }, reciba un cordial saludo. Me dirijo a usted para informar que el ${dia} de ${mesEnLetras} de ${año}, el Comité de Programa avaló la adición de las asignaturas solicitadas por ${nombreSolicitante.toUpperCase()} ${apellidoSolicitante.toUpperCase()}, estudiante del programa de Maestría en Computación, con ${tipoIdentSolicitante} ${numeroIdentSolicitante}. Agradezco su colaboración en las gestiones necesarias para el registro de dichas adiciones.`;
        const remitente = `${this.servicioGestor.InfoCoordinador.nombreCompleto.toUpperCase()}\n${
            this.servicioGestor.InfoCoordinador.tratamiento == 'sr.' ? 'Coordinador' : 'Coordinadora'
        } Maestría en Computación`;

        let cursorY = this.servicioPDF.agregarContenidoComun(documento, marcaDeAgua, 'consejo');
        cursorY = this.servicioPDF.agregarAsuntoYSolicitud(documento, cursorY, asunto, cuerpo, marcaDeAgua);

        const encabezados = ['No.', 'Asignatura', 'Grupo', 'Docente'];
        const datosTabla = this.servicioGestor.conceptoComite.asignaturasAprobadas
            .filter((item) => item.aprobado)
            .map((item, index) => [(index + 1).toString(), item.nombre, item.grupo, item.nombreDocente]);

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

// Subestrategia para la respuesta del concejo
export class RespuestaConcejoAdicionAsignaturas implements DocumentoPDFStrategy {
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

        const asunto = `Asunto: Respuesta a Solicitud ${radicado} de Adición de Asignaturas\n`;
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
