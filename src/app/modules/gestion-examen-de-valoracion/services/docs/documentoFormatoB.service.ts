import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as PizZip from 'pizzip';
import * as JSZipUtils from 'pizzip/utils/index.js';
import * as Docxtemplater from 'docxtemplater';
import { Observable, catchError, of } from 'rxjs';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({
    providedIn: 'root',
})
export class DocumentoFormatoBService {
    logoFacultad: string;
    logoIcontec: string;
    assetHeader: string;
    assetCalidad: string;

    constructor() {
        var assetHeader = new Image();
        assetHeader.src = 'assets/layout/images/motivoencabezado.png';
        assetHeader.onload = () => {
            this.assetHeader = this.getBase64Image(assetHeader);
        };

        var logoFacultad = new Image();
        logoFacultad.src = 'assets/layout/images/logoFacultad.png';
        logoFacultad.onload = () => {
            this.logoFacultad = this.getBase64Image(logoFacultad);
        };

        var assetCalidad = new Image();
        assetCalidad.src = 'assets/layout/images/acreditacion.png';
        assetCalidad.onload = () => {
            this.assetCalidad = this.getBase64Image(assetCalidad);
        };

        var logoIcontec = new Image();
        logoIcontec.src = 'assets/layout/images/logosIcontec.png';
        logoIcontec.onload = () => {
            this.logoIcontec = this.getBase64Image(logoIcontec);
        };
    }

    private getBase64Image(img: HTMLImageElement): string {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL('image/png');
    }

    public generateDocuments(
        formValues: any,
        estudiante: any,
        evaluadorInterno: any,
        evaluadorExterno: any
    ): Observable<any> {
        const docData: any = {
            fecha: this.getFormattedDate(),
            programa: formValues.programa,
            estudiante: `${estudiante.nombre} ${estudiante.apellido}`,
            titulo: formValues.titulo,
            juradoInterno: `${evaluadorInterno.nombres}, ${evaluadorInterno.correo}, ${evaluadorInterno.universidad}`,
            juradoInternoFirma: `${evaluadorInterno.nombres}, ${evaluadorInterno.universidad}`,
            juradoExterno: `${evaluadorExterno.nombres}, ${evaluadorExterno.correo}, ${evaluadorExterno.universidad}`,
            juradoExternoFirma: `${evaluadorExterno.nombres}, ${evaluadorExterno.universidad}`,
        };

        return new Observable((observer) => {
            this.loadFile(
                'assets/docs/formatoB.docx',
                (error: any, content: any) => {
                    if (error) {
                        observer.error(error);
                        return;
                    }

                    const zip = new PizZip(content);
                    const doc = new Docxtemplater(zip, {
                        paragraphLoop: true,
                        linebreaks: true,
                    });

                    doc.setData(docData);

                    try {
                        doc.render();
                    } catch (error) {
                        observer.error(error);
                        return;
                    }

                    const fileDoc = doc.getZip().generate({
                        type: 'blob',
                        mimeType:
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    });

                    const docDefinition = this.generateDocDefinition(
                        formValues,
                        estudiante,
                        evaluadorInterno,
                        evaluadorExterno
                    );

                    pdfMake
                        .createPdf(docDefinition)
                        .getBlob((pdfBlob: Blob) => {
                            const filePdf = new File(
                                [pdfBlob],
                                `${estudiante.codigo} - formatoB.pdf`,
                                {
                                    type: 'application/pdf',
                                }
                            );
                            observer.next({
                                docFormatoB: fileDoc,
                                pdfFormatoB: filePdf,
                            });
                            observer.complete();
                        });
                }
            );
        }).pipe(
            catchError((error) => {
                console.error('Error en la generación de documentos', error);
                return of({ doc: null, pdf: null });
            })
        );
    }

    private loadFile(
        url: string,
        callback: (error: any, content: any) => void
    ) {
        JSZipUtils.default.getBinaryContent(url, callback);
    }

    private getFormattedDate(): string {
        const rawDate = new Date();
        const day = rawDate.getDate();
        const month = rawDate.toLocaleString('default', { month: 'short' });
        const year = rawDate.getFullYear();
        return `${day} de ${month} de ${year}`;
    }

