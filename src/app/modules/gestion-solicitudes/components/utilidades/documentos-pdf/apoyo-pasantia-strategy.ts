import { jsPDF } from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';
import { GestorService } from '../../../services/gestor.service';

export class SolicitudApoyoEconomicoPasantia implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        // Obtener el rango de fechas de la estancia
        const rangoFechas = this.servicioUtilidades.describirRangoFechas(
            this.servicioRadicar.fechasEstancia[0],
            this.servicioRadicar.fechasEstancia[1]
        );

        // Texto para el asunto
        const textAsunto = `Asunto: Solicitud de Apoyo Económico para Pasantía de Investigación\n`;

        // Texto para la solicitud
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar un apoyo económico para realizar una estancia de investigación en la ${this.servicioRadicar.UniversidadExternaPasantia}, ${this.servicioRadicar.lugarEstancia}, durante el periodo comprendido entre el ${rangoFechas}. Esta solicitud está avalada por la dirección del ${this.servicioRadicar.grupoInvestigacion} de la Universidad del Cauca. Adicionalmente, la pasantía se llevará a cabo con la colaboración del ${this.servicioRadicar.grupoInvestigacionExternoPanatia} de la ${this.servicioRadicar.UniversidadExternaPasantia} bajo la supervisión del docente ${this.servicioRadicar.docenteExternoPas}. Anexo la documentación requerida para este proceso.`;

        // Texto para los datos del apoyo económico
        const textDatosApoyo = `\nA continuación, incluyo los detalles del apoyo solicitado:
        \nValor apoyo económico: COP $${this.servicioUtilidades.numeroAMoneda(
            this.servicioRadicar.valorApoyoEcon
        )}\nEntidad Bancaria: ${this.servicioRadicar.banco}\nTipo de Cuenta: ${
            this.servicioRadicar.tipoCuenta
        }\nNúmero de Cuenta: ${this.servicioRadicar.numeroCuenta}\nTitular: ${
            this.servicioRadicar.formInfoPersonal.get('nombres').value
        } ${this.servicioRadicar.formInfoPersonal.get('apellidos').value}\nCédula: ${
            this.servicioRadicar.formInfoPersonal.get('numeroDocumento').value
        }\n\nContacto:
        \nCelular: ${this.servicioRadicar.formInfoPersonal.get('celular').value}\nCorreo: ${
            this.servicioRadicar.formInfoPersonal.get('correo').value
        }\nDirección: ${this.servicioRadicar.direccion}\n`;

        // Adjuntar archivos
        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        // Añadir contenido común al documento
        let cursorY = this.servicioPDF.agregarContenidoComun(doc, marcaDeAgua);

        // Añadir asunto y solicitud
        cursorY = this.servicioPDF.agregarAsuntoYSolicitud(doc, cursorY, textAsunto, textSolicitud, marcaDeAgua);

        // Añadir los datos del apoyo económico
        cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textDatosApoyo,
            startY: cursorY,
            watermark: marcaDeAgua,
        });

        // Añadir despedida
        cursorY = this.servicioPDF.agregarDespedida(doc, cursorY, marcaDeAgua);

        // Añadir espacios de firmas
        cursorY = this.servicioPDF.agregarEspaciosDeFirmas(doc, cursorY, true, true, marcaDeAgua);

        // Añadir adjuntos
        this.servicioPDF.agregarListadoAdjuntos(doc, cursorY, textAdjuntos, marcaDeAgua);

        // Retornar el documento generado
        return doc;
    }
}

export class RespuestaComiteApoyoEconomicoPasantia implements DocumentoPDFStrategy {
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

        const asunto = `Asunto: Respuesta a Solicitud ${radicado} de Apoyo Económico\n`;
        const cuerpo = `Reciba un cordial saludo. Me dirijo a usted para informar que en la sesión del ${dia} de ${mesEnLetras} de ${año}, el Comité de Programa revisó su solicitud con radicado ${radicado}, referente al Apoyo Económico para Pasantía de Investigación, decidiendo no avalar la solicitud. A continuación se expone el concepto:`;
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

export class OficioConcejoApoyoEconomicoPasantia implements DocumentoPDFStrategy {
    constructor(private servicioRadicar: RadicarService, private servicioPDF: PdfService) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });
        return documento;
    }
}

export class RespuestaConcejoApoyoEconomicoPasantia implements DocumentoPDFStrategy {
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

        const txtAsunto = `Asunto: Respuesta a Solicitud ${radicado} de apoyo económico para realizar estancia de investigación\n`;
        const txtCuerpo = `Reciba un cordial saludo. Me dirijo a usted para informar que el día ${
            fechaConcejo[0]
        } de ${mesEnLetras} de ${
            fechaConcejo[2]
        }, se recibió respuesta del Consejo de Facultad referente a su solicitud ${radicado} de apoyo económico para realizar estancia de investigación. ${
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
