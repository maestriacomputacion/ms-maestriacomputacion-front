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
import { BuscadorDocentesComponent } from 'src/app/shared/components/buscador-docentes/buscador-docentes.component';
import { DialogService } from 'primeng/dynamicdialog';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'documento-formatoEvaluadores',
    templateUrl: 'documento-formatoEvaluadores.component.html',
    styleUrls: ['documento-formatoEvaluadores.component.scss'],
})
export class DocumentoformatoEvaluadoresComponent implements OnInit {
    @Input() fechaMaximaEvaluacion: any;
    @Output() formReady = new EventEmitter<FormGroup>();
    @Output() formatoEvaluadoresPdfGenerated = new EventEmitter<File>();

    @ViewChild('formatoEvaluadores') formatoEvaluadores!: ElementRef;

    private estudianteSubscription: Subscription;
    private tituloSubscription: Subscription;
    private evaluadorInternoSubscription: Subscription;
    private evaluadorExternoSubscription: Subscription;

    formatoEvaluadoresForm: FormGroup;

    loading: boolean = false;

    fechaActual: Date;

    docenteSeleccionado: any;
    estudianteSeleccionado: any;

    firmaCoordinador: string;
    logoFacultad: string;
    logoIcontec: string;
    assetHeader: string;
    assetCalidad: string;

    constructor(
        private fb: FormBuilder,
        private dialogService: DialogService,
        private messageService: MessageService,
        private trabajoDeGradoService: TrabajoDeGradoService
    ) {}

    get titulo(): FormControl {
        return this.formatoEvaluadoresForm.get('propuesta') as FormControl;
    }

    get estudiante(): FormControl {
        return this.formatoEvaluadoresForm.get('estudiante') as FormControl;
    }

    get docente(): FormControl {
        return this.formatoEvaluadoresForm.get('docente') as FormControl;
    }

    get evaluadorExterno(): FormControl {
        return this.formatoEvaluadoresForm.get(
            'evaluadorExterno'
        ) as FormControl;
    }

    get evaluadorInterno(): FormControl {
        return this.formatoEvaluadoresForm.get(
            'evaluadorInterno'
        ) as FormControl;
    }

    ngOnInit() {
        this.initForm();
        this.fechaActual = new Date();

        const tituloPromise = firstValueFrom(
            this.trabajoDeGradoService.tituloSeleccionadoSubject$
        );
        const estudiantePromise = firstValueFrom(
            this.trabajoDeGradoService.estudianteSeleccionado$
        );
        const evaluadorExternoPromise = firstValueFrom(
            this.trabajoDeGradoService.evaluadorExternoSeleccionadoSubject$
        );
        const evaluadorInternoPromise = firstValueFrom(
            this.trabajoDeGradoService.evaluadorInternoSeleccionadoSubject$
        );

        Promise.all([
            tituloPromise,
            estudiantePromise,
            evaluadorExternoPromise,
            evaluadorInternoPromise,
        ])
            .then(
                ([
                    tituloResponse,
                    estudianteResponse,
                    evaluadorExternoResponse,
                    evaluadorInternoResponse,
                ]) => {
                    if (tituloResponse) {
                        this.titulo.setValue(tituloResponse);
                    }
                    if (estudianteResponse) {
                        this.estudianteSeleccionado = estudianteResponse;
                        this.estudiante.setValue(
                            this.nombreCompletoEstudiante(estudianteResponse)
                        );
                    }
                    if (evaluadorExternoResponse) {
                        this.evaluadorExterno.setValue(
                            evaluadorExternoResponse
                        );
                    }
                    if (evaluadorInternoResponse) {
                        this.evaluadorInterno.setValue(
                            evaluadorInternoResponse
                        );
                    }
                }
            )
            .catch((e) => this.handlerResponseException(e));

        if (this.fechaMaximaEvaluacion) {
            this.formatoEvaluadoresForm
                .get('fechaRespuesta')
                .setValue(this.fechaMaximaEvaluacion);
        }
    }

