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
    selector: 'documento-formatoG',
    templateUrl: 'documento-formatoG.component.html',
    styleUrls: ['documento-formatoG.component.scss'],
})
export class DocumentoFormatoGComponent implements OnInit {
    @Input() trabajoDeGradoId: any;
    @Input() juradoInternoSeleccionado: any;
    @Input() juradoExternoSeleccionado: any;
    @Output() formReady = new EventEmitter<FormGroup>();
    @Output() formatoGPdfGenerated = new EventEmitter<File>();

    @ViewChild('formatoG') formatoG!: ElementRef;

    estudianteSubscription: Subscription;
    tituloSubscription: Subscription;

    formatoGForm: FormGroup;

    loading: boolean = false;

    estudianteSeleccionado: any;

    firmaCoordinador: string;
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

    get estudiante(): FormControl {
        return this.formatoGForm.get('estudiante') as FormControl;
    }

    get titulo(): FormControl {
        return this.formatoGForm.get('titulo') as FormControl;
    }

    get director(): FormControl {
        return this.formatoGForm.get('director') as FormControl;
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
                        this.formatoGForm
                            .get('estudiante')
                            .setValue(
                                this.nombreCompletoEstudiante(
                                    this.estudianteSeleccionado
                                )
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
        const today = new Date();
        const dia = today.getDate();
        const mes = today.getMonth() + 1;
        const anio = today.getFullYear();

        const fecha = `${dia} de ${mes} de ${anio}`;

        this.formatoGForm = this.fb.group({
            consecutivo: ['MC/013', Validators.required],
            fecha: [fecha, Validators.required],
            facultad: [
                'Ingeniería Electrónica y Telecomunicaciones',
                Validators.required,
            ],
            programa: ['Maestría en Computación', Validators.required],
            coordinador: [null, Validators.required],
            estudiante: [null, Validators.required],
            titulo: [null, Validators.required],
            director: [null, Validators.required],
            observaciones: [null],
            firmaCoordinador: [null, Validators.required],
        });

        this.formReady.emit(this.formatoGForm);

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
        if (this.estudianteSubscription) {
            this.estudianteSubscription.unsubscribe();
        }
        if (this.tituloSubscription) {
            this.tituloSubscription.unsubscribe();
        }
    }

    onFirmaChange(event: any, fieldName: string) {
        const input = event && event.files ? event : { files: [] };
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (fieldName === 'firmaCoordinador') {
                    this.firmaCoordinador = reader.result as string;
                }
            };
            reader.readAsDataURL(file);
            const patchObject = {};
            patchObject[fieldName] = file;
            this.formatoGForm.patchValue(patchObject);
        }
    }

    generateDocDefinition() {
        const formValues = this.formatoGForm.value;
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
                    text: formValues.consecutivo,
                    style: 'subheader',
                    alignment: 'left',
                },
                {
                    text: 'TESIS DE POSGRADO',
                    style: 'subheader',
                    alignment: 'center',
                },
                {
                    columns: [
                        { text: 'FORMATO G:', style: 'label', width: '25%' },
                        {
                            text: 'REMISION DEL TRABAJO FINAL AL CONSEJO DE FACULTAD POR EL COORDINADOR DEL COMITÉ DEL PROGRAMA',
                            style: 'value',
                            width: '75%',
                        },
                    ],
                },
                {
                    columns: [
                        { text: 'PROGRAMA:', style: 'label', width: '25%' },
                        {
                            text: formValues.programa,
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
                    text: 'JURADOS SUGERIDOS Y DATOS DE CONTACTO:',
                    style: 'label',
                },
                {
                    text: `Jurado Interno: ${this.juradoInternoSeleccionado?.nombres}, ${this.juradoInternoSeleccionado?.correo}, ${this.juradoInternoSeleccionado?.universidad}\nJurado Externo: ${this.juradoExternoSeleccionado?.nombres}, ${this.juradoExternoSeleccionado?.correo}, ${this.juradoExternoSeleccionado?.universidad}`,
                    style: 'value',
                },
                { text: 'OBSERVACIONES:', style: 'label' },
                {
                    text: formValues?.observaciones || '',
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
                            image: this.firmaCoordinador,
                            width: 80,
                            height: 60,
                            margin: [0, 5, 0, 0],
                            alignment: 'left',
                            style: 'value',
                        },
                    ],
                },
                {
                    columns: [
                        { text: '', width: '25%' },
                        {
                            text: `Dra. ${formValues.coordinador} (Coordinadora Comité de Programa)`,
                            width: '75%',
                        },
                    ],
                },
                {
                    text: 'Anexo: Revisión de Historia académica del estudiante e historia académica de SIMCA (2 folios).',
                    style: 'small',
                    alignment: 'justify',
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
                small: {
                    fontSize: 10,
                },
            },
        };
    }

    onDownload() {
        this.loading = true;
        if (this.formatoGForm.invalid) {
            this.loading = false;
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        }
        const docDefinition = this.generateDocDefinition();
        pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
            const file = new File(
                [pdfBlob],
                `${this.estudianteSeleccionado.codigo} - formatoG.pdf`,
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
        if (this.formatoGForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        }
        const docDefinition = this.generateDocDefinition();
        pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
            const file = new File(
                [pdfBlob],
                `${this.estudianteSeleccionado.codigo} - formatoG.pdf`,
                {
                    type: 'application/pdf',
                }
            );
            this.formatoGPdfGenerated.emit(file);
            this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
        });
    }

    getFormControl(formControlName: string): FormControl {
        return this.formatoGForm.get(formControlName) as FormControl;
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
