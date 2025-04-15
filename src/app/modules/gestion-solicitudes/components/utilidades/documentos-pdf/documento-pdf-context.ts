import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import jsPDF from 'jspdf';

export class DocumentoPDFContext {
    private strategy: DocumentoPDFStrategy;

    setStrategy(strategy: DocumentoPDFStrategy) {
        this.strategy = strategy;
    }

    generarPDF(marcaDeAgua: boolean): jsPDF {
        return this.strategy.generarDocumento(marcaDeAgua);
    }
}
