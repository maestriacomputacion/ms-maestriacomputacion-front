import { DocumentoPDFStrategy } from "../../../models/documentos/documento-pdf-strategy.model";
import { RadicarService } from "../../../services/radicar.service";
import { PdfService } from '../../../services/pdf.service';
import { GestorService } from "../../../services/gestor.service";
import { UtilidadesService } from "../../../services/utilidades.service";
import jsPDF from 'jspdf';
import { PDFDocument } from 'pdf-lib';

export class SolicitudRegistroVoto implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });
        const asunto = `Asunto: Solicitud Registro certificado de votación`;
        const cuerpoSolicitud = ``;
        const datosRemitente =`${this.servicioRadicar.formInfoPersonal.get('nombres').value} ${this.servicioRadicar.formInfoPersonal.get('apellidos').value} \nCódigo Academico: ${this.servicioRadicar.formInfoPersonal.get('codigoAcademico').value} \nPrograma: Maestría en computación`;
        
        let cursorY = this.servicioPDF.agregarContenidoComun(documento, marcaDeAgua, 'coordinador');
        cursorY = this.servicioPDF.agregarAsuntoYSolicitud(documento, cursorY, asunto, cuerpoSolicitud, marcaDeAgua);
        cursorY = this.servicioPDF.agregarTexto(documento, { text: datosRemitente, startY: cursorY+1, alignment: 'left' });
        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        // Añadir adjuntos
        cursorY = this.servicioPDF.agregarListadoAdjuntos(documento, cursorY, textAdjuntos, marcaDeAgua);
        
        return documento;
    }
}