    initForm(): void {
        this.formatoEvaluadoresForm = this.fb.group({
            consecutivo: ['MC/051', Validators.required],
            asunto: [
                'Designación como Evaluador del Anteproyecto y Examen de Valoración de Maestría en Computación',
                Validators.required,
            ],
            coordinador: [null, Validators.required],
            estudiante: [null, Validators.required],
            docente: [null, Validators.required],
            propuesta: [null, Validators.required],
            contenido: [null, Validators.required],
            evaluadorExterno: [null, Validators.required],
            evaluadorInterno: [null, Validators.required],
            fechaSesion: [null, Validators.required],
            fechaRespuesta: [null, Validators.required],
            firmaCoordinador: [null, Validators.required],
        });

        this.formReady.emit(this.formatoEvaluadoresForm);

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

    ngOnDestroy() {
        if (this.tituloSubscription) {
            this.tituloSubscription.unsubscribe();
        }
        if (this.estudianteSubscription) {
            this.estudianteSubscription.unsubscribe();
        }
        if (this.evaluadorExternoSubscription) {
            this.evaluadorExternoSubscription.unsubscribe();
        }
        if (this.evaluadorInternoSubscription) {
            this.evaluadorInternoSubscription.unsubscribe();
        }
    }

    generateContent() {
        if (this.isFormValid()) {
            if (this.evaluadorInterno && this.evaluadorExterno) {
                this.updateLetterContent();
            } else {
                console.error(
                    'Evaluador interno o externo no están definidos.'
                );
            }
        } else {
            console.error('El formulario contiene errores.');
        }
    }

    isFormValid(): boolean {
        const { firmaCoordinador, contenido, ...requiredFields } =
            this.formatoEvaluadoresForm.controls;
        return Object.values(requiredFields).every((control) => control.valid);
    }

    generateLetterContent(formValues: any, docenteSeleccionado: any): string {
        const fechaSesion = new Date(
            formValues.fechaSesion
        ).toLocaleDateString();
        const fechaRespuesta = new Date(
            formValues.fechaRespuesta
        ).toLocaleDateString();

        return `
    El comité del programa de Maestría en Computación reunido en su sesión ordinaria del día ${fechaSesion} revisó la solicitud de presentación del examen de valoración de la propuesta denominada “${formValues.propuesta}” del estudiante ${formValues.estudiante}, bajo la dirección del PhD. ${docenteSeleccionado?.nombres}.
    
    En la reunión mencionada, el Comité aceptó la sugerencia de evaluadores realizada por el profesor ${docenteSeleccionado?.nombres}, y en este sentido, nos permitimos por medio del presente oficio, notificarle su designación como evaluador del examen de valoración. Adjunto a este documento encontrará los documentos que entrega el estudiante para soportar la solicitud.
    
    La Evaluación del Examen de Valoración implica la revisión del documento de anteproyecto, junto con el examen de valoración y los avances reportados en función de lo propuesto en el anteproyecto. Agradecemos la retroalimentación, aportes, observaciones y correcciones que pueda brindar al estudiante ${formValues.estudiante} sobre la documentación presentada en el examen de valoración.
    
    La evaluación se realizará por escrito, no habrá sustentación presencial o virtual y debe contener dos ítems importantes:
    
    1. La decisión: APROBADO, APLAZADO, NO APROBADO. Si se aplaza (normalmente por cambios de fondo en la propuesta) el estudiante tiene un máximo de 15 días para hacer llegar las correcciones. Si hay cambios de forma, el documento se aprueba y el estudiante entrega el documento final con las correcciones a la coordinación, no se hace necesario ningún trámite adicional de parte del evaluador. Esta decisión debe consignarse en el Formato B (ver adjunto).
    
    2. Las observaciones o comentarios pueden ser incluidos en los documentos de word/pdf que se entregan al evaluador (anteproyecto, examen de valoración y anexos según el caso) o en el Formato C (ver adjunto).
    
    Para facilidad de los evaluadores, cada uno puede entregar los formatos B y C en forma independiente a la coordinación. Agradecemos que su respuesta sea enviada antes del ${fechaRespuesta}.
    
    Cualquier inquietud con relación a la evaluación favor comunicarse con el director del trabajo de grado, PhD. ${docenteSeleccionado?.nombres} (email: ${docenteSeleccionado?.correo}).
    
    Si considera procedente interactuar con el estudiante para aclarar algún aspecto de la propuesta, siéntase en libertad de hacerlo al email: ${formValues.estudiante}.
        `;
    }

    updateLetterContent() {
        const formValues = this.formatoEvaluadoresForm.value;
        this.formatoEvaluadoresForm.patchValue({
            contenido: this.generateLetterContent(
                formValues,
                this.docenteSeleccionado
            ),
        });
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
            this.formatoEvaluadoresForm.patchValue(patchObject);
        }
    }

    nombreCompletoEstudiante(e: any) {
        return `${e.nombre} ${e.apellido}`;
    }

    getBase64Image(img: HTMLImageElement) {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL('image/png');
    }

