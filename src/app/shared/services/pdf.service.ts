import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

@Injectable({
    providedIn: 'root',
})
export class PdfService {
    constructor() {
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
    }

    getStyles() {
        return {
            flexContainer: {
                columnGap: 10,
                margin: [0, 5, 0, 5],
            },
            titleLeft: {
                alignment: 'left',
                fontSize: 16,
                width: '60%',
                color: '#3e5270',
            },
            imageRight: {
                alignment: 'center',
                width: '40%',
                color: '#3e5270',
            },
            labelStyle: {
                alignment: 'left',
                margin: [0, 5, 0, 5],
            },
            contentStyle: {
                alignment: 'left',
                margin: [0, 5, 0, 5],
            },
            leftAlignment: {
                alignment: 'left',
                margin: [0, 10, 0, 10],
            },
            rightAlignment: {
                alignment: 'right',
                margin: [0, 10, 0, 10],
            },
            centerAlignment: {
                alignment: 'center',
                bold: true,
                margin: [0, 10, 0, 10],
            },
        };
    }

    async generatePDF(htmlContent: any, htmlNextContent: any): Promise<Blob> {
        const content = await this.extractContentFromElement(htmlContent);
        const nextContent = await this.extractContentFromElement(
            htmlNextContent
        );
        const footerContent = await this.extractFooterFromElement(htmlContent);
        const docDefinition = {
            pageSize: 'A4',
            styles: this.getStyles(),
            pageMargins: [30, 40, 30, 40],
            content: [
                ...content,
                nextContent ? { text: '', pageBreak: 'after' } : null,
                nextContent ? [...nextContent] : null,
            ],
            footer: () => {
                return {
                    columns: footerContent,
                    style: 'flexContainer',
                    margin: [30, -60, 30, 0],
                };
            },
            defaultStyle: {
                font: 'Roboto',
            },
        };

        return new Promise((resolve, reject) => {
            pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
                resolve(blob);
            });
        });
    }

    async extractFooterFromElement(element: any) {
        const content = [];
        await this.extractFooterContent(element, content);
        return content;
    }

    async extractContentFromElement(element: any) {
        if (element != null) {
            const content = [];
            await this.extractNodeContent(element, content);
            return content;
        }
        return null;
    }

    async extractFooterContent(node: any, content: any) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            if (
                node.classList.contains('footer-content') ||
                node.classList.contains('footer-text')
            ) {
                const bodyFooterContent = [];
                for (let child of node.childNodes) {
                    if (child.tagName === 'IMG') {
                        const imgData = await this.convertImageToDataURL(
                            child.src
                        );
                        bodyFooterContent.push({
                            image: imgData,
                            width: 120,
                            style: 'titleLeft',
                            opacity: 0.6,
                        });
                    } else if (
                        child.nodeType === Node.ELEMENT_NODE &&
                        child.tagName === 'DIV'
                    ) {
                        const divContent = [];
                        for (let divChild of child.childNodes) {
                            if (
                                divChild.nodeType === Node.ELEMENT_NODE &&
                                divChild.tagName === 'SPAN'
                            ) {
                                divContent.push({
                                    text: ' ' + divChild.textContent.trim(),
                                    alignment: 'center',
                                    color: '#3e5270',
                                    margin: [0, 0, 0, 5],
                                    decoration: 'underline',
                                    decorationStyle: 'solid',
                                    decorationColor: '#ff0000',
                                    lineHeight: 1.6,
                                    opacity: 0.6,
                                    italics: true,
                                });
                            } else if (
                                divChild.nodeType === Node.ELEMENT_NODE &&
                                divChild.tagName === 'STRONG'
                            ) {
                                divContent.push({
                                    text: ' ' + divChild.textContent.trim(),
                                    alignment: 'center',
                                    color: '#3e5270',
                                    margin: [0, 0, 0, 5],
                                    opacity: 0.6,
                                });
                            }
                        }
                        bodyFooterContent.push({
                            stack: divContent,
                            alignment: 'center',
                            width: '80%',
                        });
                    }
                }
                content.push({
                    columns: bodyFooterContent,
                });
            } else {
                for (let child of node.childNodes) {
                    await this.extractFooterContent(child, content);
                }
            }
        }
    }

    async extractNodeContent(node: any, content: any) {
        if (
            node.nodeType === Node.ELEMENT_NODE &&
            node.classList.contains('p-hide')
        ) {
            return;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'P') {
                content.push({
                    text: node.innerText.trim(),
                    margin: [0, 10, 0, 10],
                });
            }

            if (node.classList.contains('title-head')) {
                const tituloContent = [];

                for (let child of node.childNodes) {
                    if (
                        child.nodeType === Node.ELEMENT_NODE &&
                        child.tagName === 'SPAN'
                    ) {
                        tituloContent.push({
                            text: child.textContent.trim(),
                            style: 'centerAlignment',
                        });
                    }
                }

                content.push(...tituloContent);
            }

            if (node.classList.contains('field-content')) {
                const bodyFieldContent = [];
                for (let child of node.childNodes) {
                    if (
                        child.nodeType === Node.ELEMENT_NODE &&
                        child.tagName === 'LABEL'
                    ) {
                        bodyFieldContent.push({
                            text: child.innerText.trim(),
                            style: 'labelStyle',
                            width: '20%',
                        });
                    } else if (
                        child.nodeType === Node.ELEMENT_NODE &&
                        child.tagName === 'SPAN'
                    ) {
                        bodyFieldContent.push({
                            text: child.innerText.trim(),
                            style: 'contentStyle',
                            width: '50%',
                        });
                    } else if (
                        child.nodeType === Node.ELEMENT_NODE &&
                        child.tagName === 'UL'
                    ) {
                        bodyFieldContent.push({
                            text: child.innerText.trim(),
                            style: 'contentStyle',
                            width: '20%',
                        });
                    }
                }
                content.push({
                    columns: bodyFieldContent,
                    style: 'flexContainer',
                });
            }

            if (node.classList.contains('field-firma')) {
                const bodyImageContent = [];

                for (let child of node.childNodes) {
                    if (
                        child.nodeType === Node.ELEMENT_NODE &&
                        child.tagName === 'SPAN'
                    ) {
                        bodyImageContent.push({
                            text: ' ' + child.textContent.trim(),
                            style: 'leftAlignment',
                            width: '25%',
                        });
                    } else if (
                        child.nodeType === Node.ELEMENT_NODE &&
                        child.tagName === 'HR'
                    ) {
                        bodyImageContent.push({
                            canvas: [
                                {
                                    type: 'line',
                                    x1: 0,
                                    y1: 0,
                                    x2: 200,
                                    y2: 0,
                                    lineWidth: 1,
                                    color: '#000',
                                },
                            ],
                            alignment: 'left',
                            display: 'inline',
                            margin: [20, 35, 0, 5],
                        });
                    }
                }

                if (bodyImageContent.length > 0) {
                    content.push({
                        columns: bodyImageContent,
                        columnGap: 5,
                    });
                }
            }

            if (node.classList.contains('field-estudiante')) {
                const estudianteImageContent = [];

                for (let child of node.childNodes) {
                    if (
                        child.nodeType === Node.ELEMENT_NODE &&
                        child.tagName === 'B'
                    ) {
                        estudianteImageContent.push({
                            text: ' ' + child.textContent.trim(),
                        });
                    } else if (child.tagName === 'IMG') {
                        const imgData = await this.convertImageToDataURL(
                            child.src
                        );
                        estudianteImageContent.push({
                            image: imgData,
                            width: 120,
                            alignment: 'left',
                        });
                    }
                }
                content.push(...estudianteImageContent);
            }

            if (node.classList.contains('info-table')) {
                const tableBody = [];
                const rows = node.querySelectorAll('tr');
                const widths = [];
                for (let i = 0; i < rows[0].cells.length; i++) {
                    const cell = rows[0].cells[i];
                    widths[i] =
                        cell.style.width !== ''
                            ? cell.style.width
                            : `${cell.offsetWidth}px`;
                }
                rows.forEach((row) => {
                    const rowData = [];
                    const cells = row.querySelectorAll('td, th');
                    cells.forEach((cell) => {
                        rowData.push({
                            text: cell.innerText.trim(),
                            bold: cell.tagName === 'TH',
                            fillColor:
                                cell.tagName === 'TH' ? '#E0E0E0' : '#FFFFFF',
                        });
                    });
                    tableBody.push(rowData);
                });

                // Verifica si 'widths' tiene algún valor undefined y reemplace por un valor por defecto.
                for (let i = 0; i < widths.length; i++) {
                    if (widths[i] === undefined) {
                        widths[i] = 'auto';
                    }
                }

                content.push({
                    table: {
                        headerRows: 1,
                        widths: widths,
                        body: tableBody,
                    },
                    margin: [0, 2, 0, 20],
                });
            }

            if (node.classList.contains('header-logo')) {
                const headerContent = [];

                for (let child of node.childNodes) {
                    if (
                        child.nodeType === Node.ELEMENT_NODE &&
                        child.tagName === 'DIV'
                    ) {
                        const divContent = [];
                        for (let divChild of child.childNodes) {
                            if (
                                divChild.nodeType === Node.ELEMENT_NODE &&
                                divChild.tagName === 'H2'
                            ) {
                                divContent.push({
                                    text: divChild.textContent.trim(),
                                    width: '100%',
                                    margin: [0, 2, 0, 2],
                                    opacity: 0.6,
                                });
                            }
                        }

                        if (divContent.length > 0) {
                            headerContent.push({
                                stack: divContent,
                                style: 'titleLeft',
                            });
                        }
                    } else if (
                        child.nodeType === Node.ELEMENT_NODE &&
                        child.tagName === 'IMG'
                    ) {
                        const imgData = await this.convertImageToDataURL(
                            child.src
                        );
                        headerContent.push({
                            image: imgData,
                            width: 80,
                            style: 'imageRight',
                            opacity: 0.6,
                        });
                    }
                }

                content.push({
                    columns: headerContent,
                    style: 'flexContainer',
                });
            }

            if (node.hasChildNodes()) {
                for (let child of node.childNodes) {
                    await this.extractNodeContent(child, content);
                }
            }
        }
    }

    convertImageToDataURL(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = (err) => reject(err);
            img.src = url;
        });
    }
}
