import {
    Component,
    EventEmitter,
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
import { Router } from '@angular/router';
import {
    Subject,
    Subscription,
    catchError,
    firstValueFrom,
    forkJoin,
    lastValueFrom,
    of,
    timer,
} from 'rxjs';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { DialogService } from 'primeng/dynamicdialog';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { Aviso, EstadoProceso, Mensaje } from 'src/app/core/enums/enums';
import { ResolucionService } from '../../services/resolucion.service';
import { TrabajoDeGradoService } from '../../services/trabajoDeGrado.service';
import { RespuestaService } from '../../services/respuesta.service';
import { Resolucion } from '../../models/resolucion';
import { Docente } from 'src/app/modules/gestion-docentes/models/docente';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import { BuscadorDocentesComponent } from 'src/app/shared/components/buscador-docentes/buscador-docentes.component';
import { AutenticacionService } from 'src/app/modules/gestion-autenticacion/services/autenticacion.service';

@Component({
    selector: 'app-resolucion-examen',
    templateUrl: './resolucion-examen.component.html',
    styleUrls: ['./resolucion-examen.component.scss'],
})
export class ResolucionExamenComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();

    private checkboxChangeSubject = new Subject<boolean>();
    checkboxChange$ = this.checkboxChangeSubject.asObservable();

    resolucionForm: FormGroup;

    private subscriptions: Subscription = new Subscription();
    private checkboxCoordinadorSubscription: Subscription;
    private checkboxComiteSubscription: Subscription;
    private checkboxFormSubscription: Subscription;
    private estudianteSubscription: Subscription;
    private trabajoSeleccionadoSubscription: Subscription;
    private tituloSubscription: Subscription;
    private resolucionSubscription: Subscription;
    private respuestaSubscription: Subscription;
    private sustentacionSubscription: Subscription;
    private solicitudSubscription: Subscription;
    private resolucionValidSubscription: Subscription;

    @ViewChild('AnteproyectoFinal') AnteproyectoFinal!: FileUpload;
    @ViewChild('SolicitudComite') SolicitudComite!: FileUpload;
    @ViewChild('SolicitudConsejo') SolicitudConsejo!: FileUpload;
    @ViewChild('OficioConsejo') OficioConsejo!: FileUpload;

    FileAnteproyectoFinal: File | null;
    FileSolicitudComite: File | null;
    FileSolicitudConsejo: File | null;
    FileOficioConsejo: File | null;

    formatoBEv1: any;
    formatoBEv2: any;

    displayModal: boolean = false;
    displayFormatoResolucionComite: boolean = false;
    displayFormatoResolucionConsejo: boolean = false;
    errorMessageShown: boolean = false;
    editMode: boolean = false;
    isPdfLoaded: boolean = false;
    isLoading: boolean;
    isSending: boolean;
    isDocente: boolean = false;
    isCoordinadorFase1: boolean = false;
    isCoordinadorFase2: boolean = false;
    isCoordinadorFase3: boolean = false;
    isDocenteCreated: boolean = false;
    isCoordinadorFase1Created: boolean = false;
    isCoordinadorFase2Created: boolean = false;
    isCoordinadorFase3Created: boolean = false;
    isResolucionValid: boolean = false;
    isSustentacionCreated: boolean = false;
    isReviewed: boolean = false;
    updateCoordinadorFase1: boolean = false;
    updateCoordinadorFase2: boolean = false;
    messageShown: boolean = false;

    role: string[];
    pdfUrls: { name: string; url: string }[] = [];
    estadosRespuesta: string[] = ['Aprobado', 'No Aprobado'];
    estadosVerificacion: string[] = ['Aceptado', 'Rechazado'];

    trabajoDeGradoId: number;
    respuestaId: number;
    resolucionId: number;
    sustentacionId: number;
    currentPdfIndex: number = 0;

    estado: string;
    tituloSeleccionado: string;
    estudianteSeleccionado: Estudiante = {};
    codirectorSeleccionado: Docente;
    directorSeleccionado: Docente;

    maxDate: Date;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private confirmationService: ConfirmationService,
        private trabajoDeGradoService: TrabajoDeGradoService,
        private respuestaService: RespuestaService,
        private resolucionService: ResolucionService,
        private messageService: MessageService,
        private dialogService: DialogService,
        private autenticacion: AutenticacionService
    ) {
        this.maxDate = new Date();
    }

    get director(): FormControl {
        return this.resolucionForm.get('idDirector') as FormControl;
    }

    get codirector(): FormControl {
        return this.resolucionForm.get('idCodirector') as FormControl;
    }

    ngOnInit() {
        this.initializeComponent();
    }

    async initializeComponent() {
        this.role = this.autenticacion.getRole();
        this.initForm();
        this.subscribeToObservers();
        if (this.router.url.includes('editar')) {
            await this.loadEditMode();
        }
        this.checkEstados();
    }

    async loadEditMode() {
        this.editMode = true;
        await this.loadResolucion();
    }

    initForm(): void {
        this.resolucionForm = this.fb.group({
            idDirector: [null, Validators.required],
            idCodirector: [null, Validators.required],
            linkAnteproyectoFinal: [null, Validators.required],
            linkSolicitudComite: [null, Validators.required],
            conceptoDocumentosCoordinador: [null, Validators.required],
            asuntoCoordinador: [null],
            mensajeCoordinador: [null],
            conceptoComite: [null, Validators.required],
            asuntoComite: [null],
            mensajeComite: [null],
            numeroActa: [null, Validators.required],
            fechaActa: [null, Validators.required],
            linkSolicitudConsejo: [null, Validators.required],
            numeroActaConsejo: [null, Validators.required],
            fechaActaConsejo: [null, Validators.required],
            linkOficioConsejo: [null, Validators.required],
        });

        this.formReady.emit(this.resolucionForm);

        this.checkboxCoordinadorSubscription = this.resolucionForm
            .get('conceptoDocumentosCoordinador')
            .valueChanges.subscribe((value) => {
                if (value == 'Rechazado') {
                    this.resolucionForm
                        .get('asuntoCoordinador')
                        .setValue('Corrección en la generación de resolución');
                    this.resolucionForm
                        .get('mensajeCoordinador')
                        .setValue(
                            'Por favor, revise y ajuste la solicitud de acuerdo con las observaciones proporcionadas.'
                        );
                }
            });

        this.checkboxComiteSubscription = this.resolucionForm
            .get('conceptoComite')
            .valueChanges.subscribe((value) => {
                if (value == 'Aprobado') {
                    this.resolucionForm
                        .get('asuntoComite')
                        .setValue('Documentos aprobados para revisión');
                    this.resolucionForm
                        .get('mensajeComite')
                        .setValue(
                            'Los documentos han sido aprobados. Por favor, revísenlos y proporcionen una respuesta a la brevedad.'
                        );
                }
                if (value == 'No Aprobado') {
                    this.resolucionForm
                        .get('asuntoComite')
                        .setValue('Corrección requerida por parte del comité');
                    this.resolucionForm
                        .get('mensajeComite')
                        .setValue(
                            'Se requiere realizar correcciones. Por favor, ajuste los documentos según las observaciones y responda a la brevedad.'
                        );
                }
            });

        this.setupIsReviewedCheckBox();
    }

    async setupIsReviewedCheckBox() {
        try {
            const value = await firstValueFrom(this.checkboxChange$);
            if (value && !this.messageShown) {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Información',
                    detail: 'Todos los documentos han sido revisados. Ahora puede cerrar la vista actual. Recuerde guardar los cambios.',
                    life: 4000,
                });
                this.messageShown = true;
            }
        } catch (error) {
            console.error('Error al obtener el valor del checkbox:', error);
        }
    }

    onCheckboxChange(value: boolean) {
        this.isReviewed = value;
        this.checkboxChangeSubject.next(value);
    }

    updateFormFields(role: string[]): void {
        const formControls = this.resolucionForm.controls;

        for (const control in formControls) {
            formControls[control].disable();
        }

        if (role.includes('ROLE_DOCENTE')) {
            formControls['idDirector'].enable();
            formControls['idCodirector'].enable();
            formControls['linkAnteproyectoFinal'].enable();
            formControls['linkSolicitudComite'].enable();
        }

        if (role.includes('ROLE_COORDINADOR')) {
            if (this.isDocente && !this.isCoordinadorFase1) {
                formControls['conceptoDocumentosCoordinador'].enable();
                formControls['asuntoCoordinador'].enable();
                formControls['mensajeCoordinador'].enable();
            }
            if (this.isCoordinadorFase1 && !this.isCoordinadorFase2) {
                this.checkboxFormSubscription = this.resolucionForm
                    .get('conceptoComite')
                    .valueChanges.subscribe((value) => {
                        if (value == 'Aprobado') {
                            formControls['linkSolicitudConsejo'].enable();
                            this.isReviewed = false;
                        } else if (value == 'No Aprobado') {
                            formControls['linkSolicitudConsejo'].disable();
                            this.isReviewed = true;
                        }
                    });
                formControls['conceptoComite'].enable();
                formControls['asuntoComite'].enable();
                formControls['mensajeComite'].enable();
                formControls['numeroActa'].enable();
                formControls['fechaActa'].enable();
                this.getFormatosBEvaluadores();
            }
            if (this.isCoordinadorFase2 && !this.isSustentacionCreated) {
                formControls['numeroActaConsejo'].enable();
                formControls['fechaActaConsejo'].enable();
                formControls['linkOficioConsejo'].enable();
            }
        }
    }

    subscribeToObservers() {
        this.estudianteSubscription =
            this.trabajoDeGradoService.estudianteSeleccionado$.subscribe({
                next: (response) => {
                    if (response) {
                        this.estudianteSeleccionado = response;
                    } else {
                        this.router.navigate(['examen-de-valoracion']);
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });

        this.tituloSubscription =
            this.trabajoDeGradoService.tituloSeleccionadoSubject$.subscribe({
                next: (response) => {
                    if (response) {
                        this.tituloSeleccionado = response;
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });

        this.trabajoSeleccionadoSubscription =
            this.trabajoDeGradoService.trabajoSeleccionadoSubject$.subscribe({
                next: (response) => {
                    if (response) {
                        this.trabajoDeGradoId = response.id;
                        this.estado = response.estado;

                        this.resolucionValidSubscription =
                            this.resolucionService
                                .getResolucionCoordinadorFase3(
                                    this.trabajoDeGradoId
                                )
                                .pipe(
                                    catchError(() => {
                                        return of(null);
                                    })
                                )
                                .subscribe({
                                    next: (response) => {
                                        if (
                                            response?.numeroActaConsejo &&
                                            response?.fechaActaConsejo
                                        ) {
                                            this.isResolucionValid = true;
                                        }
                                    },
                                    error: (e) => {
                                        this.handlerResponseException(e);
                                    },
                                });

                        if (
                            this.estado ==
                                EstadoProceso.EXAMEN_DE_VALORACION_APROBADO_EVALUADOR_2 &&
                            this.role.includes('ROLE_COORDINADOR')
                        ) {
                            this.router.navigate(['examen-de-valoracion']);
                        }
                    } else {
                        this.router.navigate(['examen-de-valoracion']);
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });

        this.resolucionSubscription =
            this.trabajoDeGradoService.resolucionSeleccionadaSubject$.subscribe(
                {
                    next: (response) => {
                        if (response) {
                            this.resolucionId = response.id;
                        }
                    },
                    error: (e) => this.handlerResponseException(e),
                }
            );

        this.sustentacionSubscription =
            this.trabajoDeGradoService.sustentacionSeleccionadaSubject$.subscribe(
                {
                    next: (response) => {
                        if (response) {
                            this.sustentacionId = response.id;
                        }
                    },
                    error: (e) => this.handlerResponseException(e),
                }
            );
    }

    ngOnDestroy() {
        if (this.estudianteSubscription) {
            this.estudianteSubscription.unsubscribe();
        }
        if (this.tituloSubscription) {
            this.tituloSubscription.unsubscribe();
        }
        if (this.trabajoSeleccionadoSubscription) {
            this.trabajoSeleccionadoSubscription.unsubscribe();
        }
        if (this.solicitudSubscription) {
            this.solicitudSubscription.unsubscribe();
        }
        if (this.respuestaSubscription) {
            this.respuestaSubscription.unsubscribe();
        }
        if (this.resolucionSubscription) {
            this.resolucionSubscription.unsubscribe();
        }
        if (this.resolucionValidSubscription) {
            this.resolucionValidSubscription.unsubscribe();
        }
        if (this.sustentacionSubscription) {
            this.sustentacionSubscription.unsubscribe();
        }
        if (this.checkboxCoordinadorSubscription) {
            this.checkboxCoordinadorSubscription.unsubscribe();
        }
        if (this.checkboxComiteSubscription) {
            this.checkboxComiteSubscription.unsubscribe();
        }
        if (this.checkboxFormSubscription) {
            this.checkboxFormSubscription.unsubscribe();
        }
        if (this.subscriptions) {
            this.subscriptions.unsubscribe();
        }
    }

    checkEstados() {
        switch (this.estado) {
            case EstadoProceso.EXAMEN_DE_VALORACION_APROBADO_EVALUADOR_2:
                this.messageService.clear();
                this.messageService.add({
                    severity: 'info',
                    summary: 'Informacion',
                    detail: EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_DOCENTE_SUSTENTACION,
                    life: 2000,
                });
                this.isDocente = false;
                this.isCoordinadorFase1 = false;
                this.isCoordinadorFase2 = false;
                this.isCoordinadorFase3 = false;
                break;
            case EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE1_GENERACION_RESOLUCION:
                this.isDocente = true;
                this.isCoordinadorFase1 = false;
                this.isCoordinadorFase2 = false;
                this.isCoordinadorFase3 = false;
                break;
            case EstadoProceso.DEVUELTO_GENERACION_DE_RESOLUCION_POR_COORDINADOR:
                this.messageService.clear();
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: EstadoProceso.DEVUELTO_GENERACION_DE_RESOLUCION_POR_COORDINADOR,
                    life: 2000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = false;
                this.isCoordinadorFase2 = false;
                this.isCoordinadorFase3 = false;
                break;
            case EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE2_GENERACION_RESOLUCION:
                this.messageService.clear();
                this.messageService.add({
                    severity: 'info',
                    summary: 'Informacion',
                    detail: 'Se han anexado los formatos de Anteproyecto Final - Formato B de cada evaluador.',
                    life: 5000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = false;
                this.isCoordinadorFase3 = false;
                break;
            case EstadoProceso.DEVUELTO_GENERACION_DE_RESOLUCION_POR_COMITE:
                this.messageService.clear();
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: EstadoProceso.DEVUELTO_GENERACION_DE_RESOLUCION_POR_COMITE,
                    life: 2000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = false;
                this.isCoordinadorFase3 = false;
                break;
            case EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE3_GENERACION_RESOLUCION:
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = true;
                this.isCoordinadorFase3 = false;
                break;
            case EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_DOCENTE_SUSTENTACION:
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = true;
                this.isCoordinadorFase3 = true;
                break;
            default:
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = true;
                this.isCoordinadorFase3 = true;
                this.isSustentacionCreated = true;
                break;
        }

        this.updateFormFields(this.role);
    }

    async getFormatosBEvaluadores() {
        const { formatosB } = await firstValueFrom(
            this.respuestaService.getFormatosB(this.trabajoDeGradoId)
        );

        this.formatoBEv1 = await firstValueFrom(
            this.trabajoDeGradoService.getFile(formatosB.formatoBEv1)
        );

        this.formatoBEv2 = await firstValueFrom(
            this.trabajoDeGradoService.getFile(formatosB.formatoBEv2)
        );
    }

    editFase(event: any, fase: string) {
        this.confirmationService.confirm({
            target: event.target,
            message: '¿Estás seguro de que deseas realizar esta acción?',
            icon: PrimeIcons.STEP_BACKWARD,
            acceptLabel: 'Si, Modificar',
            rejectLabel: 'No',
            accept: () => {
                if (fase == 'coordinadorFase1') {
                    this.isDocente = true;
                    this.isCoordinadorFase1 = false;
                    this.isCoordinadorFase2 = false;
                    this.isCoordinadorFase3 = false;
                    this.updateCoordinadorFase1 = true;
                    this.updateFormFields(this.role);
                } else if (fase == 'coordinadorFase2') {
                    this.isDocente = true;
                    this.isCoordinadorFase1 = true;
                    this.isCoordinadorFase2 = false;
                    this.isCoordinadorFase3 = false;
                    this.updateCoordinadorFase2 = true;
                    this.updateFormFields(this.role);
                }
            },
        });
    }

    //#region PDF VIEWER
    async loadPdfFiles() {
        const filesToConvert = [];

        if (this.role.includes('ROLE_DOCENTE')) {
            filesToConvert.push(
                {
                    file: this.FileAnteproyectoFinal,
                    fieldName: 'Anteproyecto Final',
                },
                {
                    file: this.FileSolicitudComite,
                    fieldName:
                        'Solicitud al comité para resolución de aprobación de trabajo de grado',
                }
            );
        } else if (
            this.role.includes('ROLE_COORDINADOR') &&
            this.updateCoordinadorFase2 == false &&
            (this.estado ==
                EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE1_GENERACION_RESOLUCION ||
                this.estado ==
                    EstadoProceso.DEVUELTO_GENERACION_DE_RESOLUCION_POR_COORDINADOR ||
                this.updateCoordinadorFase1 == true)
        ) {
            filesToConvert.push(
                {
                    file: this.FileAnteproyectoFinal,
                    fieldName: 'Anteproyecto Final',
                },
                {
                    file: this.FileSolicitudComite,
                    fieldName:
                        'Solicitud al comité para resolución de aprobación de trabajo de grado',
                }
            );
        } else if (
            this.role.includes('ROLE_COORDINADOR') &&
            this.updateCoordinadorFase1 == false &&
            (this.estado ==
                EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE2_GENERACION_RESOLUCION ||
                this.estado ==
                    EstadoProceso.DEVUELTO_GENERACION_DE_RESOLUCION_POR_COMITE ||
                this.updateCoordinadorFase2 == true)
        ) {
            if (this.formatoBEv1 && this.formatoBEv2) {
                const FileFormatoBEv1 = this.convertBase64ToFile(
                    this.formatoBEv1,
                    'formatoBEv1',
                    'application/pdf'
                );

                const FileFormatoBEv2 = this.convertBase64ToFile(
                    this.formatoBEv2,
                    'formatoBEv2',
                    'application/pdf'
                );

                filesToConvert.push(
                    {
                        file: this.FileAnteproyectoFinal,
                        fieldName: 'Anteproyecto Final',
                    },
                    {
                        file: this.FileSolicitudComite,
                        fieldName:
                            'Solicitud al comité para resolución de aprobación de trabajo de grado',
                    },
                    {
                        file: this.FileSolicitudConsejo,
                        fieldName:
                            'Solicitud al consejo de facultad para resolución de aprobación de trabajo de grado',
                    },
                    {
                        file: FileFormatoBEv1,
                        fieldName: 'Formato B Evaluador Interno',
                    },
                    {
                        file: FileFormatoBEv2,
                        fieldName: 'Formato B Evaluador Externo',
                    }
                );
            }
        } else if (
            this.role.includes('ROLE_COORDINADOR') &&
            (this.estado ==
                EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE3_GENERACION_RESOLUCION ||
                this.estado ==
                    EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_DOCENTE_SUSTENTACION)
        ) {
            filesToConvert.push({
                file: this.FileOficioConsejo,
                fieldName:
                    'Respuesta consejo de resolución generada - Oficio Consejo',
            });
        }

        const errorFiles = new Set<File>();

        try {
            for (const item of filesToConvert) {
                const { file, fieldName } = item;
                if (file) {
                    try {
                        const url = URL.createObjectURL(file);
                        this.pdfUrls.push({ name: `${fieldName}`, url });
                    } catch (error) {
                        errorFiles.add(file);
                    }
                }
            }

            if (errorFiles.size > 0) {
                this.messageService.clear();
                this.messageService.add(
                    errorMessage('Error al convertir uno o más archivos PDF.')
                );
                this.closeModal();
            }
        } catch (generalError) {
            this.messageService.clear();
            this.messageService.add(
                errorMessage(
                    'Se produjo un error general al cargar los archivos PDF.'
                )
            );
            this.closeModal();
        }
    }

    onPdfLoad(pdf: any) {
        if (pdf.numPages) {
            this.isPdfLoaded = true;
            console.log(`PDF loaded with ${pdf.numPages} pages.`);
        } else {
            this.isPdfLoaded = false;
            console.error('Failed to load PDF.');
        }
    }

    nextPdf() {
        if (this.currentPdfIndex < this.pdfUrls.length - 1) {
            this.isPdfLoaded = false;
            this.currentPdfIndex++;
        }
    }

    previousPdf() {
        if (this.currentPdfIndex > 0) {
            this.isPdfLoaded = false;
            this.currentPdfIndex--;
        }
    }

    openModal() {
        if (!this.isLoading) {
            this.displayModal = true;
            this.loadPdfFiles();
        }
    }

    closeModal() {
        this.displayModal = false;
        this.pdfUrls = [];
    }
    //#endregion

    showFormatoResolucionComite() {
        this.displayFormatoResolucionComite = true;
    }

    handleFormatoResolucionComitePdfGenerated(file: File) {
        const pdfFile = new File([file], 'SolicitudComite.pdf', {
            type: 'application/pdf',
        });
        this.FileSolicitudComite = pdfFile;
        this.convertFileToBase64(pdfFile)
            .then((base64) => {
                this.resolucionForm
                    .get('linkSolicitudComite')
                    .setValue(`linkSolicitudComite.pdf-${base64}`);
                this.displayFormatoResolucionComite = false;
            })
            .catch((error) => {
                console.error('Error al convertir el archivo a base64:', error);
            });
    }

    showFormatoResolucionConsejo() {
        this.displayFormatoResolucionConsejo = true;
    }

    handleFormatoResolucionConsejoPdfGenerated(file: File) {
        const pdfFile = new File([file], 'SolicitudConsejo.pdf', {
            type: 'application/pdf',
        });
        this.FileSolicitudConsejo = pdfFile;
        this.convertFileToBase64(pdfFile)
            .then((base64) => {
                this.resolucionForm
                    .get('linkSolicitudConsejo')
                    .setValue(`linkSolicitudConsejo.pdf-${base64}`);
                this.displayFormatoResolucionConsejo = false;
            })
            .catch((error) => {
                console.error('Error al convertir el archivo a base64:', error);
            });
    }

    async setup(fieldName: string) {
        try {
            const response: any = await firstValueFrom(
                this.trabajoDeGradoService.getFile(
                    this.resolucionForm.get(fieldName).value
                )
            );

            if (response) {
                const byteCharacters = atob(response);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const file = new File([byteArray], fieldName, {
                    type: response.type,
                });

                switch (fieldName) {
                    case 'linkAnteproyectoFinal':
                        this.FileAnteproyectoFinal = file;
                        break;
                    case 'linkSolicitudComite':
                        this.FileSolicitudComite = file;
                        break;
                    case 'linkSolicitudConsejo':
                        this.FileSolicitudConsejo = file;
                        break;
                    case 'linkOficioConsejo':
                        this.FileOficioConsejo = file;
                        break;
                    default:
                        break;
                }
            }
        } catch (e) {
            if (!this.errorMessageShown) {
                this.messageService.clear();
                this.messageService.add(
                    warnMessage('Pendiente subir archivos.')
                );
                this.errorMessageShown = true;
            }
        }
    }

    setValuesForm(resolucion: Resolucion) {
        this.resolucionForm.patchValue({
            ...resolucion,
        });
    }

    loadResolucion(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.isLoading = true;

            const docenteObs =
                this.role.includes('ROLE_DOCENTE') ||
                this.role.includes('ROLE_COORDINADOR')
                    ? this.resolucionService
                          .getResolucionDocente(this.trabajoDeGradoId)
                          .pipe(
                              catchError(() => {
                                  this.isDocenteCreated = false;
                                  return of(null);
                              })
                          )
                    : of(null);

            const coordinadorFase1Obs = this.role.includes('ROLE_COORDINADOR')
                ? this.resolucionService
                      .getResolucionCoordinadorFase1(this.trabajoDeGradoId)
                      .pipe(
                          catchError(() => {
                              this.isCoordinadorFase1Created = false;
                              return of(null);
                          })
                      )
                : of(null);

            const coordinadorFase2Obs = this.role.includes('ROLE_COORDINADOR')
                ? this.resolucionService
                      .getResolucionCoordinadorFase2(this.trabajoDeGradoId)
                      .pipe(
                          catchError(() => {
                              this.isCoordinadorFase2Created = false;
                              return of(null);
                          })
                      )
                : of(null);

            const coordinadorFase3Obs = this.role.includes('ROLE_COORDINADOR')
                ? this.resolucionService
                      .getResolucionCoordinadorFase3(this.trabajoDeGradoId)
                      .pipe(
                          catchError(() => {
                              this.isCoordinadorFase3Created = false;
                              return of(null);
                          })
                      )
                : of(null);

            const combinedSubscription = forkJoin({
                docente: docenteObs,
                coordinadorFase1: coordinadorFase1Obs,
                coordinadorFase2: coordinadorFase2Obs,
                coordinadorFase3: coordinadorFase3Obs,
            }).subscribe({
                next: (responses) => {
                    if (responses.docente) {
                        this.isDocenteCreated = true;
                        const data = responses.docente;
                        this.setValuesForm(data);
                        this.trabajoDeGradoService.setTituloSeleccionadoSubject(
                            data.titulo
                        );
                        this.codirectorSeleccionado = data?.codirector;
                        this.directorSeleccionado = data?.director;
                        this.director.setValue(this.directorSeleccionado.id);
                        this.codirector.setValue(
                            this.codirectorSeleccionado.id
                        );
                    }

                    if (responses.coordinadorFase1) {
                        this.isCoordinadorFase1Created = true;
                        const data = responses.coordinadorFase1;
                        data.conceptoDocumentosCoordinador == 'ACEPTADO'
                            ? this.resolucionForm
                                  .get('conceptoDocumentosCoordinador')
                                  .setValue('Aceptado')
                            : this.resolucionForm
                                  .get('conceptoDocumentosCoordinador')
                                  .setValue('Rechazado');
                    }

                    if (responses.coordinadorFase2) {
                        this.isCoordinadorFase2Created = true;
                        const data = responses.coordinadorFase2;
                        this.setValuesForm(data);
                        const lastIdx: number =
                            data.actaFechaRespuestaComite.length - 1;
                        const lastActa = data.actaFechaRespuestaComite[lastIdx];
                        const actaDate = lastActa?.fechaActa;
                        const actaNumber = lastActa?.numeroActa;
                        const actaConceptoComite = lastActa?.conceptoComite;

                        this.resolucionForm
                            .get('fechaActa')
                            .setValue(
                                actaDate
                                    ? new Date(`${actaDate}T00:00:00`)
                                    : null
                            );

                        this.resolucionForm
                            .get('numeroActa')
                            .setValue(actaNumber ? actaNumber : null);

                        this.resolucionForm
                            .get('conceptoComite')
                            .setValue(
                                actaConceptoComite == 'APROBADO'
                                    ? 'Aprobado'
                                    : 'No Aprobado'
                            );
                    }

                    if (responses.coordinadorFase3) {
                        this.isCoordinadorFase3Created = true;
                        const data = responses.coordinadorFase3;
                        this.setValuesForm(data);
                        this.resolucionForm
                            .get('fechaActaConsejo')
                            .setValue(
                                data?.fechaActaConsejo
                                    ? new Date(
                                          `${data?.fechaActaConsejo}T00:00:00`
                                      )
                                    : null
                            );
                    }
                },
                error: (e) => this.handlerResponseException(e),
                complete: () => {
                    if (this.role.includes('ROLE_DOCENTE')) {
                        this.setup('linkAnteproyectoFinal');
                        this.setup('linkSolicitudComite');
                    }
                    if (this.role.includes('ROLE_COORDINADOR')) {
                        this.setup('linkAnteproyectoFinal');
                        this.setup('linkSolicitudComite');
                        if (
                            this.isCoordinadorFase2Created &&
                            this.resolucionForm.get('conceptoComite').value ==
                                'Aprobado'
                        ) {
                            this.setup('linkSolicitudConsejo');
                        }
                        if (this.isCoordinadorFase3Created) {
                            this.setup('linkOficioConsejo');
                        }
                    }
                    this.isLoading = false;
                    resolve();
                },
            });
            this.subscriptions.add(combinedSubscription);
        });
    }

    async updateResolucion() {
        this.isSending = true;
        try {
            if (this.role.includes('ROLE_DOCENTE')) {
                if (
                    this.isDocenteCreated == true &&
                    (this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE1_GENERACION_RESOLUCION ||
                        this.estado ==
                            EstadoProceso.DEVUELTO_GENERACION_DE_RESOLUCION_POR_COORDINADOR ||
                        this.estado ==
                            EstadoProceso.DEVUELTO_GENERACION_DE_RESOLUCION_POR_COMITE)
                ) {
                    const resolucionData = this.resolucionForm.value;

                    const base64AnteproyectoFinal = await this.formatFileString(
                        this.FileAnteproyectoFinal,
                        'linkAnteproyectoFinal'
                    );
                    const base64SolicitudComite = await this.formatFileString(
                        this.FileSolicitudComite,
                        'linkSolicitudComite'
                    );

                    resolucionData.linkAnteproyectoFinal =
                        base64AnteproyectoFinal;
                    resolucionData.linkSolicitudComite = base64SolicitudComite;

                    await lastValueFrom(
                        this.resolucionService.updateResolucionDocente(
                            resolucionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else {
                    this.isSending = false;
                    this.messageService.clear();
                    return this.messageService.add(
                        errorMessage('No puedes modificar los datos.')
                    );
                }
            }

            if (this.role.includes('ROLE_COORDINADOR')) {
                if (
                    this.isCoordinadorFase1Created == false &&
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE1_GENERACION_RESOLUCION
                ) {
                    const resolucionData =
                        this.resolucionForm.get('conceptoDocumentosCoordinador')
                            .value == 'Aceptado'
                            ? {
                                  conceptoDocumentosCoordinador: 'ACEPTADO',
                              }
                            : {
                                  conceptoDocumentosCoordinador: 'RECHAZADO',
                                  envioEmail: {
                                      asunto: this.resolucionForm.get(
                                          'asuntoCoordinador'
                                      ).value,
                                      mensaje:
                                          this.resolucionForm.get(
                                              'mensajeCoordinador'
                                          ).value,
                                  },
                              };

                    await lastValueFrom(
                        this.resolucionService.createResolucionCoordinadorFase1(
                            resolucionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase2Created == false &&
                    this.updateCoordinadorFase1 == false &&
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE2_GENERACION_RESOLUCION
                ) {
                    const b64AnteproyectoFinal = await this.formatFileString(
                        this.FileAnteproyectoFinal,
                        null
                    );

                    const b64SolicitudConsejo =
                        this.resolucionForm.get('conceptoComite').value ===
                        'Aprobado'
                            ? await this.formatFileString(
                                  this.FileSolicitudConsejo,
                                  null
                              )
                            : '';

                    const { numeroActa, fechaActa, linkSolicitudConsejo } =
                        this.resolucionForm.value;

                    const resolucionData =
                        this.resolucionForm.get('conceptoComite').value ==
                        'Aprobado'
                            ? {
                                  actaFechaRespuestaComite: [
                                      {
                                          conceptoComite: 'APROBADO',
                                          numeroActa,
                                          fechaActa,
                                      },
                                  ],
                                  envioEmail: {
                                      asunto: this.resolucionForm.get(
                                          'asuntoComite'
                                      ).value,
                                      mensaje:
                                          this.resolucionForm.get(
                                              'mensajeComite'
                                          ).value,
                                  },
                                  linkSolicitudConsejo,
                                  obtenerDocumentosParaEnvioConsejo: {
                                      b64FormatoBEv1: this.formatoBEv1,
                                      b64FormatoBEv2: this.formatoBEv2,
                                      b64SolicitudConsejo,
                                      b64AnteproyectoFinal,
                                  },
                              }
                            : {
                                  actaFechaRespuestaComite: [
                                      {
                                          conceptoComite: 'NO_APROBADO',
                                          numeroActa,
                                          fechaActa,
                                      },
                                  ],
                                  envioEmail: {
                                      asunto: this.resolucionForm.get(
                                          'asuntoComite'
                                      ).value,
                                      mensaje:
                                          this.resolucionForm.get(
                                              'mensajeComite'
                                          ).value,
                                  },
                              };

                    await lastValueFrom(
                        this.resolucionService.createResolucionCoordinadorFase2(
                            resolucionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase3Created == false &&
                    this.updateCoordinadorFase2 == false &&
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE3_GENERACION_RESOLUCION
                ) {
                    await lastValueFrom(
                        this.resolucionService.createResolucionCoordinadorFase3(
                            this.resolucionForm.value,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase1Created == true &&
                    (this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE1_GENERACION_RESOLUCION ||
                        this.estado ==
                            EstadoProceso.DEVUELTO_GENERACION_DE_RESOLUCION_POR_COORDINADOR ||
                        this.updateCoordinadorFase1 == true)
                ) {
                    const resolucionData =
                        this.resolucionForm.get('conceptoDocumentosCoordinador')
                            .value == 'Aceptado'
                            ? {
                                  conceptoDocumentosCoordinador: 'ACEPTADO',
                              }
                            : {
                                  conceptoDocumentosCoordinador: 'RECHAZADO',
                                  envioEmail: {
                                      asunto: this.resolucionForm.get(
                                          'asuntoCoordinador'
                                      ).value,
                                      mensaje:
                                          this.resolucionForm.get(
                                              'mensajeCoordinador'
                                          ).value,
                                  },
                              };

                    await lastValueFrom(
                        this.resolucionService.updateResolucionCoordinadorFase1(
                            resolucionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase2Created == true &&
                    (this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE2_GENERACION_RESOLUCION ||
                        this.estado ==
                            EstadoProceso.DEVUELTO_GENERACION_DE_RESOLUCION_POR_COMITE ||
                        this.updateCoordinadorFase2 == true)
                ) {
                    const b64AnteproyectoFinal = await this.formatFileString(
                        this.FileAnteproyectoFinal,
                        null
                    );

                    const b64SolicitudConsejo =
                        this.resolucionForm.get('conceptoComite').value ===
                        'Aprobado'
                            ? await this.formatFileString(
                                  this.FileSolicitudConsejo,
                                  null
                              )
                            : '';

                    const { numeroActa, fechaActa, linkSolicitudConsejo } =
                        this.resolucionForm.value;

                    const resolucionData =
                        this.resolucionForm.get('conceptoComite').value ==
                        'Aprobado'
                            ? {
                                  actaFechaRespuestaComite: [
                                      {
                                          conceptoComite: 'APROBADO',
                                          numeroActa,
                                          fechaActa,
                                      },
                                  ],
                                  envioEmail: {
                                      asunto: this.resolucionForm.get(
                                          'asuntoComite'
                                      ).value,
                                      mensaje:
                                          this.resolucionForm.get(
                                              'mensajeComite'
                                          ).value,
                                  },
                                  linkSolicitudConsejo,
                                  obtenerDocumentosParaEnvioConsejo: {
                                      b64FormatoBEv1: this.formatoBEv1,
                                      b64FormatoBEv2: this.formatoBEv2,
                                      b64SolicitudConsejo,
                                      b64AnteproyectoFinal,
                                  },
                              }
                            : {
                                  actaFechaRespuestaComite: [
                                      {
                                          conceptoComite: 'NO_APROBADO',
                                          numeroActa,
                                          fechaActa,
                                      },
                                  ],
                                  envioEmail: {
                                      asunto: this.resolucionForm.get(
                                          'asuntoComite'
                                      ).value,
                                      mensaje:
                                          this.resolucionForm.get(
                                              'mensajeComite'
                                          ).value,
                                  },
                              };

                    await lastValueFrom(
                        this.resolucionService.updateResolucionCoordinadorFase2(
                            resolucionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    (this.isCoordinadorFase3Created == true &&
                        this.estado ==
                            EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE3_GENERACION_RESOLUCION) ||
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_DOCENTE_SUSTENTACION
                ) {
                    const b64OficioConsejo = await this.formatFileString(
                        this.FileOficioConsejo,
                        'linkOficioConsejo'
                    );

                    const { linkOficioConsejo, ...restFormValues } =
                        this.resolucionForm.value;

                    const resolucionData = {
                        ...restFormValues,
                        linkOficioConsejo: b64OficioConsejo,
                    };
                    await lastValueFrom(
                        this.resolucionService.updateResolucionCoordinadorFase3(
                            resolucionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else {
                    this.isSending = false;
                    this.messageService.clear();
                    return this.messageService.add(
                        errorMessage('No puedes modificar los datos.')
                    );
                }
            }
            this.isSending = false;
            this.messageService.clear();
            this.messageService.add(infoMessage(Mensaje.ACTUALIZACION_EXITOSA));
            this.router.navigate(['examen-de-valoracion']);
        } catch (error) {
            this.isSending = false;
            this.handlerResponseException(error);
        }
    }

    async createResolucion(): Promise<void> {
        this.isSending = true;
        try {
            if (this.role.includes('ROLE_DOCENTE') && !this.isDocenteCreated) {
                const response = await firstValueFrom(
                    this.resolucionService.createResolucionDocente(
                        this.resolucionForm.value,
                        this.trabajoDeGradoId
                    )
                );

                if (response) {
                    this.trabajoDeGradoService.setResolucionSeleccionada(
                        response
                    );
                    this.messageService.clear();
                    this.messageService.add(
                        infoMessage(Mensaje.GUARDADO_EXITOSO)
                    );

                    await firstValueFrom(timer(2000));
                    this.router.navigate(['examen-de-valoracion']);
                }
            }
        } catch (e) {
            this.handlerResponseException(e);
        } finally {
            this.isSending = false;
        }
    }

    createOrUpdateResolucion() {
        if (this.resolucionForm.invalid) {
            this.messageService.clear();
            this.messageService.add(
                warnMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS)
            );
            return;
        }

        this.router.url.includes('editar')
            ? this.updateResolucion()
            : this.createResolucion();
    }

    onFileSelectAnteproyectoFinal(event: any) {
        this.FileAnteproyectoFinal = this.uploadFileAndSetValue(
            'linkAnteproyectoFinal',
            event
        );
    }

    onFileSelectSolicitudComite(event: any) {
        this.FileSolicitudComite = this.uploadFileAndSetValue(
            'linkSolicitudComite',
            event
        );
    }

    onFileSelectSolicitudConsejo(event: any) {
        this.FileSolicitudConsejo = this.uploadFileAndSetValue(
            'linkSolicitudConsejo',
            event
        );
    }

    onFileSelectOficioConsejo(event: any) {
        this.FileOficioConsejo = this.uploadFileAndSetValue(
            'linkOficioConsejo',
            event
        );
    }

    onFileClear(field: string) {
        if (field == 'linkAnteproyectoFinal') {
            this.FileAnteproyectoFinal = null;
            this.AnteproyectoFinal.clear();
            this.resolucionForm.get('linkAnteproyectoFinal').reset();
        }
        if (field == 'linkSolicitudComite') {
            this.FileSolicitudComite = null;
            this.SolicitudComite.clear();
            this.resolucionForm.get('linkSolicitudComite').reset();
        }
        if (field == 'linkSolicitudConsejo') {
            this.FileSolicitudConsejo = null;
            this.SolicitudConsejo.clear();
            this.resolucionForm.get('linkSolicitudConsejo').reset();
        }
        if (field == 'linkOficioConsejo') {
            this.FileOficioConsejo = null;
            this.OficioConsejo.clear();
            this.resolucionForm.get('linkOficioConsejo').reset();
        }
    }

    async formatFileString(file: any, fileControlName: string): Promise<any> {
        try {
            const base64 = await this.convertFileToBase64(file);
            if (fileControlName != null) {
                return `${fileControlName}.pdf-${base64}`;
            } else {
                return `${base64}`;
            }
        } catch (error) {
            console.error('Error al convertir el archivo a base64:', error);
            throw error;
        }
    }

    convertBase64ToFile(
        base64: string,
        fileName: string,
        fileType: string
    ): File {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new File([byteArray], fileName, { type: fileType });
    }

    convertFileToBase64(file: File | Blob): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!(file instanceof File || file instanceof Blob)) {
                reject(new Error('El parámetro no es de tipo File o Blob'));
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result as string;
                const base64 = base64String.split(',')[1];
                resolve(base64);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsDataURL(file);
        });
    }

    uploadFileAndSetValue(fileControlName: string, event: any) {
        const selectedFiles: FileList = event.files;
        const maxFileSize = 20000000; // 20 MB
        if (selectedFiles && selectedFiles.length > 0) {
            const selectedFile = selectedFiles[0];
            if (selectedFile.size > maxFileSize) {
                this.messageService.clear();
                this.messageService.add(
                    errorMessage(Aviso.ARCHIVO_DEMASIADO_GRANDE)
                );
                return null;
            }
            const fileType = selectedFile.type.split('/')[1];
            this.convertFileToBase64(selectedFile)
                .then((base64) => {
                    this.resolucionForm
                        .get(fileControlName)
                        .setValue(`${fileControlName}.${fileType}-${base64}`);
                })
                .catch((error) => {
                    console.error(
                        'Error al convertir el archivo a base64:',
                        error
                    );
                });
            return selectedFile;
        }
        return null;
    }

    isValidFilePath = (filePath: string): boolean => {
        return filePath.startsWith('./files/') && filePath.includes('.pdf');
    };

    async getFileAndSetValue(fieldName: string): Promise<void> {
        const handleError = () => {
            this.messageService.clear();
            this.messageService.add(
                warnMessage('Modifica la información para ver los cambios.')
            );
        };

        try {
            const rutaArchivo = this.resolucionForm.get(fieldName).value;

            if (this.isValidFilePath(rutaArchivo)) {
                const response: string = await firstValueFrom(
                    this.trabajoDeGradoService.getFile(rutaArchivo)
                );
                const byteCharacters = atob(response);
                const byteNumbers = Array.from(byteCharacters).map((char) =>
                    char.charCodeAt(0)
                );
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray]);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                const extension = rutaArchivo.slice(
                    rutaArchivo.lastIndexOf('.') + 1
                );
                a.style.display = 'none';
                a.href = url;
                a.download = `${fieldName}.${extension}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                handleError();
            }
        } catch (error) {
            handleError();
        }
    }

    //#region Director and Coodirector
    showBuscadorDirector() {
        return this.dialogService.open(BuscadorDocentesComponent, {
            header: 'Seleccionar docente',
            width: '60%',
            styleClass: 'custom-docente-dialog',
        });
    }

    showBuscadorCodirector() {
        return this.dialogService.open(BuscadorDocentesComponent, {
            header: 'Seleccionar docente',
            width: '60%',
            styleClass: 'custom-experto-dialog',
        });
    }

    mapDirectorLabel(docente: any) {
        return {
            id: docente.id,
            nombre: docente.nombre,
            apellido: docente.apellido,
            correo: docente.correoElectronico ?? docente.correo,
            universidad: docente.universidad,
        };
    }

    mapCodirectorLabel(docente: any) {
        return {
            id: docente.id,
            nombre: docente.nombre,
            apellido: docente.apellido,
            correo: docente.correoElectronico ?? docente.correo,
            universidad: docente.universidad,
        };
    }

    async onSeleccionarDirector(): Promise<void> {
        const ref = this.showBuscadorDirector();
        try {
            const response = await firstValueFrom(ref.onClose);
            if (response) {
                const director = this.mapDirectorLabel(response);
                if (
                    this.codirectorSeleccionado &&
                    director.id === this.codirectorSeleccionado.id
                ) {
                    this.messageService.clear();
                    this.messageService.add(
                        warnMessage(
                            'El director seleccionado no puede ser el mismo que el codirector.'
                        )
                    );
                    return;
                }
                this.directorSeleccionado = director;
                this.director.setValue(director.id);
            }
        } catch (error) {
            console.error('Error al seleccionar director:', error);
        }
    }

    async onSeleccionarCodirector(): Promise<void> {
        const ref = this.showBuscadorCodirector();
        try {
            const response = await firstValueFrom(ref.onClose);
            if (response) {
                const codirector = this.mapCodirectorLabel(response);
                if (
                    this.directorSeleccionado &&
                    codirector.id === this.directorSeleccionado.id
                ) {
                    this.messageService.clear();
                    this.messageService.add(
                        warnMessage(
                            'El codirector seleccionado no puede ser el mismo que el director.'
                        )
                    );
                    return;
                }
                this.codirectorSeleccionado = codirector;
                this.codirector.setValue(codirector.id);
            }
        } catch (error) {
            console.error('Error al seleccionar codirector:', error);
        }
    }

    limpiarCodirector() {
        this.codirector.setValue(null);
        this.codirectorSeleccionado = null;
    }

    limpiarDirector() {
        this.director.setValue(null);
        this.directorSeleccionado = null;
    }
    //#endregion

    redirectToSolicitud(trabajoDeGradoId: number) {
        this.router.navigate([
            `examen-de-valoracion/solicitud/editar/${trabajoDeGradoId}`,
        ]);
    }

    redirectToRespuesta() {
        this.router.navigate(['examen-de-valoracion/respuesta']);
    }

    redirectToSustentacion(sustentacionId: number) {
        sustentacionId
            ? this.router.navigate([
                  `examen-de-valoracion/sustentacion/editar/${this.trabajoDeGradoId}`,
              ])
            : this.router.navigate(['examen-de-valoracion/sustentacion']);
    }

    redirectToBandeja() {
        this.router.navigate(['examen-de-valoracion']);
    }

    handlerResponseException(response: any): void {
        if (response.status === 500 || response.status === 409) {
            const errorMsg =
                response?.error?.mensaje ||
                response?.error ||
                'Error al actualizar los datos en el backend';
            this.messageService.clear();
            this.messageService.add(errorMessage(errorMsg));
        }
    }

    isActiveIndex(): Boolean {
        if (this.router.url.includes('resolucion')) {
            return true;
        }
        return false;
    }

    getButtonLabel(): string {
        if (this.role.includes('ROLE_DOCENTE') && this.isDocenteCreated) {
            return 'Modificar Informacion';
        }
        if (
            this.role.includes('ROLE_COORDINADOR') &&
            this.isCoordinadorFase1Created &&
            this.isCoordinadorFase2Created &&
            this.isCoordinadorFase3Created
        ) {
            return 'Modificar Informacion';
        } else {
            return 'Guardar';
        }
    }
}