    private generateDocDefinition(
        formValues: any,
        estudiante: any,
        evaluadorInterno: any,
        evaluadorExterno: any
    ) {
        return {
            content: [
                {
                    image: this.assetHeader,
                    width: 600,
                    height: 20,
                    margin: [0, -40, 0, 0],
                    alignment: 'center',
                    opacity: 0.6,
                },
                {
                    image: this.logoFacultad,
                    width: 180,
                    height: 90,
                    margin: [0, 10, 0, 20],
                    alignment: 'left',
                    opacity: 0.6,
                },
                {
                    text: 'FORMATO B',
                    style: 'header',
                    alignment: 'center',
                },
                {
                    text: `ACTA DE EXAMEN DE VALORACIÓN`,
                    style: 'subheader',
                    alignment: 'center',
                },
                {
                    text: `Popayán, ${this.getFormattedDate()}`,
                    style: 'subheader',
                    alignment: 'center',
                },
                {
                    columns: [
                        { text: 'Programa:', style: 'label', width: '25%' },
                        {
                            text: formValues.programa,
                            style: 'value',
                            width: '75%',
                        },
                    ],
                    margin: [0, 10, 0, 10],
                },
                {
                    columns: [
                        { text: 'Titulo:', style: 'label', width: '25%' },
                        {
                            text: formValues.titulo,
                            style: 'value',
                            width: '75%',
                        },
                    ],
                    margin: [0, 10, 0, 10],
                },
                {
                    columns: [
                        { text: 'Estudiante:', style: 'label', width: '25%' },
                        {
                            text: estudiante.nombre + ' ' + estudiante.apellido,
                            style: 'value',
                            width: '75%',
                        },
                    ],
                    margin: [0, 10, 0, 10],
                },
                {
                    columns: [
                        { text: 'Jurados:', style: 'label', width: '25%' },
                        {
                            stack: [
                                {
                                    text:
                                        evaluadorInterno.nombres +
                                        ', ' +
                                        evaluadorInterno.universidad +
                                        ', ' +
                                        evaluadorInterno.correo,
                                    style: 'value',
                                },
                                {
                                    text:
                                        evaluadorExterno.nombres +
                                        ', ' +
                                        evaluadorExterno.universidad +
                                        ', ' +
                                        evaluadorExterno.correo,
                                    style: 'value',
                                },
                            ],
                        },
                    ],
                    margin: [0, 10, 0, 10],
                },
                {
                    columns: [
                        { text: 'Fecha:', style: 'label', width: '25%' },
                        {
                            text: this.getFormattedDate(),
                            style: 'value',
                            width: '75%',
                        },
                    ],
                    margin: [0, 10, 0, 10],
                },
                {
                    columns: [
                        {
                            text: 'Concepto del Jurado:',
                            style: 'label',
                            width: '25%',
                        },
                        {
                            stack: [
                                {
                                    text: 'Aprobado',
                                    style: 'value',
                                    width: '75%',
                                },
                                {
                                    text: 'Aplazado',
                                    style: 'value',
                                    width: '75%',
                                },
                                {
                                    text: 'No Aprobado',
                                    style: 'value',
                                    width: '75%',
                                },
                            ],
                        },
                    ],
                    margin: [0, 10, 0, 20],
                },
                {
                    columns: [
                        {
                            text: 'Firman',
                            style: 'value',
                            width: '100%',
                        },
                    ],
                },
                {
                    columns: [
                        {
                            text:
                                evaluadorInterno.nombres +
                                ', ' +
                                evaluadorInterno.universidad,
                            style: 'value',
                            width: '30%',
                            margin: [0, 0, 10, 0],
                        },
                        {
                            canvas: [
                                {
                                    type: 'line',
                                    x1: 0,
                                    y1: 20,
                                    x2: 200,
                                    y2: 20,
                                    lineWidth: 1,
                                },
                            ],
                        },
                    ],
                    margin: [0, 20, 0, 0],
                },
                {
                    columns: [
                        {
                            text:
                                evaluadorExterno.nombres +
                                ', ' +
                                evaluadorExterno.universidad,
                            style: 'value',
                            width: '30%',
                            margin: [0, 0, 10, 0],
                        },
                        {
                            canvas: [
                                {
                                    type: 'line',
                                    x1: 0,
                                    y1: 20,
                                    x2: 200,
                                    y2: 20,
                                    lineWidth: 1,
                                },
                            ],
                        },
                    ],
                    margin: [0, 20, 0, 0],
                },
            ],
            footer: (currentPage, pageCount) => {
                return {
                    columns: [
                        {
                            stack: [
                                {
                                    image: this.assetCalidad,
                                    width: 100,
                                    height: 80,
                                    alignment: 'left',
                                    opacity: 0.6,
                                },
                            ],
                            width: 'auto',
                        },
                        {
                            stack: [
                                {
                                    text: 'Carrera 2 No. 15N esquina-Sector Tulcán\nPopayán-Cauca-Colombia\nTeléfono: 6028209800 ext. 2100 ó 2101\ndecafiet&#64;unicauca.edu.co | www.unicauca.edu.co',
                                    alignment: 'center',
                                    fontSize: 8,
                                    color: '#1f497d',
                                    opacity: 0.6,
                                    margin: [-40, 20, 0, 0],
                                },
                            ],
                            width: '*',
                            alignment: 'center',
                        },
                        {
                            stack: [
                                {
                                    image: this.logoIcontec,
                                    width: 70,
                                    height: 40,
                                    alignment: 'right',
                                    opacity: 0.6,
                                    margin: [0, 20, 40, 0],
                                },
                            ],
                            width: 'auto',
                        },
                    ],
                    margin: [40, -60, 0, 0],
                };
            },
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10],
                },
                subheader: {
                    fontSize: 12,
                    bold: true,
                    margin: [0, 0, 0, 10],
                },
                label: {
                    fontSize: 12,
                    bold: true,
                    margin: [0, 10, 0, 2],
                },
                value: {
                    fontSize: 12,
                    margin: [0, 10, 0, 0],
                },
            },
        };
    }
}
