import jsPDF from 'jspdf';

export interface DocumentoPDFStrategy {
    generarDocumento(marcaDeAgua: boolean): jsPDF;
}
