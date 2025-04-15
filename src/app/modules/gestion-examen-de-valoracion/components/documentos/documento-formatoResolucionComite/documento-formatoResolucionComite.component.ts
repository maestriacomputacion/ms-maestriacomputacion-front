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
import { Subscription } from 'rxjs';
import { Mensaje } from 'src/app/core/enums/enums';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { TrabajoDeGradoService } from '../../../services/trabajoDeGrado.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'documento-formatoResolucionComite',
    templateUrl: 'documento-formatoResolucionComite.component.html',
    styleUrls: ['documento-formatoResolucionComite.component.scss'],
})
export class DocumentoFormatoResolucionComiteComponent implements OnInit {
    @Input() directorSeleccionado: any;
    @Output() formReady = new EventEmitter<FormGroup>();
    @Output() formatoResolucionComitePdfGenerated = new EventEmitter<File>();

    @ViewChild('formatoResolucionComite')
    formatoResolucionComite!: ElementRef;

    estudianteSubscription: Subscription;
    tituloSubscription: Subscription;

    formatoResolucionComiteForm: FormGroup;

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
        private trabajoDeGradoService: TrabajoDeGradoService
    ) {}

    get estudiante(): FormControl {
        return this.formatoResolucionComiteForm.get(
            'estudiante'
        ) as FormControl;
    }

    get titulo(): FormControl {
        return this.formatoResolucionComiteForm.get('titulo') as FormControl;
    }

    get director(): FormControl {
        return this.formatoResolucionComiteForm.get('director') as FormControl;
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
                        this.formatoResolucionComiteForm
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

        if (this.directorSeleccionado) {
            this.director.setValue(
                this.directorSeleccionado?.nombres ??
                    this.directorSeleccionado?.nombre +
                        ' ' +
                        this.directorSeleccionado?.apellido
            );
        }
    }

    initForm(): void {
        this.formatoResolucionComiteForm = this.fb.group({
            consecutivo: ['MC/001', Validators.required],
            facultad: [
                'Ingeniería Electrónica y Telecomunicaciones',
                Validators.required,
            ],
            programa: ['Maestría en Computación', Validators.required],
            coordinador: [null, Validators.required],
            estudiante: [null, Validators.required],
            titulo: [null, Validators.required],
            director: [null, Validators.required],
            fechaSesion: [null, Validators.required],
            firmaCoordinador: [null, Validators.required],
        });

        this.formReady.emit(this.formatoResolucionComiteForm);

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
            this.formatoResolucionComiteForm.patchValue(patchObject);
        }
    }

    generateDocDefinition() {
        const formValues = this.formatoResolucionComiteForm.value;

        const today = new Date();
        const dia = today.getDate();
        const mes = today.getMonth() + 1;
        const anio = today.getFullYear();
        const fechaActual = `${dia} de ${mes} de ${anio}`;

        const fechaSesion = new Date(
            formValues.fechaSesion
        ).toLocaleDateString();

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
                    alignment: 'justify',
                    margin: [0, 0, 0, 5],
                },
                {
                    text: 'Popayán, ' + fechaActual,
                    alignment: 'justify',
                    margin: [0, 0, 0, 10],
                },
                {
                    text: 'Magister',
                    alignment: 'justify',
                },
                {
                    text: 'Alejandro Toledo Tovar',
                    alignment: 'justify',
                },
                {
                    text: 'Presidente Comite de Facultad',
                    alignment: 'justify',
                },
                {
                    text: formValues.facultad,
                    alignment: 'justify',
                },
                {
                    text: 'Universidad del Cauca',
                    alignment: 'justify',
                    margin: [0, 0, 0, 5],
                },
                {
                    columns: [
                        { text: 'Asunto:', style: 'label', width: '10%' },
                        {
                            text: [
                                'Remisión Evaluación de Anteproyecto de ',
                                { text: formValues.estudiante, bold: true },
                                ' y solicitud de elaborar Resolución de aprobación del mismo.',
                            ],
                            style: 'value',
                            width: '90%',
                        },
                    ],
                },
                {
                    columns: [
                        {
                            text: 'Cordial Saludo,',
                            style: 'value',
                            margin: [0, 10, 0, 10],
                        },
                    ],
                },
                {
                    columns: [
                        {
                            text: [
                                'Para su conocimiento y fines pertinentes (elaborar resolución de aprobación por parte del Comite de Facultad de la FIET) me permito remitir los documentos de evaluación del Anteproyecto de Maestría denominado: ',
                                { text: formValues.titulo, bold: true },
                                ` presentado por el estudiante del Programa de ${formValues.programa}, `,
                                { text: formValues.estudiante, bold: true },
                                'dirigido por ',
                                { text: formValues.director, bold: true },
                                `de la Universidad del Cauca, los cuales han sido revisados y avalados por el Comité de Programa en reunión ordinaria del ${fechaSesion}.`,
                            ],
                            style: 'value',
                            alignment: 'justify',
                        },
                    ],
                },
                {
                    columns: [
                        {
                            text: [
                                'El concepto emitido por los jurados evaluadores es de ',
                                { text: 'Aprobado.', bold: true },
                                'Se adjunta copia de los Formatos de aprobación diligenciados por los respectivos evaluadores, copia digital del documento de anteproyecto enviado al correo Comite.fiet@unicauca.edu.co.',
                            ],
                            style: 'value',
                            alignment: 'justify',
                        },
                    ],
                },
                {
                    columns: [
                        {
                            text: 'Universitariamente,',
                            style: 'value',
                            margin: [0, 10, 0, 10],
                        },
                    ],
                },
                {
                    image: this.firmaCoordinador,
                    width: 80,
                    height: 60,
                    margin: [0, 10, 0, 0],
                    alignment: 'left',
                    style: 'value',
                },
                {
                    columns: [
                        {
                            text: `${formValues.coordinador} M, PhD`,
                            bold: true,
                        },
                    ],
                },
                {
                    columns: [
                        {
                            text: 'Coordinadora Maestría Computación',
                        },
                    ],
                },
                {
                    columns: [
                        {
                            text: 'e-mail: maestriacomputacion@unicauca.edu.co',
                        },
                    ],
                },
                {
                    columns: [
                        {
                            text: 'Anexos: Anteproyecto digital de anteproyecto y evaluación positiva de los evaluadores en el examen de valoración.',
                            style: 'small',
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
                small: {
                    fontSize: 10,
                    margin: [0, 10, 0, 0],
                },
            },
        };
    }

    onDownload() {
        this.loading = true;
        if (this.formatoResolucionComiteForm.invalid) {
            this.loading = false;
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        }
        const docDefinition = this.generateDocDefinition();
        pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
            const file = new File(
                [pdfBlob],
                `${this.estudianteSeleccionado.codigo} - Solicitud Ante el Concejo.pdf`,
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
        if (this.formatoResolucionComiteForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const docDefinition = this.generateDocDefinition();
            pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
                const file = new File(
                    [pdfBlob],
                    `${this.estudianteSeleccionado.codigo} - Solicitud Ante el Concejo.pdf`,
                    {
                        type: 'application/pdf',
                    }
                );
                this.formatoResolucionComitePdfGenerated.emit(file);
                this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
            });
        }
    }

    getFormControl(formControlName: string): FormControl {
        return this.formatoResolucionComiteForm.get(
            formControlName
        ) as FormControl;
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
