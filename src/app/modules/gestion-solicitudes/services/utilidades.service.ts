import { Injectable } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PDFDocument } from 'pdf-lib';


@Injectable({
    providedIn: 'root',
})
export class UtilidadesService {
    constructor(private sanitizer: DomSanitizer, private primengConfig: PrimeNGConfig) {}

    // Configura el idioma del calendario al español en PrimeNG.
    configurarIdiomaCalendario(): void {
        this.primengConfig.setTranslation({
            dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
            dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
            dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
            monthNames: [
                'enero',
                'febrero',
                'marzo',
                'abril',
                'mayo',
                'junio',
                'julio',
                'agosto',
                'septiembre',
                'octubre',
                'noviembre',
                'diciembre',
            ],
            monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
            today: 'Hoy',
            clear: 'Limpiar',
            dateFormat: 'dd/mm/yy',
            weekHeader: 'Sm',
        });
    }

    // Convierte un archivo a una cadena en Base64, incluyendo su nombre.
    async convertirFileABase64(archivo: File | null): Promise<string | null> {
        if (!archivo) return null;

        return new Promise((resolve, reject) => {
            const lector = new FileReader();
            lector.onload = () => {
                const resultado = lector.result as string;
                const contenidoBase64 = resultado.split(',')[1];
                resolve(`${archivo.name}:${contenidoBase64}`);
            };
            lector.onerror = () => reject(null);
            lector.readAsDataURL(archivo);
        });
    }

    // Convierte una cadena en Base64 de formato "nombre:contenido" a un archivo.
    convertirBase64AFile(base64String: string): File | null {
        const [nombre, contenidoBase64] = base64String.split(':');
        if (!nombre || !contenidoBase64) return null;

        const binaryData = window.atob(contenidoBase64);
        const bytes = Uint8Array.from(binaryData, (char) => char.charCodeAt(0));
        return new File([bytes], nombre);
    }

    // Crea una URL segura para visualizar un archivo PDF en el navegador.
    crearUrlSeguroParaPDF(documento: File): SafeResourceUrl {
        const blob = new Blob([documento], { type: 'application/pdf' });
        return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
    }

    // Abre un enlace en una nueva pestaña del navegador.
    abrirEnlaceExterno(enlace: string): void {
        const enlaceCompleto = enlace.startsWith('http') ? enlace : `http://${enlace}`;
        window.open(enlaceCompleto, '_blank');
    }

    // Extrae una fecha específica de un rango de fechas y la formatea.
    extraerFechaDeRange(campoFechas: Date[], posicionFecha: number, separador: string, orden: number): string {
        const fecha = campoFechas[posicionFecha];
        const [dia, mes, anio] = [
            fecha.getDate().toString().padStart(2, '0'),
            (fecha.getMonth() + 1).toString().padStart(2, '0'),
            fecha.getFullYear(),
        ];

        return orden === 0
            ? `${dia}${separador}${mes}${separador}${anio}`
            : `${anio}${separador}${mes}${separador}${dia}`;
    }

    // Formatea un rango de fechas en el formato "dd/mm/aaaa al dd/mm/aaaa".
    describirRangoFechas(fechaInicio: Date, fechaFin: Date): string {
        const formato = (fecha: Date) => `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
        return `${formato(fechaInicio)} al ${formato(fechaFin)}`;
    }

    // Obtiene el nombre de un mes en español a partir de su número (1-12).
    obtenerMesEnLetras(mes: number): string {
        const meses = [
            'enero',
            'febrero',
            'marzo',
            'abril',
            'mayo',
            'junio',
            'julio',
            'agosto',
            'septiembre',
            'octubre',
            'noviembre',
            'diciembre',
        ];
        return meses[mes - 1];
    }

    // Valida que una URL cumpla con el formato HTTPS y no contenga patrones sospechosos.
    validarUrlSegura(enlace: string): boolean {
        const URL_REGEX = /^https:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/;
        return URL_REGEX.test(enlace);
    }

    // Convierte un valor numérico en formato de moneda, con separadores y dos decimales.
    numeroAMoneda(value: string | number): string {
        const numberValue = parseFloat(value as string);
        return isNaN(numberValue)
            ? '0,00'
            : numberValue.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Función para combinar PDFs
    async combinarPDFs(
        archivoPrincipal: File,
        otrosArchivos: File[]
    ): Promise<File | null> {
        try {
            // Leer el archivo principal
            const principalBytes = await archivoPrincipal.arrayBuffer();
            const principalPDF = await PDFDocument.load(principalBytes);

            // Iterar sobre los otros archivos y fusionarlos
            for (const archivo of otrosArchivos) {
                const archivoBytes = await archivo.arrayBuffer();
                const otroPDF = await PDFDocument.load(archivoBytes);
                const paginas = await principalPDF.copyPages(
                    otroPDF,
                    otroPDF.getPageIndices()
                );
                paginas.forEach((pagina) => principalPDF.addPage(pagina));
            }

            // Guardar el PDF combinado como un array de bytes
            const pdfBytes = await principalPDF.save();
            const nuevoPDF = new File([pdfBytes], 'archivo_combinado.pdf', {
                type: 'application/pdf',
            });

            return nuevoPDF;
        } catch (error) {
            console.error('Error combinando PDFs:', error);
            return null;
        }
    }
}
