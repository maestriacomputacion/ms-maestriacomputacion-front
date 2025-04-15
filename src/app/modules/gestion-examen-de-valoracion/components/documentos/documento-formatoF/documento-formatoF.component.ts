import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subscription, firstValueFrom } from 'rxjs';
import { Mensaje } from 'src/app/core/enums/enums';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { TrabajoDeGradoService } from '../../../services/trabajoDeGrado.service';
import { ResolucionService } from '../../../services/resolucion.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'documento-formatoF',
    templateUrl: 'documento-formatoF.component.html',
    styleUrls: ['documento-formatoF.component.scss'],
})
export class DocumentoFormatoFComponent implements OnInit {
    @Input() trabajoDeGradoId: number;
    @Input() juradoExternoSeleccionado: any;
    @Input() juradoInternoSeleccionado: any;
    @Output() formReady = new EventEmitter<FormGroup>();
    @Output() formatoFPdfGenerated = new EventEmitter<File>();

    @ViewChild('formatoF') formatoF!: ElementRef;

    private estudianteSubscription: Subscription;
    private tituloSubscription: Subscription;

    formatoFForm: FormGroup;

    loading: boolean = false;

    estudianteSeleccionado: any;

    fechaActual: Date;

    firmaDirector: string;
    logoFacultad: string;
    logoIcontec: string;
    assetHeader: string;
    assetCalidad: string;

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private trabajoDeGradoService: TrabajoDeGradoService,
        private resolucionService: ResolucionService
    ) {}

    get titulo(): FormControl {
        return this.formatoFForm.get('titulo') as FormControl;
    }

    get estudiante(): FormControl {
        return this.formatoFForm.get('estudiante') as FormControl;
    }

    get director(): FormControl {
        return this.formatoFForm.get('director') as FormControl;
    }

    async loadDirector() {
        try {
            const response = await firstValueFrom(
                this.resolucionService.getResolucionDocente(
                    this.trabajoDeGradoId
                )
            );
            if (response) {
                this.director.setValue(response.director.nombres);
            }
        } catch (error) {
            console.error('Error al obtener el director:', error);
        }
    }

    ngOnInit() {
        this.initForm();
        this.fechaActual = new Date();

        this.tituloSubscription =
            this.trabajoDeGradoService.tituloSeleccionadoSubject$.subscribe({
                next: (response) => {
                    if (response) {
                        this.titulo.setValue(response);
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });

        this.estudianteSubscription =
            this.trabajoDeGradoService.estudianteSeleccionado$.subscribe({
                next: (response) => {
                    if (response) {
                        this.estudianteSeleccionado = response;
                        this.estudiante.setValue(
                            this.nombreCompletoEstudiante(response)
                        );
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });

        if (this.trabajoDeGradoId) {
            this.loadDirector();
        }
    }

    initForm(): void {
        this.formatoFForm = this.fb.group({
            titulo: [null, Validators.required],
            estudiante: [null, Validators.required],
            director: [null, Validators.required],
            trabajoCumpleSi: [false, Validators.required],
            trabajoCumpleNo: [false, Validators.required],
            documentoTerminadoNo: [false, Validators.required],
            documentoTerminadoSi: [false, Validators.required],
            observaciones: [null],
            firmaDirector: [null, Validators.required],
        });

        this.formReady.emit(this.formatoFForm);

        var assetHeader = new Image();
        assetHeader.src = 'assets/layout/images/asset-header.jpg';
        assetHeader.onload = () => {
            this.assetHeader = this.getBase64Image(assetHeader);
        };

        var logoFacultad = new Image();
        logoFacultad.src = 'assets/layout/images/logoFacultad.png';
        logoFacultad.onload = () => {
            this.logoFacultad = this.getBase64Image(logoFacultad);
        };

        var assetCalidad = new Image();
        assetCalidad.src = 'assets/layout/images/asset-calidad.png';
        assetCalidad.onload = () => {
            this.assetCalidad = this.getBase64Image(assetCalidad);
        };

        var logoIcontec = new Image();
        logoIcontec.src = 'assets/layout/images/logosIcontec.png';
        logoIcontec.onload = () => {
            this.logoIcontec = this.getBase64Image(logoIcontec);
        };
        this.initValueChangeHandlers();
    }

    initValueChangeHandlers(): void {
        this.addToggleHandler('trabajoCumpleSi', 'trabajoCumpleNo');
        this.addToggleHandler('trabajoCumpleNo', 'trabajoCumpleSi');
        this.addToggleHandler('documentoTerminadoSi', 'documentoTerminadoNo');
        this.addToggleHandler('documentoTerminadoNo', 'documentoTerminadoSi');
    }

    addToggleHandler(controlName: string, oppositeControlName: string): void {
        this.formatoFForm.get(controlName).valueChanges.subscribe({
            next: (response) => {
                if (typeof response === 'boolean') {
                    const oppositeControl =
                        this.formatoFForm.get(oppositeControlName);
                    if (response) {
                        oppositeControl.disable({ emitEvent: false });
                    } else {
                        oppositeControl.enable({ emitEvent: false });
                    }
                }
            },
        });
    }

    getBase64Image(img: HTMLImageElement) {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL('image/png');
    }

    ngOnDestroy() {
        if (this.tituloSubscription) {
            this.tituloSubscription.unsubscribe();
        }
        if (this.estudianteSubscription) {
            this.estudianteSubscription.unsubscribe();
        }
    }

    onFirmaChange(event: any, fieldName: string) {
        const input = event && event.files ? event : { files: [] };
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (fieldName === 'firmaDirector') {
                    this.firmaDirector = reader.result as string;
                }
            };
            reader.readAsDataURL(file);
            const patchObject = {};
            patchObject[fieldName] = file;
            this.formatoFForm.patchValue(patchObject);
        }
    }

    generateDocDefinition() {
        const formValues = this.formatoFForm.value;
        const fechaActual = new Date().toLocaleDateString();

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
                    text: 'TESIS DE POSGRADO',
                    style: 'subheader',
                    alignment: 'center',
                },
                {
                    columns: [
                        { text: 'FORMATO F:', style: 'label', width: '25%' },
                        {
                            text: 'REMISION DEL DOCUMENTO FINAL AL COMITÉ DE PROGRAMA POR EL DIRECTOR RESPECTIVO',
                            style: 'value',
                            width: '75%',
                        },
                    ],
                },
                {
                    columns: [
                        { text: 'TITULO:', style: 'label', width: '25%' },
                        {
                            text: formValues.titulo,
                            style: 'value',
                            width: '75%',
                        },
                    ],
                },
                {
                    columns: [
                        { text: 'ESTUDIANTE:', style: 'label', width: '25%' },
                        {
                            text: formValues.estudiante,
                            style: 'value',
                            width: '75%',
                        },
                    ],
                },
                {
                    columns: [
                        { text: 'DIRECTOR:', style: 'label', width: '25%' },
                        {
                            text: formValues.director,
                            style: 'value',
                            width: '75%',
                        },
                    ],
                    margin: [0, 0, 0, 20],
                },
                {
                    text: 'A) EL TRABAJO CUMPLE CON LAS CONDICIONES DE ENTREGA? SI (  ) NO (  )',
                    style: 'label',
                },
                {
                    columns: [
                        { text: 'SI', style: 'value', width: '10%' },
                        {
                            text: formValues.trabajoCumpleSi ? '( X )' : '(  )',
                            style: 'value',
                            width: '10%',
                        },
                        { text: 'NO', style: 'value', width: '10%' },
                        {
                            text: formValues.trabajoCumpleNo ? '( X )' : '(  )',
                            style: 'value',
                            width: '10%',
                        },
                    ],
                },
                {
                    text: 'B) DOCUMENTO Y ANEXOS COMPLETAMENTE TERMINADOS? SI (  ) NO (  )',
                    style: 'label',
                },
                {
                    columns: [
                        { text: 'SI', style: 'value', width: '10%' },
                        {
                            text: formValues.documentoTerminadoSi
                                ? '( X )'
                                : '(  )',
                            style: 'value',
                            width: '10%',
                        },
                        { text: 'NO', style: 'value', width: '10%' },
                        {
                            text: formValues.documentoTerminadoNo
                                ? '( X )'
                                : '(  )',
                            style: 'value',
                            width: '10%',
                        },
                    ],
                    margin: [0, 0, 0, 20],
                },
                { text: 'OBSERVACIONES:', style: 'label' },
                {
                    text: formValues?.observaciones || '',
                    style: 'value',
                },
                {
                    text: 'JURADOS SUGERIDOS Y DATOS DE CONTACTO:',
                    style: 'label',
                },
                {
                    text: `${this.juradoInternoSeleccionado?.nombres}, ${this.juradoInternoSeleccionado?.correo}, ${this.juradoInternoSeleccionado?.universidad}\n${this.juradoExternoSeleccionado?.nombres}, ${this.juradoExternoSeleccionado?.correo}, ${this.juradoExternoSeleccionado?.universidad}`,
                    style: 'value',
                },
                {
                    columns: [
                        { text: 'FECHA:', style: 'label', width: '25%' },
                        {
                            text: fechaActual,
                            style: 'value',
                            width: '75%',
                        },
                    ],
                    margin: [0, 0, 0, 20],
                },
                {
                    columns: [
                        { text: 'FIRMA:', style: 'label', width: '25%' },
                        {
                            image: this.firmaDirector,
                            width: 80,
                            height: 60,
                            margin: [0, 5, 0, 0],
                            alignment: 'left',
                            style: 'value',
                        },
                    ],
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

    onDownload() {
        this.loading = true;
        if (this.formatoFForm.invalid) {
            this.loading = false;
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        }
        const docDefinition = this.generateDocDefinition();
        pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
            const file = new File(
                [pdfBlob],
                `${this.estudianteSeleccionado.codigo} - formatoF.pdf`,
                {
                    type: 'application/pdf',
                }
            );
            const link = document.createElement('a');
            link.download = file.name;
            link.href = URL.createObjectURL(file);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
            this.loading = false;
        });
    }

    onInsertar() {
        if (this.formatoFForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        }
        const docDefinition = this.generateDocDefinition();
        pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
            const file = new File(
                [pdfBlob],
                `${this.estudianteSeleccionado.codigo} - formatoF.pdf`,
                {
                    type: 'application/pdf',
                }
            );
            this.formatoFPdfGenerated.emit(file);
            this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
        });
    }

    nombreCompletoEstudiante(e: any) {
        return `${e.nombre} ${e.apellido}`;
    }

    handlerResponseException(response: any) {
        if (response.status !== 500) return;
        const mapException = mapResponseException(response.error);
        mapException.forEach((value) => {
            this.messageService.add(errorMessage(value));
        });
    }

    private handleSuccessMessage(message: string) {
        this.messageService.add(infoMessage(message));
    }

    private handleWarningMessage(message: string) {
        this.messageService.clear();
        this.messageService.add(warnMessage(message));
    }
}