    generateDocDefinition() {
        const formValues = this.formatoEvaluadoresForm.value;
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
                    alignment: 'justify',
                    margin: [0, 0, 0, 5],
                },
                {
                    text: 'Popayán, ' + fechaActual,
                    alignment: 'justify',
                    margin: [0, 0, 0, 10],
                },
                {
                    text: 'Doctor',
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: this.evaluadorInterno.value?.nombres,
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: this.evaluadorInterno.value?.universidad,
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: this.evaluadorInterno.value?.correo,
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: 'Jurado Externo',
                    style: 'value',
                    alignment: 'justify',
                    margin: [0, 0, 0, 5],
                },
                {
                    text: 'Doctor',
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: this.evaluadorExterno.value?.nombres,
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: 'Docente',
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: this.evaluadorExterno.value?.universidad,
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: this.evaluadorExterno.value?.correo,
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: 'Jurado Interno',
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text:
                        'Asunto: ' +
                        formValues.asunto +
                        ' ' +
                        formValues.estudiante,
                    style: 'value',
                    margin: [0, 10, 0, 5],
                    alignment: 'justify',
                },
                {
                    text: 'Estimados profesores, reciban un cordial saludo,',
                    margin: [0, 0, 0, 5],
                    alignment: 'justify',
                    style: 'value',
                },
                {
                    text: formValues.contenido,
                    style: 'value',
                    margin: [0, 0, 0, 5],
                    alignment: 'justify',
                },
                {
                    text: 'En nombre del Comité de Programa de la Maestría en Computación de la Facultad de Ingeniería Electrónica y Telecomunicaciones, les expreso mis más sinceros agradecimientos por toda su colaboración.',
                    style: 'value',
                    margin: [0, 0, 0, 5],
                    alignment: 'justify',
                },
                {
                    text: 'Quedo atenta a cualquier inquietud o comentario.',
                    style: 'value',
                    margin: [0, 0, 0, 5],
                    alignment: 'justify',
                },
                {
                    text: 'Universitariamente,',
                    style: 'value',
                    margin: [0, 0, 0, 10],
                    alignment: 'justify',
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
                    text: `${formValues.coordinador}, PhD.`,
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: 'Coordinadora Maestría Computación',
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: 'E-mail: maestriacomputacion@unicauca.edu.co',
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text:
                        'Copia a: ' +
                        formValues.estudiante +
                        ' (Estudiante Maestria en Computación) ' +
                        this.docenteSeleccionado.nombres +
                        ' (Director Trabajo de Grado)',
                    style: 'value',
                    alignment: 'justify',
                    margin: [0, 10, 0, 5],
                },
                {
                    text: 'Anexo: Anteproyecto, Examen de Valoración, Soportes de Avance, Formatos B y C.',
                    style: 'small',
                    alignment: 'justify',
                    margin: [0, 0, 0, 5],
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
                    margin: [40, 60, 0, 0],
                };
            },
            styles: {
                title: {
                    bold: true,
                    fontSize: 11,
                },
                value: {
                    fontSize: 11,
                },
                small: {
                    fontSize: 10,
                },
            },
            pageMargins: [40, 40, 40, 160],
        };
    }

    onDownload() {
        this.loading = true;
        if (this.formatoEvaluadoresForm.invalid) {
            this.loading = false;
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        }
        const docDefinition = this.generateDocDefinition();
        pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
            const file = new File(
                [pdfBlob],
                `${this.estudianteSeleccionado.codigo} - formatoOficioDirigidoEvaluadores.pdf`,
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
        if (this.formatoEvaluadoresForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        }
        const docDefinition = this.generateDocDefinition();
        pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
            const file = new File(
                [pdfBlob],
                `${this.estudianteSeleccionado.codigo} - formatoOficioDirigidoEvaluadores.pdf`,
                {
                    type: 'application/pdf',
                }
            );
            this.formatoEvaluadoresPdfGenerated.emit(file);
            this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
        });
    }

    showBuscadorDocente() {
        return this.dialogService.open(BuscadorDocentesComponent, {
            header: 'Seleccionar docente',
            width: '60%',
            styleClass: 'custom-docente-dialog',
        });
    }

    async onSeleccionarDocente(): Promise<void> {
        try {
            const ref = this.showBuscadorDocente();
            const response = await firstValueFrom(ref.onClose);
            if (response) {
                const docente = this.mapDocenteLabel(response);
                this.docenteSeleccionado = docente;
                this.docente.setValue(docente.nombres);
            }
        } catch (error) {
            console.error('Error al seleccionar docente:', error);
        }
    }

    mapDocenteLabel(docente: any) {
        return {
            id: docente.id,
            nombres: docente.nombres ?? docente.nombre + ' ' + docente.apellido,
            correo: docente.correoElectronico ?? docente.correo,
            universidad: docente.universidad,
        };
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
