import { jsPDF } from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';
import { GestorService } from '../../../services/gestor.service';

export class SolicitudApoyoEconomicoCongresos implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        // Formatear rango de fechas
        const rangoFechas = this.servicioUtilidades.describirRangoFechas(
            this.servicioRadicar.formApoyoAsistEvento.get('fechas').value[0],
            this.servicioRadicar.formApoyoAsistEvento.get('fechas').value[1]
        );

        // Texto para el asunto
        const textAsunto = `Asunto: Solicitud de apoyo económico para asistencia a evento presentando artículo\n`;

        // Texto para la solicitud
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar un apoyo económico para asistir al evento de carácter ${
            this.servicioRadicar.formApoyoAsistEvento.get('tipoCongreso').value
        }: "${this.servicioRadicar.formApoyoAsistEvento.get('nombreCongreso').value}", que se llevará a cabo en ${
            this.servicioRadicar.formApoyoAsistEvento.get('lugarEvento').value
        } del ${rangoFechas}, y donde se realizará la presentación del trabajo titulado "${
            this.servicioRadicar.formApoyoAsistEvento.get('tituloPublicacion').value
        }". La presente solicitud está avalada por la dirección del ${
            this.servicioRadicar.formApoyoAsistEvento.get('grupoInvestigacion').value
        }. Adicionalmente, anexo la documentación e información requerida para su estudio.`;

        // Texto para los datos del apoyo económico
        const textDatosApoyo = `\nA continuación, incluyo los detalles del apoyo solicitado:
\nValor apoyo económico: COP $${this.servicioUtilidades.numeroAMoneda(
            this.servicioRadicar.formApoyoAsistEvento.get('valorApoyo').value
        )}\nEntidad Bancaria: ${
            this.servicioRadicar.formApoyoAsistEvento.get('entidadBancaria').value
        }\nTipo de Cuenta: ${this.servicioRadicar.formApoyoAsistEvento.get('tipoCuenta').value}\nNúmero de Cuenta: ${
            this.servicioRadicar.formApoyoAsistEvento.get('numeroCuenta').value
        }\nTitular: ${this.servicioRadicar.formInfoPersonal.get('nombres').value} ${
            this.servicioRadicar.formInfoPersonal.get('apellidos').value
        }\nCédula: ${this.servicioRadicar.formInfoPersonal.get('numeroDocumento').value}\nCelular: ${
            this.servicioRadicar.formInfoPersonal.get('celular').value
        }\nDirección: ${this.servicioRadicar.formApoyoAsistEvento.get('direccionResidencia').value}\n`;

        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        let cursorY = this.servicioPDF.agregarContenidoComun(doc, marcaDeAgua);
        cursorY = this.servicioPDF.agregarAsuntoYSolicitud(doc, cursorY, textAsunto, textSolicitud, marcaDeAgua);

        cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textDatosApoyo,
            startY: cursorY,
            watermark: marcaDeAgua,
        });

        cursorY = this.servicioPDF.agregarDespedida(doc, cursorY, marcaDeAgua);
        cursorY = this.servicioPDF.agregarEspaciosDeFirmas(doc, cursorY, true, true, marcaDeAgua);
        this.servicioPDF.agregarListadoAdjuntos(doc, cursorY, textAdjuntos, marcaDeAgua);

        return doc;
    }
}

export class RespuestaComiteApoyoEconomicoCongresos implements DocumentoPDFStrategy {
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

        const txtAsunto = `Asunto: Respuesta a solicitud ${radicado} de apoyo económico para asistencia a congreso presentando artículos\n`;
        const txtCuerpo = `Reciba un cordial saludo. Por medio de la presente me dirijo a usted con el fin de informar que en sesión del día ${fechaComite[0]} de ${mesEnLetras} de ${fechaComite[2]} el Comité de Programa revisó su solicitud con radicado ${radicado} referente al apoyo económico para asistencia a congreso, decidiendo no avalar la solicitud y emite el siguiente concepto:`;
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

export class OficioConcejoApoyoEconomicoCongresos implements DocumentoPDFStrategy {
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
        const {
            nombreSolicitante,
            apellidoSolicitante,
            numeroIdentSolicitante,
            tipoIdentSolicitante,
            codigoSolicitante,
        } = this.servicioGestor.infoSolicitud.datosComunSolicitud;

        const textCuerpo = `${this.servicioGestor.InfoDecano.tratamiento == 'sr.' ? 'Estimado' : 'Estimada'} ${
            this.servicioGestor.InfoDecano.nombreCompleto.split(' ')[0]
        }, reciba un cordial saludo. Comedidamente me dirijo a usted con el fin de solicitar su colaboración para realizar las gestiones necesarias que permitan conceder apoyo económico solicitado por ${nombreSolicitante.toUpperCase()} ${apellidoSolicitante.toUpperCase()} Cod. ${codigoSolicitante} estudiante del programa de Maestría en Computación, con el fin de participar en el evento de carácter ${
            this.servicioGestor.infoSolicitud.datosApoyoEconomicoCongreso.tipoCongreso
        } "${this.servicioGestor.infoSolicitud.datosApoyoEconomicoCongreso.nombreCongreso}" que se llevará a cabo en ${
            this.servicioGestor.infoSolicitud.datosApoyoEconomicoCongreso.lugarEvento
        }, del ${this.servicioGestor.infoSolicitud.datosApoyoEconomicoCongreso.fechaInicio} al ${
            this.servicioGestor.infoSolicitud.datosApoyoEconomicoCongreso.fechaFin
        }, y donde también se hará la presentación del trabajo titulado "${
            this.servicioGestor.infoSolicitud.datosApoyoEconomicoCongreso.tituloPublicacion
        }".\n\nEl comité de programa, en sesión del día ${fechaComite[0]} de ${mesEnLetras} de ${
            fechaComite[2]
        }, aprobó el apoyo económico por un valor de COP $${this.servicioUtilidades.numeroAMoneda(
            this.servicioGestor.infoSolicitud.datosApoyoEconomicoCongreso.valorApoyo
        )} para cubrir los gastos de desplazamiento y participación en el evento.\n\nSe solicita que el apoyo económico sea consignado directamente en la cuenta bancaria proporcionada.\n`;

        const textDatosApoyo = `Valor apoyo económico: COP $${this.servicioUtilidades.numeroAMoneda(
            this.servicioGestor.infoSolicitud.datosApoyoEconomicoCongreso.valorApoyo
        )}\nEntidad Bancaria: ${
            this.servicioGestor.infoSolicitud.datosApoyoEconomicoCongreso.entidadBancaria
        }\nTipo de Cuenta: ${
            this.servicioGestor.infoSolicitud.datosApoyoEconomicoCongreso.tipoCuenta
        }\nNúmero de Cuenta: ${this.servicioGestor.infoSolicitud.datosApoyoEconomicoCongreso.numeroCuenta}\nTitular: ${
            this.servicioGestor.infoSolicitud.datosComunSolicitud.nombreSolicitante
        } ${this.servicioGestor.infoSolicitud.datosComunSolicitud.apellidoSolicitante}\nCédula: ${
            this.servicioGestor.infoSolicitud.datosComunSolicitud.numeroIdentSolicitante
        }\nCelular: ${this.servicioGestor.infoSolicitud.datosComunSolicitud.celularSolicitante}\nCorreo Electrónico: ${
            this.servicioGestor.infoSolicitud.datosComunSolicitud.emailSolicitante
        }\nDirección de Residencia: ${this.servicioGestor.infoSolicitud.datosApoyoEconomicoCongreso.direccionResidencia}
        `;

        const txtRemitente = `${this.servicioGestor.InfoCoordinador.nombreCompleto.toUpperCase()}\n${
            this.servicioGestor.InfoCoordinador.tratamiento == 'sr.' ? 'Coordinador' : 'Coordinadora'
        } Maestría en Computación`;

        const textAsunto = `Asunto: Solicitud de apoyo económico para asistencia a evento y presentación de artículo de estudiante ${nombreSolicitante} ${apellidoSolicitante}\n`;

        let posicionY = this.servicioPDF.agregarContenidoComun(documento, marcaDeAgua, 'consejo');
        posicionY = this.servicioPDF.agregarAsuntoYSolicitud(documento, posicionY, textAsunto, textCuerpo, marcaDeAgua);
        posicionY = this.servicioPDF.agregarTexto(documento, {
            text: textDatosApoyo,
            startY: posicionY,
            watermark: marcaDeAgua,
        });

        posicionY = this.servicioPDF.agregarDespedida(documento, posicionY + 5, marcaDeAgua);
        posicionY = this.servicioPDF.agregarTexto(documento, {
            text: txtRemitente,
            startY: posicionY + 10,
            watermark: marcaDeAgua,
        });

        return documento;
    }
}

export class RespuestaConcejoApoyoEconomicoCongresos implements DocumentoPDFStrategy {
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

        const txtAsunto = `Asunto: Respuesta a Solicitud ${radicado} de apoyo económico para asistencia a congreso presentando artículos\n`;
        const txtCuerpo = `Reciba un cordial saludo. Me dirijo a usted para informar que el día ${
            fechaConcejo[0]
        } de ${mesEnLetras} de ${
            fechaConcejo[2]
        }, se recibió respuesta del Consejo de Facultad referente a su solicitud ${radicado} de apoyo económico. ${
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
