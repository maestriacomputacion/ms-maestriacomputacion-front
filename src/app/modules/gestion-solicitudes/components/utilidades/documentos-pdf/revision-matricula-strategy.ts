import jsPDF from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { GestorService } from '../../../services/gestor.service';
import { UtilidadesService } from '../../../services/utilidades.service';

// Estrategia para la carta de solicitud de revisión de matrícula
export class SolicitudRevisionMatricula implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });
        const asunto = `Asunto: Solicitud de Revisión de Matrícula\n`;
        const cuerpoSolicitud = `${this.servicioRadicar.formRevisionMatricula.get('solicitudRevision').value}`;

        let cursorY = this.servicioPDF.agregarContenidoComun(documento, marcaDeAgua, 'coordinador');
        cursorY = this.servicioPDF.agregarAsuntoYSolicitud(documento, cursorY, asunto, cuerpoSolicitud, marcaDeAgua);
        cursorY = this.servicioPDF.agregarEspaciosDeFirmas(
            documento,
            cursorY,
            false, // No requiere director
            false, // No requiere tutor
            marcaDeAgua
        );

        return documento;
    }
}
