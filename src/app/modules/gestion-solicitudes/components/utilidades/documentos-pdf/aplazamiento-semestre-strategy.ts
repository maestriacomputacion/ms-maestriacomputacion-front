import jsPDF from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { GestorService } from '../../../services/gestor.service';
import { UtilidadesService } from '../../../services/utilidades.service';

// Subestrategia para la solicitud de aplazamiento de semestre
export class SolicitudAplazamientoSemestre implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });
        const textAsunto = `Asunto: Solicitud de aplazamiento de semestre\n`;

        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        const textSolicitud = `Reciban un cordial saludo. Comedidamente me dirijo a ustedes con el fin de solicitar el aplazamiento del ${
            this.servicioRadicar.formSemestreAplazar.get('semestre').value.split('-')[1] === '1' ? 'primer' : 'segundo'
        } semestre de ${
            this.servicioRadicar.formSemestreAplazar.get('semestre').value.split('-')[0]
        }. La presente solicitud obedece a que ${this.servicioRadicar.formSemestreAplazar
            .get('motivo')
            .value.toLowerCase()}.`;

        let cursorY = this.servicioPDF.agregarContenidoComun(doc, marcaDeAgua);
        cursorY = this.servicioPDF.agregarAsuntoYSolicitud(doc, cursorY, textAsunto, textSolicitud, marcaDeAgua);
        cursorY = this.servicioPDF.agregarDespedida(doc, cursorY + 5, marcaDeAgua);
        cursorY = this.servicioPDF.agregarEspaciosDeFirmas(doc, cursorY, false, true, marcaDeAgua);

        if (textAdjuntos) {
            cursorY = this.servicioPDF.agregarListadoAdjuntos(doc, cursorY, textAdjuntos, marcaDeAgua);
        }

        return doc;
    }
}

// Subestrategia para la respuesta del comité al aplazamiento de semestre
export class RespuestaComiteAplazamientoSemestre implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });

        const { radicado } = this.servicioGestor.infoSolicitud.datosComunSolicitud;
        const { semestre } = this.servicioGestor.infoSolicitud.datosSolicitudAplazarSemestre;
        const fechaComite = this.servicioGestor.conceptoComite.fechaAval.split('/');
        const mesEnLetras = this.servicioUtilidades.obtenerMesEnLetras(Number(fechaComite[1]));

        const txtAsunto = `Asunto: Respuesta a Solicitud ${radicado} de Aplazamiento de Semestre\n`;
        const txtCuerpo = `Reciba un cordial saludo. Me dirijo a usted para informar que en sesión del día ${fechaComite[0]} de ${mesEnLetras} de ${fechaComite[2]}, el Comité de Programa revisó su solicitud con radicado ${radicado} referente al Aplazamiento del semestre ${semestre}, decidiendo no avalar la solicitud y emite el siguiente concepto:`;
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

// Subestrategia para el oficio al consejo sobre aplazamiento de semestre
export class OficioConcejoAplazamientoSemestre implements DocumentoPDFStrategy {
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
        const { semestre } = this.servicioGestor.infoSolicitud.datosSolicitudAplazarSemestre;
        const { nombreSolicitante, apellidoSolicitante, numeroIdentSolicitante, tipoIdentSolicitante } =
            this.servicioGestor.infoSolicitud.datosComunSolicitud;

        const textAsunto = `Asunto: Solicitud de Aplazamiento de Semestre para estudiante ${nombreSolicitante} ${apellidoSolicitante}\n`;
        const textCuerpo = `${this.servicioGestor.InfoDecano.tratamiento == 'sr.' ? 'Estimado' : 'Estimada'} ${
            this.servicioGestor.InfoDecano.nombreCompleto.split(' ')[0]
        }, reciba un cordial saludo. Comedidamente me dirijo a usted con el fin de informar que en sesión del día ${
            fechaComite[0]
        } de ${mesEnLetras} de ${
            fechaComite[2]
        }, el Comité de Programa avaló el aplazamiento del semestre ${semestre} solicitado por ${nombreSolicitante.toUpperCase()} ${apellidoSolicitante.toUpperCase()}, estudiante del programa de Maestría en Computación, con ${tipoIdentSolicitante} ${numeroIdentSolicitante}. Por lo tanto, muy formalmente solicito su colaboración para realizar las gestiones necesarias en este caso.`;
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

// Subestrategia para la respuesta del consejo sobre aplazamiento de semestre
export class RespuestaConcejoAplazamientoSemestre implements DocumentoPDFStrategy {
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

        const txtAsunto = `Asunto: Respuesta a Solicitud ${radicado} de Aplazamiento de Semestre\n`;
        const txtCuerpo = `Reciba un cordial saludo. Me dirijo a usted para informar que el día ${
            fechaConcejo[0]
        } de ${mesEnLetras} de ${
            fechaConcejo[2]
        }, se recibió respuesta del Consejo de Facultad referente a su solicitud ${radicado} de Aplazamiento de Semestre. ${
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
