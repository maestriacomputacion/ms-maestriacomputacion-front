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
import { v4 as uuidv4 } from 'uuid';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { FileUpload } from 'primeng/fileupload';
import { Aviso, EstadoProceso, Mensaje } from 'src/app/core/enums/enums';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { Docente } from 'src/app/modules/gestion-docentes/models/docente';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import { BuscadorDocentesComponent } from 'src/app/shared/components/buscador-docentes/buscador-docentes.component';
import { BuscadorExpertosComponent } from 'src/app/shared/components/buscador-expertos/buscador-expertos.component';
import { DocenteService } from 'src/app/shared/services/docente.service';
import { ExpertoService } from 'src/app/shared/services/experto.service';
import { AutenticacionService } from 'src/app/modules/gestion-autenticacion/services/autenticacion.service';
import { Experto } from '../../models/experto';
import { Solicitud } from '../../models/solicitud';
import { RespuestaService } from '../../services/respuesta.service';
import { ResolucionService } from '../../services/resolucion.service';
import { SolicitudService } from '../../services/solicitud.service';
import { TrabajoDeGradoService } from '../../services/trabajoDeGrado.service';
import { DocumentoFormatoBService } from '../../services/docs/documentoFormatoB.service';
import { DocumentoFormatoCService } from '../../services/docs/documentoFormatoC.service';

@Component({
    selector: 'app-solicitud-examen',
    templateUrl: 'solicitud-examen.component.html',
    styleUrls: ['solicitud-examen.component.scss'],
})
export class SolicitudExamenComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();
    solicitudForm: FormGroup;

    private checkboxChangeSubject = new Subject<boolean>();
    checkboxChange$ = this.checkboxChangeSubject.asObservable();

    @ViewChild('FormatoA') FormatoA!: FileUpload;
    @ViewChild('FormatoD') FormatoD!: FileUpload;
    @ViewChild('FormatoE') FormatoE!: FileUpload;
    @ViewChild('OficioDirigidoEvaluadores')
    OficioDirigidoEvaluadores!: FileUpload;

    private subscriptions: Subscription = new Subscription();
    private checkboxCoordinadorSubscription: Subscription;
    private checkboxComiteSubscription: Subscription;
    private checkboxFormSubscription: Subscription;
    private estudianteSubscription: Subscription;
    private trabajoSeleccionadoSubscription: Subscription;
    private resolucionSubscription: Subscription;
    private sustentacionSubscription: Subscription;
    private solicitudSubscription: Subscription;
    private solicitudValidSubscription: Subscription;
    private respuestaValidSubscription: Subscription;
    private resolucionValidSubscription: Subscription;

    currentPdfIndex: number = 0;
    resolucionId: number;
    solicitudId: number;
    sustentacionId: number;
    trabajoDeGradoId: number;

    displayFormatos: boolean = false;
    displayFormatoA: boolean = false;
    displayFormatoOficioDirigidoEvaluadores: boolean = false;
    displayModal: boolean = false;
    errorMessageShown: boolean = false;
    editMode: boolean = false;
    isLoading: boolean;
    isSending: boolean;
    isDocente: boolean = false;
    isCoordinadorFase1: boolean = false;
    isCoordinadorFase2: boolean = false;
    isDocenteCreated: boolean = false;
    isCoordinadorFase1Created: boolean = false;
    isCoordinadorFase2Created: boolean = false;
    isPdfLoaded: boolean = false;
    isSolicitudValid: boolean = false;
    isRespuestaValid: boolean = false;
    isRespuestaCreated: boolean = false;
    isResolucionValid: boolean = false;
    isSustentacionValid: boolean = false;
    isReviewed: boolean = false;
    updateCoordinadorFase1: boolean = false;
    messageShown: boolean = false;
    messageInterval: string = '';

    estudianteSeleccionado: Estudiante;
    evaluadorInternoSeleccionado: Docente;
    evaluadorExternoSeleccionado: Experto;

    FileFormatoA: File | null;
    FileFormatoD: File | null;
    FileFormatoE: File | null;
    FileOficioDirigidoEvaluadores: File | null;
    formatoA: File | null;
    formatoBPreview: File | null;
    formatoCEv1Preview: File | null;
    formatoCEv2Preview: File | null;
    formatoB: File | null;
    formatoCEv1: File | null;
    formatoCEv2: File | null;

    anexosFiles: File[] = [];
    anexosBase64: { linkAnexo: string }[] = [];
    estadosRespuesta: string[] = ['Avalado', 'No Avalado'];
    estadosVerificacion: string[] = ['Aceptado', 'Rechazado'];
    pdfUrls: { name: string; url: string }[] = [];
    role: string[];

    currentFormat: string = 'formatoBEv1';
    estado: string;

    maxDate: Date;
    maxDateEvaluacion: Date;
    minDateEvaluacion: Date;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private dialogService: DialogService,
        private trabajoDeGradoService: TrabajoDeGradoService,
        private solicitudService: SolicitudService,
        private respuestaService: RespuestaService,
        private resolucionService: ResolucionService,
        private autenticacion: AutenticacionService,
        private docenteService: DocenteService,
        private expertoService: ExpertoService,
        private documentoFormatoBService: DocumentoFormatoBService,
        private documentoFormatoCService: DocumentoFormatoCService
    ) {
        this.maxDate = new Date();
    }

    get fechaMaximaEvaluacion(): FormControl {
        return this.solicitudForm.get('fechaMaximaEvaluacion') as FormControl;
    }

    get evaluadorExterno(): FormControl {
        return this.solicitudForm.get('idEvaluadorExterno') as FormControl;
    }

    get evaluadorInterno(): FormControl {
        return this.solicitudForm.get('idEvaluadorInterno') as FormControl;
    }

    ngOnInit() {
        this.initializeComponent();
    }

    async initializeComponent() {
        this.role = this.autenticacion.getRole();
        this.subscribeToEstudiante();
        this.initForm();
        if (this.router.url.includes('editar')) {
            await this.subscribeToObservers();
            this.loadEditMode();
        }
        this.checkEstados();
    }

    async loadEditMode() {
        this.editMode = true;
        await this.loadSolicitud();

        let detailMessage = '';

        if (this.isResolucionValid) {
            detailMessage =
                'Por favor, dirígete a la fase de Sustentación del Proyecto de Investigación.';
        } else if (this.isRespuestaValid) {
            detailMessage =
                'Por favor, dirígete a la fase de Generación de Resolución.';
        } else if (
            this.isCoordinadorFase2Created &&
            this.solicitudForm.get('conceptoComite').value == 'Avalado'
        ) {
            detailMessage =
                'Por favor, dirígete a la fase de Respuesta al Examen de Valoración.';
        } else {
            detailMessage = null;
        }

        if (detailMessage) {
            this.messageService.clear();
            this.messageService.add({
                severity: 'info',
                summary: 'Información',
                detail: detailMessage,
                life: 6000,
            });
        }
    }

    initForm(): void {
        this.solicitudForm = this.fb.group({
            titulo: [null, Validators.required],
            linkFormatoA: [null, Validators.required],
            linkFormatoD: [null, Validators.required],
            linkFormatoE: [null, Validators.required],
            anexos: [[]],
            idEvaluadorExterno: [null, Validators.required],
            idEvaluadorInterno: [null, Validators.required],
            asuntoCoordinador: [null],
            mensajeCoordinador: [null],
            asuntoComite: [null],
            mensajeComite: [null],
            conceptoCoordinadorDocumentos: [null, Validators.required],
            conceptoComite: [null, Validators.required],
            numeroActa: [null, Validators.required],
            fechaActa: [null, Validators.required],
            linkOficioDirigidoEvaluadores: [null, Validators.required],
            fechaMaximaEvaluacion: [null, Validators.required],
        });

        this.formReady.emit(this.solicitudForm);

        this.checkboxCoordinadorSubscription = this.solicitudForm
            .get('conceptoCoordinadorDocumentos')
            .valueChanges.subscribe((value) => {
                if (value == 'Rechazado') {
                    this.solicitudForm
                        .get('asuntoCoordinador')
                        .setValue(
                            'Correcion de solicitud examen de valoracion'
                        );
                    this.solicitudForm
                        .get('mensajeCoordinador')
                        .setValue(
                            'Por favor, revise y ajuste la solicitud según las indicaciones proporcionadas.'
                        );
                }
            });

        this.checkboxComiteSubscription = this.solicitudForm
            .get('conceptoComite')
            .valueChanges.subscribe((value) => {
                if (value == 'Avalado') {
                    this.solicitudForm
                        .get('asuntoComite')
                        .setValue('Documentos enviados para revisión');
                    this.solicitudForm
                        .get('mensajeComite')
                        .setValue(
                            'Se han enviado los documentos para su revisión. Agradecemos su pronta respuesta.'
                        );
                    this.isReviewed = false;
                }
                if (value == 'No Avalado') {
                    this.solicitudForm
                        .get('asuntoComite')
                        .setValue('Envío de corrección por parte del comité');
                    this.solicitudForm
                        .get('mensajeComite')
                        .setValue(
                            'Por favor, revise y ajuste la solicitud según las indicaciones del comité y proporcione una respuesta a la brevedad.'
                        );
                    this.isReviewed = true;
                }
            });

        if (!this.router.url.includes('editar')) {
            this.checkboxFormSubscription =
                this.solicitudForm.valueChanges.subscribe((value) => {
                    localStorage.setItem(
                        'solicitudFormState',
                        JSON.stringify(value)
                    );
                    this.trabajoDeGradoService.setTituloSeleccionadoSubject(
                        value.titulo
                    );
                });

            const savedState = localStorage.getItem('solicitudFormState');
            if (savedState) {
                const data = JSON.parse(savedState);
                this.solicitudForm.get('titulo').setValue(data.titulo);
                this.trabajoDeGradoService.setTituloSeleccionadoSubject(
                    data.titulo
                );
                this.setupEvaluadores(data);
            }
        }

        this.maxDateEvaluacion = new Date();
        this.minDateEvaluacion = new Date();
        this.maxDateEvaluacion.setDate(this.maxDateEvaluacion.getDate() + 15);
        this.messageInterval = `Plazo normal hasta: ${this.maxDateEvaluacion.toLocaleDateString()}`;

        this.setupIsReviewedCheckBox();
    }

    async setupEvaluadores(data: any): Promise<void> {
        if (data?.idEvaluadorExterno) {
            try {
                const responseExterno = await firstValueFrom(
                    this.expertoService.obtenerExperto(data.idEvaluadorExterno)
                );
                if (responseExterno) {
                    this.evaluadorExternoSeleccionado =
                        this.mapEvaluadorExternoLabel(responseExterno);
                    this.trabajoDeGradoService.setEvaluadorExternoSeleccionadoSubject(
                        this.evaluadorExternoSeleccionado
                    );
                    this.evaluadorExterno.setValue(responseExterno.id);
                }
            } catch (error) {
                console.error('Error al obtener evaluador externo:', error);
            }
        }

        if (data?.idEvaluadorInterno) {
            try {
                const responseInterno = await firstValueFrom(
                    this.docenteService.obtenerDocente(data.idEvaluadorInterno)
                );
                if (responseInterno) {
                    this.evaluadorInternoSeleccionado =
                        this.mapEvaluadorInternoLabel(responseInterno);
                    this.trabajoDeGradoService.setEvaluadorInternoSeleccionadoSubject(
                        this.evaluadorInternoSeleccionado
                    );
                    this.evaluadorInterno.setValue(responseInterno.id);
                }
            } catch (error) {
                console.error('Error al obtener evaluador interno:', error);
            }
        }
    }

    async setupIsReviewedCheckBox() {
        try {
            const value = await firstValueFrom(this.checkboxChange$);
            if (value && !this.messageShown) {
                this.messageService.clear();
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

    subscribeToEstudiante() {
        this.estudianteSubscription =
            this.trabajoDeGradoService.estudianteSeleccionado$.subscribe({
                next: (response) => {
                    if (response) {
                        this.estudianteSeleccionado = response;
                    } else {
                        const isDocenteOrEstudiante =
                            this.role.includes('ROLE_DOCENTE') ||
                            this.role.includes('ROLE_ESTUDIANTE');
                        if (isDocenteOrEstudiante) {
                            this.router.navigate(['examen-de-valoracion']);
                        }
                    }
                },
                error: (e) => {
                    this.handlerResponseException(e);
                },
            });
    }

    subscribeToObservers(): Promise<void> {
        return new Promise<void>((resolve) => {
            let pendingObservables = 4;

            const checkCompletion = () => {
                pendingObservables--;
                if (pendingObservables === 0) {
                    resolve();
                }
            };

            this.trabajoSeleccionadoSubscription =
                this.trabajoDeGradoService.trabajoSeleccionadoSubject$.subscribe(
                    {
                        next: (response) => {
                            if (response) {
                                this.trabajoDeGradoId = response.id;
                                this.estado = response.estado;

                                this.solicitudValidSubscription =
                                    this.solicitudService
                                        .getSolicitudCoordinadorFase2(
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
                                                    response?.actaFechaRespuestaComite
                                                ) {
                                                    const respuestaComite =
                                                        response.actaFechaRespuestaComite.find(
                                                            (respuesta: any) =>
                                                                respuesta.conceptoComite ===
                                                                'APROBADO'
                                                        );

                                                    if (respuestaComite) {
                                                        this.isSolicitudValid =
                                                            true;
                                                    }
                                                }
                                            },
                                        });

                                this.respuestaValidSubscription =
                                    this.respuestaService
                                        .getRespuestasExamen(
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
                                                    response?.evaluador_externo &&
                                                    response?.evaluador_interno
                                                ) {
                                                    const evaluadorExternoAprobado =
                                                        response.evaluador_externo.find(
                                                            (evaluador: any) =>
                                                                evaluador.respuestaExamenValoracion ===
                                                                'APROBADO'
                                                        );

                                                    const evaluadorInternoAprobado =
                                                        response.evaluador_interno.find(
                                                            (evaluador: any) =>
                                                                evaluador.respuestaExamenValoracion ===
                                                                'APROBADO'
                                                        );

                                                    if (
                                                        evaluadorExternoAprobado &&
                                                        evaluadorInternoAprobado
                                                    ) {
                                                        this.isRespuestaValid =
                                                            true;
                                                    }
                                                }
                                            },
                                        });

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
                                                    this.isResolucionValid =
                                                        true;
                                                }
                                            },
                                        });

                                checkCompletion();
                            } else {
                                this.router.navigate(['examen-de-valoracion']);
                            }
                        },
                        error: (e) => {
                            this.handlerResponseException(e);
                            checkCompletion();
                        },
                    }
                );

            this.solicitudSubscription =
                this.trabajoDeGradoService.solicitudSeleccionadaSubject$.subscribe(
                    {
                        next: (response) => {
                            if (response) {
                                this.solicitudId = response.id;
                                checkCompletion();
                            }
                        },
                        error: (e) => {
                            this.handlerResponseException(e);
                            checkCompletion();
                        },
                    }
                );

            this.resolucionSubscription =
                this.trabajoDeGradoService.resolucionSeleccionadaSubject$.subscribe(
                    {
                        next: (response) => {
                            if (response) {
                                this.resolucionId = response.id;
                            }
                            checkCompletion();
                        },
                        error: (e) => {
                            this.handlerResponseException(e);
                            checkCompletion();
                        },
                    }
                );

            this.sustentacionSubscription =
                this.trabajoDeGradoService.sustentacionSeleccionadaSubject$.subscribe(
                    {
                        next: (response) => {
                            if (response) {
                                this.sustentacionId = response.id;
                            }
                            checkCompletion();
                        },
                        error: (e) => {
                            this.handlerResponseException(e);
                            checkCompletion();
                        },
                    }
                );
        });
    }

    updateFormFields(role: string[]): void {
        const formControls = this.solicitudForm.controls;

        for (const control in formControls) {
            formControls[control].disable();
        }

        if (role.includes('ROLE_DOCENTE')) {
            formControls['titulo'].enable();
            formControls['linkFormatoA'].enable();
            formControls['linkFormatoD'].enable();
            formControls['linkFormatoE'].enable();
            formControls['anexos'].enable();
            formControls['idEvaluadorExterno'].enable();
            formControls['idEvaluadorInterno'].enable();
        }

        if (role.includes('ROLE_COORDINADOR')) {
            if (this.isDocente && !this.isCoordinadorFase1) {
                formControls['conceptoCoordinadorDocumentos'].enable();
                formControls['asuntoCoordinador'].enable();
                formControls['mensajeCoordinador'].enable();
            }
            if (this.isCoordinadorFase1 && !this.isRespuestaCreated) {
                this.solicitudForm
                    .get('conceptoComite')
                    .valueChanges.subscribe((value) => {
                        if (value == 'Avalado') {
                            formControls[
                                'linkOficioDirigidoEvaluadores'
                            ].enable();
                            formControls['fechaMaximaEvaluacion'].enable();
                        } else if (value == 'No Avalado') {
                            formControls[
                                'linkOficioDirigidoEvaluadores'
                            ].disable();
                            formControls['fechaMaximaEvaluacion'].disable();
                        }
                    });
                formControls['conceptoComite'].enable();
                formControls['asuntoComite'].enable();
                formControls['mensajeComite'].enable();
                formControls['numeroActa'].enable();
                formControls['fechaActa'].enable();
            }
        }
    }

    ngOnDestroy() {
        if (this.estudianteSubscription) {
            this.estudianteSubscription.unsubscribe();
        }
        if (this.trabajoSeleccionadoSubscription) {
            this.trabajoSeleccionadoSubscription.unsubscribe();
        }
        if (this.solicitudSubscription) {
            this.solicitudSubscription.unsubscribe();
        }
        if (this.solicitudValidSubscription) {
            this.solicitudValidSubscription.unsubscribe();
        }
        if (this.respuestaValidSubscription) {
            this.respuestaValidSubscription.unsubscribe();
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
            case EstadoProceso.SIN_REGISTRAR_SOLICITUD_EXAMEN_DE_VALORACION:
                this.isDocente = false;
                this.isCoordinadorFase1 = false;
                this.isCoordinadorFase2 = false;
                break;
            case EstadoProceso.PENDIENTE_REVISION_COORDINADOR:
                this.isDocente = true;
                this.isCoordinadorFase1 = false;
                this.isCoordinadorFase2 = false;
                break;
            case EstadoProceso.DEVUELTO_EXAMEN_DE_VALORACION_POR_COORDINADOR:
                this.messageService.clear();
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: EstadoProceso.DEVUELTO_EXAMEN_DE_VALORACION_POR_COORDINADOR,
                    life: 2000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = false;
                this.isCoordinadorFase2 = false;
                break;
            case EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR:
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = false;
                break;
            case EstadoProceso.DEVUELTO_EXAMEN_DE_VALORACION_POR_COMITE:
                this.messageService.clear();
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: EstadoProceso.DEVUELTO_EXAMEN_DE_VALORACION_POR_COMITE,
                    life: 2000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = false;
                break;
            case EstadoProceso.PENDIENTE_RESULTADO_EXAMEN_DE_VALORACION:
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = true;
                break;
            default:
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = true;
                this.isRespuestaCreated = true;
                break;
        }

        this.updateFormFields(this.role);
    }

    editFase(event: any) {
        this.confirmationService.confirm({
            target: event.target,
            message: '¿Estás seguro de que deseas realizar esta acción?',
            icon: PrimeIcons.STEP_BACKWARD,
            acceptLabel: 'Si, Modificar',
            rejectLabel: 'No',
            accept: () => {
                this.isDocente = true;
                this.isCoordinadorFase1 = false;
                this.isCoordinadorFase2 = false;
                this.updateCoordinadorFase1 = true;
                this.updateFormFields(this.role);
            },
        });
    }

    //#region PDF VIEWER
    async loadPdfFiles() {
        const filesToConvert = [];

        if (this.role.includes('ROLE_DOCENTE')) {
            filesToConvert.push(
                {
                    file: this.FileFormatoA,
                    fieldName: 'Solicitud Examen de Valoración',
                },
                {
                    file: this.FileFormatoD,
                    fieldName: 'Anteproyecto presentado a Examen',
                },
                { file: this.FileFormatoE, fieldName: 'Examen de valoración' },
                ...this.anexosFiles.map((file) => ({
                    file,
                    fieldName: 'Anexo',
                }))
            );
        } else if (
            this.role.includes('ROLE_COORDINADOR') &&
            (this.estado == EstadoProceso.PENDIENTE_REVISION_COORDINADOR ||
                this.estado ==
                    EstadoProceso.DEVUELTO_EXAMEN_DE_VALORACION_POR_COORDINADOR ||
                this.estado ==
                    EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR ||
                this.estado ==
                    EstadoProceso.DEVUELTO_EXAMEN_DE_VALORACION_POR_COMITE ||
                this.estado ==
                    EstadoProceso.PENDIENTE_RESULTADO_EXAMEN_DE_VALORACION)
        ) {
            filesToConvert.push(
                {
                    file: this.FileOficioDirigidoEvaluadores,
                    fieldName: 'Oficio Dirigido a Evaluadores',
                },
                {
                    file: this.FileFormatoA,
                    fieldName: 'Solicitud Examen de Valoración',
                },
                {
                    file: this.FileFormatoD,
                    fieldName: 'Anteproyecto presentado a Examen',
                },
                { file: this.FileFormatoE, fieldName: 'Examen de valoración' },
                ...this.anexosFiles.map((file) => ({
                    file,
                    fieldName: 'Anexo',
                })),
                {
                    file: this.formatoBPreview,
                    fieldName: 'Formato B - Evaluador Interno y Externo',
                },
                {
                    file: this.formatoCEv1Preview,
                    fieldName: 'Formato C - Evaluador Interno',
                },
                {
                    file: this.formatoCEv2Preview,
                    fieldName: 'Formato C - Evaluador Externo',
                }
            );
        }

        const errorFiles = new Set<File>();

        try {
            for (const { file, fieldName } of filesToConvert) {
                if (file) {
                    try {
                        const url = URL.createObjectURL(file);
                        this.pdfUrls.push({
                            name: `${fieldName}`,
                            url,
                        });
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

    async openModalAndFormatos() {
        this.displayModal = true;
        this.isLoading = true;
        try {
            const objFormatoB = await firstValueFrom(
                this.documentoFormatoBService.generateDocuments(
                    {
                        titulo: this.solicitudForm.get('titulo').value,
                        programa: 'Maestría en Computación',
                    },
                    this.estudianteSeleccionado,
                    this.evaluadorInternoSeleccionado,
                    this.evaluadorExternoSeleccionado
                )
            );

            const objFormatoCEv1 = await firstValueFrom(
                this.documentoFormatoCService.generateDocuments(
                    {
                        titulo: this.solicitudForm.get('titulo').value,
                        coordinador: 'Luz Marina Sierra Martínez',
                        asunto: 'Maestría en Computación',
                    },
                    this.estudianteSeleccionado,
                    this.evaluadorInternoSeleccionado
                )
            );

            const objFormatoCEv2 = await firstValueFrom(
                this.documentoFormatoCService.generateDocuments(
                    {
                        titulo: this.solicitudForm.get('titulo').value,
                        coordinador: 'Luz Marina Sierra Martínez',
                        asunto: 'Maestría en Computación',
                    },
                    this.estudianteSeleccionado,
                    this.evaluadorExternoSeleccionado
                )
            );

            if (objFormatoB && objFormatoCEv1 && objFormatoCEv2) {
                this.handleFormatoBDocxGenerated({
                    doc: objFormatoB.docFormatoB,
                    pdf: objFormatoB.pdfFormatoB,
                });
                this.handleFormatoCEv1DocxGenerated({
                    doc: objFormatoCEv1.docFormatoC,
                    pdf: objFormatoCEv1.pdfFormatoC,
                });
                this.handleFormatoCEv2DocxGenerated({
                    doc: objFormatoCEv2.docFormatoC,
                    pdf: objFormatoCEv2.pdfFormatoC,
                });
                this.loadPdfFiles();
            }
        } catch (error) {
            console.error('Hubo un problema al generar los documentos.');
        } finally {
            this.isLoading = false;
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
        this.displayFormatos = false;
        this.pdfUrls = [];
    }
    //#endregion

    //#region Modal FormatoA, FormatoB and FormatoC
    showFormatoA() {
        this.displayFormatoA = true;
    }

    showFormatoOficioDirigidoEvaluadores() {
        this.displayFormatoOficioDirigidoEvaluadores = true;
    }

    handleFormatoAPdfGenerated(file: File) {
        const pdfFile = new File([file], 'formatoA.pdf', {
            type: 'application/pdf',
        });
        this.FileFormatoA = pdfFile;
        this.convertFileToBase64(pdfFile)
            .then((base64) => {
                this.solicitudForm
                    .get('linkFormatoA')
                    .setValue(`linkFormatoA.pdf-${base64}`);
                this.displayFormatoA = false;
            })
            .catch((error) => {
                console.error('Error al convertir el archivo a base64:', error);
            });
    }

    handleFormatoOficioDirigidoEvaluadoresPdfGenerated(file: File) {
        const pdfFile = new File(
            [file],
            'formatoOficioDirigidoEvaluadores.pdf',
            {
                type: 'application/pdf',
            }
        );
        this.FileOficioDirigidoEvaluadores = pdfFile;
        this.convertFileToBase64(pdfFile)
            .then((base64) => {
                this.solicitudForm
                    .get('linkOficioDirigidoEvaluadores')
                    .setValue(`linkOficioDirigidoEvaluadores.pdf-${base64}`);
                this.displayFormatoOficioDirigidoEvaluadores = false;
            })
            .catch((error) => {
                console.error('Error al convertir el archivo a base64:', error);
            });
    }

    handleFormatoBDocxGenerated(obj: any) {
        const docxFile = new File([obj.doc], 'formatoB.docx', {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        const pdfFile = new File([obj.pdf], 'formatoB.pdf', {
            type: 'application/pdf',
        });
        this.formatoB = docxFile;
        this.formatoBPreview = pdfFile;
    }

    handleFormatoCEv1DocxGenerated(obj: any) {
        const docxFile = new File([obj.doc], 'formatoCEv1.docx', {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        const pdfFile = new File([obj.pdf], 'formatoCEv1.pdf', {
            type: 'application/pdf',
        });
        this.formatoCEv1 = docxFile;
        this.formatoCEv1Preview = pdfFile;
    }

    handleFormatoCEv2DocxGenerated(obj: any) {
        const docxFile = new File([obj.doc], 'formatoCEv2.docx', {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        const pdfFile = new File([obj.pdf], 'formatoCEv2.pdf', {
            type: 'application/pdf',
        });
        this.formatoCEv2 = docxFile;
        this.formatoCEv2Preview = pdfFile;
    }
    //#endregion

    //#region Anexos
    onUpload(event) {
        const maxFileSize = 5000000;
        for (let file of event.files) {
            let uniqueId = uuidv4().replace(/-/g, '').slice(0, 4);
            const selectedFile = file;
            if (selectedFile.size > maxFileSize) {
                this.messageService.clear();
                this.messageService.add(
                    errorMessage(Aviso.ARCHIVO_DEMASIADO_GRANDE)
                );
                return null;
            }
            this.anexosFiles.push(file);
            const fileType = selectedFile.type.split('/')[1];
            this.convertFileToBase64(selectedFile)
                .then((base64) => {
                    this.anexosBase64.push({
                        linkAnexo: `Anexos${uniqueId}.${fileType}-${base64}`,
                    });
                    this.solicitudForm.patchValue({
                        anexos: this.anexosBase64,
                    });
                })
                .catch((error) => {
                    console.error(
                        'Error al convertir el archivo a base64:',
                        error
                    );
                });
        }
    }

    removeFile(index: number) {
        this.anexosFiles.splice(index, 1);
        this.anexosBase64.splice(index, 1);
        this.solicitudForm.get('anexos').setValue(this.anexosFiles);
    }
    //#endregion

    async updateSolicitudExamen() {
        if (this.solicitudForm.invalid) {
            this.messageService.clear();
            this.messageService.add(
                warnMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS)
            );
            return;
        }
        this.isSending = true;
        try {
            if (this.role.includes('ROLE_DOCENTE')) {
                if (
                    this.isDocenteCreated == true &&
                    (this.estado ==
                        EstadoProceso.DEVUELTO_EXAMEN_DE_VALORACION_POR_COORDINADOR ||
                        this.estado ==
                            EstadoProceso.DEVUELTO_EXAMEN_DE_VALORACION_POR_COMITE ||
                        this.estado ==
                            EstadoProceso.PENDIENTE_REVISION_COORDINADOR ||
                        this.estado ==
                            EstadoProceso.EXAMEN_DE_VALORACION_NO_APROBADO_EVALUADOR_1 ||
                        this.estado ==
                            EstadoProceso.EXAMEN_DE_VALORACION_APROBADO_Y_NO_APROBADO_EVALUADOR)
                ) {
                    const formatoA = await this.formatFileString(
                        this.FileFormatoA,
                        'linkFormatoA'
                    );

                    const formatoD = await this.formatFileString(
                        this.FileFormatoD,
                        'linkFormatoD'
                    );

                    const formatoE = await this.formatFileString(
                        this.FileFormatoE,
                        'linkFormatoE'
                    );

                    const anexos = await this.formatFileString(
                        this.anexosFiles,
                        'anexos'
                    );

                    const anexosBase64 = anexos.map(
                        (anexo: string, index: number) => ({
                            linkAnexo: `Anexos${index}.pdf-${anexo}`,
                        })
                    );

                    const solicitudData = {
                        ...this.solicitudForm.value,
                        linkFormatoA: `formatoA.pdf-${formatoA}`,
                        linkFormatoD: `formatoD.pdf-${formatoD}`,
                        linkFormatoE: `formatoE.pdf-${formatoE}`,
                        anexos: anexosBase64,
                    };

                    await lastValueFrom(
                        this.solicitudService.updateSolicitudDocente(
                            solicitudData,
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
                    this.estado == EstadoProceso.PENDIENTE_REVISION_COORDINADOR
                ) {
                    const { asuntoCoordinador, mensajeCoordinador } =
                        this.solicitudForm.value;

                    const solicitudData =
                        this.solicitudForm.get('conceptoCoordinadorDocumentos')
                            .value == 'Aceptado'
                            ? {
                                  conceptoCoordinadorDocumentos: 'ACEPTADO',
                              }
                            : {
                                  conceptoCoordinadorDocumentos: 'RECHAZADO',
                                  envioEmail: {
                                      asunto: asuntoCoordinador,
                                      mensaje: mensajeCoordinador,
                                  },
                              };

                    await lastValueFrom(
                        this.solicitudService.createSolicitudCoordinadorFase1(
                            solicitudData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase2Created == false &&
                    this.updateCoordinadorFase1 == false &&
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR
                ) {
                    const b64FormatoD = await this.formatFileString(
                        this.FileFormatoD,
                        'linkFormatoD'
                    );
                    const b64FormatoE = await this.formatFileString(
                        this.FileFormatoE,
                        'linkFormatoE'
                    );
                    const b64Anexos = await this.formatFileString(
                        this.anexosFiles,
                        'anexos'
                    );

                    const {
                        numeroActa,
                        fechaActa,
                        conceptoComite,
                        asuntoComite,
                        mensajeComite,
                        ...restOfFormValues
                    } = this.solicitudForm.value;

                    let b64FormatoB = null;
                    let b64FormatoCEv1 = null;
                    let b64FormatoCEv2 = null;
                    let b64Oficio = null;

                    if (conceptoComite == 'Avalado') {
                        if (
                            !this.formatoB ||
                            !this.formatoCEv1 ||
                            !this.formatoCEv2
                        ) {
                            this.isSending = false;
                            this.messageService.clear();
                            return this.messageService.add(
                                warnMessage(
                                    'Error: formatos B y C son requeridos.'
                                )
                            );
                        }
                        b64FormatoB = await this.formatFileString(
                            this.formatoB,
                            'formatoB'
                        );
                        b64FormatoCEv1 = await this.formatFileString(
                            this.formatoCEv1,
                            'formatoCEv1'
                        );

                        b64FormatoCEv2 = await this.formatFileString(
                            this.formatoCEv2,
                            'formatoCEv2'
                        );
                        b64Oficio = await this.formatFileString(
                            this.FileOficioDirigidoEvaluadores,
                            'linkOficioDirigidoEvaluadores'
                        );
                    }

                    const solicitudData =
                        conceptoComite == 'Avalado'
                            ? {
                                  ...restOfFormValues,
                                  actaFechaRespuestaComite: [
                                      {
                                          conceptoComite: 'APROBADO',
                                          numeroActa,
                                          fechaActa,
                                      },
                                  ],
                                  envioEmailDto: {
                                      asunto: asuntoComite,
                                      mensaje: mensajeComite,
                                  },
                                  informacionEnvioEvaluador: {
                                      b64FormatoD,
                                      b64FormatoE,
                                      b64Anexos,
                                      b64Oficio,
                                      b64FormatoB,
                                      b64FormatoCEv1,
                                      b64FormatoCEv2,
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
                                  envioEmailDto: {
                                      asunto: asuntoComite,
                                      mensaje: mensajeComite,
                                  },
                              };
                    await lastValueFrom(
                        this.solicitudService.createSolicitudCoordinadorFase2(
                            solicitudData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase1Created == true &&
                    this.updateCoordinadorFase1 == true &&
                    (this.estado ==
                        EstadoProceso.PENDIENTE_REVISION_COORDINADOR ||
                        this.estado ==
                            EstadoProceso.DEVUELTO_EXAMEN_DE_VALORACION_POR_COORDINADOR ||
                        this.estado ==
                            EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR)
                ) {
                    const { asuntoCoordinador, mensajeCoordinador } =
                        this.solicitudForm.value;

                    const solicitudData =
                        this.solicitudForm.get('conceptoCoordinadorDocumentos')
                            .value == 'Aceptado'
                            ? {
                                  conceptoCoordinadorDocumentos: 'ACEPTADO',
                              }
                            : {
                                  conceptoCoordinadorDocumentos: 'RECHAZADO',
                                  envioEmail: {
                                      asunto: asuntoCoordinador,
                                      mensaje: mensajeCoordinador,
                                  },
                              };

                    await lastValueFrom(
                        this.solicitudService.updateSolicitudCoordinadorFase1(
                            solicitudData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase2Created == true &&
                    (this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR ||
                        this.estado ==
                            EstadoProceso.DEVUELTO_EXAMEN_DE_VALORACION_POR_COMITE ||
                        this.estado ==
                            EstadoProceso.PENDIENTE_RESULTADO_EXAMEN_DE_VALORACION)
                ) {
                    const b64FormatoD = await this.formatFileString(
                        this.FileFormatoD,
                        'linkFormatoD'
                    );
                    const b64FormatoE = await this.formatFileString(
                        this.FileFormatoE,
                        'linkFormatoE'
                    );
                    const b64Anexos = await this.formatFileString(
                        this.anexosFiles,
                        'anexos'
                    );

                    const {
                        numeroActa,
                        fechaActa,
                        conceptoComite,
                        asuntoComite,
                        mensajeComite,
                        ...restOfFormValues
                    } = this.solicitudForm.value;

                    let b64FormatoB = null;
                    let b64FormatoCEv1 = null;
                    let b64FormatoCEv2 = null;
                    let b64Oficio = null;

                    if (conceptoComite == 'Avalado') {
                        if (
                            !this.formatoB ||
                            !this.formatoCEv1 ||
                            !this.formatoCEv2
                        ) {
                            this.isSending = false;
                            this.messageService.clear();
                            return this.messageService.add(
                                warnMessage(
                                    'Error: formatos B y C son requeridos.'
                                )
                            );
                        }
                        b64FormatoB = await this.formatFileString(
                            this.formatoB,
                            'formatoB'
                        );
                        b64FormatoCEv1 = await this.formatFileString(
                            this.formatoCEv1,
                            'formatoCEv1'
                        );
                        b64FormatoCEv2 = await this.formatFileString(
                            this.formatoCEv2,
                            'formatoCEv2'
                        );
                        b64Oficio = await this.formatFileString(
                            this.FileOficioDirigidoEvaluadores,
                            'linkOficioDirigidoEvaluadores'
                        );
                    }

                    const solicitudData =
                        conceptoComite == 'Avalado'
                            ? {
                                  ...restOfFormValues,
                                  actaFechaRespuestaComite: [
                                      {
                                          conceptoComite: 'APROBADO',
                                          numeroActa,
                                          fechaActa,
                                      },
                                  ],
                                  envioEmailDto: {
                                      asunto: asuntoComite,
                                      mensaje: mensajeComite,
                                  },
                                  informacionEnvioEvaluador: {
                                      b64FormatoD,
                                      b64FormatoE,
                                      b64Anexos,
                                      b64Oficio,
                                      b64FormatoB,
                                      b64FormatoCEv1,
                                      b64FormatoCEv2,
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
                                  envioEmailDto: {
                                      asunto: asuntoComite,
                                      mensaje: mensajeComite,
                                  },
                              };
                    await lastValueFrom(
                        this.solicitudService.updateSolicitudCoordinadorFase2(
                            solicitudData,
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
        } catch (e) {
            this.isSending = false;
            this.handlerResponseException(e);
        }
    }

    async createSolicitudExamen(): Promise<void> {
        if (this.solicitudForm.invalid) {
            this.messageService.clear();
            this.messageService.add(
                warnMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS)
            );
            return;
        }

        this.isSending = true;
        try {
            const response = await firstValueFrom(
                this.trabajoDeGradoService.createTrabajoDeGrado(
                    this.estudianteSeleccionado.id
                )
            );
            if (response) {
                this.trabajoDeGradoId = response.id;
                this.trabajoDeGradoService.setTrabajoSeleccionado(response);
            }

            if (this.role.includes('ROLE_DOCENTE')) {
                await firstValueFrom(
                    this.solicitudService.createSolicitudDocente(
                        this.solicitudForm.value,
                        this.trabajoDeGradoId
                    )
                );
                localStorage.removeItem('solicitudFormState');
                this.messageService.clear();
                this.messageService.add(infoMessage(Mensaje.GUARDADO_EXITOSO));

                await firstValueFrom(timer(2000));
                this.isSending = false;
                this.router.navigate(['examen-de-valoracion']);
            }
        } catch (e) {
            this.handlerResponseException(e);
            this.isSending = false;
        }
    }

    async setup(fieldName: string): Promise<void> {
        if (fieldName === 'anexos') {
            for (let anexo of this.solicitudForm.get(fieldName).value) {
                try {
                    const response: any = await firstValueFrom(
                        this.trabajoDeGradoService.getFile(anexo)
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
                        this.anexosFiles.push(file);
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
            return;
        }

        try {
            const response: any = await firstValueFrom(
                this.trabajoDeGradoService.getFile(
                    this.solicitudForm.get(fieldName).value
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
                    case 'linkFormatoA':
                        this.FileFormatoA = file;
                        break;
                    case 'linkFormatoD':
                        this.FileFormatoD = file;
                        break;
                    case 'linkFormatoE':
                        this.FileFormatoE = file;
                        break;
                    case 'linkOficioDirigidoEvaluadores':
                        this.FileOficioDirigidoEvaluadores = file;
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

    setValuesForm(solicitud: Solicitud) {
        this.solicitudForm.patchValue({
            ...solicitud,
        });
    }

    loadSolicitud() {
        return new Promise<void>((resolve, reject) => {
            this.isLoading = true;
            const docenteObs =
                this.role.includes('ROLE_DOCENTE') ||
                this.role.includes('ROLE_COORDINADOR')
                    ? this.solicitudService
                          .getSolicitudDocente(this.trabajoDeGradoId)
                          .pipe(
                              catchError(() => {
                                  this.isDocenteCreated = false;
                                  return of(null);
                              })
                          )
                    : of(null);

            const coordinadorObsFase1 = this.role.includes('ROLE_COORDINADOR')
                ? this.solicitudService
                      .getSolicitudCoordinadorFase1(this.trabajoDeGradoId)
                      .pipe(
                          catchError(() => {
                              this.isCoordinadorFase1Created = false;
                              return of(null);
                          })
                      )
                : of(null);

            const coordinadorObsFase2 = this.role.includes('ROLE_COORDINADOR')
                ? this.solicitudService
                      .getSolicitudCoordinadorFase2(this.trabajoDeGradoId)
                      .pipe(
                          catchError(() => {
                              this.isCoordinadorFase2Created = false;
                              return of(null);
                          })
                      )
                : of(null);

            const combinedSubscription = forkJoin({
                docente: docenteObs,
                coordinadorFase1: coordinadorObsFase1,
                coordinadorFase2: coordinadorObsFase2,
            }).subscribe({
                next: (responses) => {
                    if (responses.docente) {
                        this.isDocenteCreated = true;
                        const data = responses.docente;
                        this.trabajoDeGradoService.setTituloSeleccionadoSubject(
                            data.titulo
                        );
                        this.setValuesForm(data);

                        this.evaluadorInternoSeleccionado =
                            this.mapEvaluadorInternoLabel(
                                data.evaluadorInterno
                            );
                        this.trabajoDeGradoService.setEvaluadorInternoSeleccionadoSubject(
                            this.evaluadorInternoSeleccionado
                        );
                        this.evaluadorInterno.setValue(
                            data.evaluadorInterno.id
                        );

                        this.evaluadorExternoSeleccionado =
                            this.mapEvaluadorExternoLabel(
                                data.evaluadorExterno
                            );
                        this.trabajoDeGradoService.setEvaluadorExternoSeleccionadoSubject(
                            this.evaluadorExternoSeleccionado
                        );
                        this.evaluadorExterno.setValue(
                            data.evaluadorExterno.id
                        );
                    }

                    if (responses.coordinadorFase1) {
                        this.isCoordinadorFase1Created = true;
                        const data = responses.coordinadorFase1;
                        this.solicitudForm
                            .get('conceptoCoordinadorDocumentos')
                            .setValue(
                                data.conceptoCoordinadorDocumentos == 'ACEPTADO'
                                    ? 'Aceptado'
                                    : 'Rechazado'
                            );
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

                        this.solicitudForm
                            .get('fechaActa')
                            .setValue(
                                actaDate
                                    ? new Date(`${actaDate}T00:00:00`)
                                    : null
                            );

                        this.solicitudForm
                            .get('numeroActa')
                            .setValue(actaNumber ? actaNumber : null);

                        this.solicitudForm
                            .get('conceptoComite')
                            .setValue(
                                actaConceptoComite == 'APROBADO'
                                    ? 'Avalado'
                                    : 'No Avalado'
                            );

                        const fechaMaximaEvaluacion =
                            data?.fechaMaximaEvaluacion;

                        this.solicitudForm
                            .get('fechaMaximaEvaluacion')
                            .setValue(
                                fechaMaximaEvaluacion
                                    ? new Date(
                                          `${fechaMaximaEvaluacion}T00:00:00`
                                      )
                                    : null
                            );
                    }
                },
                error: (e) => this.handlerResponseException(e),
                complete: () => {
                    if (
                        this.role.includes('ROLE_DOCENTE') &&
                        this.isDocenteCreated
                    ) {
                        this.setup('linkFormatoA');
                        this.setup('linkFormatoD');
                        this.setup('linkFormatoE');
                        this.setup('anexos');
                    }
                    if (this.role.includes('ROLE_COORDINADOR')) {
                        this.setup('linkFormatoA');
                        this.setup('linkFormatoD');
                        this.setup('linkFormatoE');
                        this.setup('anexos');
                        if (
                            this.isCoordinadorFase2Created &&
                            this.solicitudForm.get('conceptoComite').value ==
                                'Avalado'
                        ) {
                            this.setup('linkOficioDirigidoEvaluadores');
                        }
                    }
                    this.isLoading = false;
                    resolve();
                },
            });
            this.subscriptions.add(combinedSubscription);
        });
    }

    onFileSelectFormatoA(event: any) {
        this.FileFormatoA = this.uploadFileAndSetValue('linkFormatoA', event);
    }

    onFileSelectFormatoD(event: any) {
        this.FileFormatoD = this.uploadFileAndSetValue('linkFormatoD', event);
    }

    onFileSelectFormatoE(event: any) {
        this.FileFormatoE = this.uploadFileAndSetValue('linkFormatoE', event);
    }

    onFileSelectOficioDirigidoEvaluadores(event: any) {
        this.FileOficioDirigidoEvaluadores = this.uploadFileAndSetValue(
            'linkOficioDirigidoEvaluadores',
            event
        );
    }

    onFileClear(field: string) {
        if (field == 'linkFormatoA') {
            this.FileFormatoA = null;
            this.FormatoA.clear();
            this.solicitudForm.get('linkFormatoA').reset();
        }
        if (field == 'linkFormatoD') {
            this.FileFormatoD = null;
            this.FormatoD.clear();
            this.solicitudForm.get('linkFormatoD').reset();
        }
        if (field == 'linkFormatoE') {
            this.FileFormatoE = null;
            this.FormatoE.clear();
            this.solicitudForm.get('linkFormatoE').reset();
        }
        if (field == 'linkOficioDirigidoEvaluadores') {
            this.FileOficioDirigidoEvaluadores = null;
            this.OficioDirigidoEvaluadores.clear();
            this.solicitudForm.get('linkOficioDirigidoEvaluadores').reset();
        }
    }

    async formatFileString(file: any, fileControlName: string): Promise<any> {
        try {
            if (fileControlName === 'anexos') {
                const files = await Promise.all(
                    file.map(async (anexo: any) => {
                        const base64 = await this.convertFileToBase64(anexo);
                        return `${base64}`;
                    })
                );
                return files;
            } else {
                const base64 = await this.convertFileToBase64(file);
                return `${base64}`;
            }
        } catch (error) {
            console.error('Error al convertir el archivo a base64:', error);
            throw error;
        }
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
                    this.solicitudForm
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

    downloadFile = (
        response: string,
        rutaArchivo: string,
        downloadName: string
    ) => {
        const byteCharacters = atob(response);
        const byteNumbers = new Array(byteCharacters.length)
            .fill(0)
            .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const extension = rutaArchivo.slice(rutaArchivo.lastIndexOf('.') + 1);

        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = `${downloadName}.${extension}`;
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    isValidFilePath = (filePath: string): boolean => {
        return filePath.startsWith('./files/') && filePath.includes('.pdf');
    };

    async getFileAndSetValue(fieldName: string): Promise<void> {
        let errorShown = false;
        const handleError = () => {
            if (!errorShown) {
                this.messageService.clear();
                this.messageService.add(
                    warnMessage('Modifica la información para ver los cambios.')
                );
                errorShown = true;
            }
        };

        try {
            const fieldValues = this.solicitudForm.get(fieldName).value;
            if (fieldName === 'anexos') {
                for (const anexo of fieldValues) {
                    if (this.isValidFilePath(anexo)) {
                        try {
                            const response = await firstValueFrom(
                                this.trabajoDeGradoService.getFile(anexo)
                            );
                            this.downloadFile(response, anexo, fieldName);
                        } catch {
                            handleError();
                        }
                    } else {
                        handleError();
                    }
                }
            } else {
                if (this.isValidFilePath(fieldValues)) {
                    try {
                        const response = await firstValueFrom(
                            this.trabajoDeGradoService.getFile(fieldValues)
                        );
                        this.downloadFile(response, fieldValues, fieldName);
                    } catch {
                        handleError();
                    }
                } else {
                    handleError();
                }
            }
        } catch {
            handleError();
        }
    }

    getFormControl(formControlName: string): FormControl {
        return this.solicitudForm.get(formControlName) as FormControl;
    }

    showBuscadorEvaluadorInterno() {
        return this.dialogService.open(BuscadorDocentesComponent, {
            header: 'Seleccionar docente',
            width: '60%',
            styleClass: 'custom-docente-dialog',
        });
    }

    showBuscadorEvaluadorExterno() {
        return this.dialogService.open(BuscadorExpertosComponent, {
            header: 'Seleccionar experto',
            width: '60%',
            styleClass: 'custom-experto-dialog',
        });
    }

    mapEvaluadorInternoLabel(docente: any) {
        return {
            id: docente.id,
            nombres: docente.nombres ?? docente.nombre + ' ' + docente.apellido,
            correo: docente.correoElectronico ?? docente.correo,
            universidad: docente.universidad,
        };
    }

    mapEvaluadorExternoLabel(experto: any) {
        return {
            id: experto.id,
            nombres: experto.nombres ?? experto.nombre + ' ' + experto.apellido,
            correo: experto.correoElectronico ?? experto.correo,
            universidad: experto.universidad,
        };
    }

    async onSeleccionarEvaluadorInterno(): Promise<void> {
        const ref = this.showBuscadorEvaluadorInterno();

        try {
            const response = await firstValueFrom(ref.onClose);
            if (response) {
                const docente = this.mapEvaluadorInternoLabel(response);
                this.evaluadorInternoSeleccionado = docente;
                this.trabajoDeGradoService.setEvaluadorInternoSeleccionadoSubject(
                    this.evaluadorInternoSeleccionado
                );
                this.evaluadorInterno.setValue(docente.id);
            }
        } catch (error) {
            console.error('Error al seleccionar el evaluador interno:', error);
        }
    }

    async onSeleccionarEvaluadorExterno(): Promise<void> {
        const ref = this.showBuscadorEvaluadorExterno();

        try {
            const response = await firstValueFrom(ref.onClose);
            if (response) {
                const experto = this.mapEvaluadorExternoLabel(response);
                this.evaluadorExternoSeleccionado = experto;
                this.trabajoDeGradoService.setEvaluadorExternoSeleccionadoSubject(
                    this.evaluadorExternoSeleccionado
                );
                this.evaluadorExterno.setValue(experto.id);
            }
        } catch (error) {
            console.error('Error al seleccionar el evaluador externo:', error);
        }
    }

    limpiarEvaluadorExterno() {
        this.evaluadorExterno.setValue(null);
        this.evaluadorExternoSeleccionado = null;
    }

    limpiarEvaluadorInterno() {
        this.evaluadorInterno.setValue(null);
        this.evaluadorInternoSeleccionado = null;
    }

    redirectToRespuesta() {
        this.router.navigate(['examen-de-valoracion/respuesta']);
    }

    redirectToResolucion(resolucionId: number) {
        resolucionId
            ? this.router.navigate([
                  `examen-de-valoracion/resolucion/editar/${this.trabajoDeGradoId}`,
              ])
            : this.router.navigate(['examen-de-valoracion/resolucion']);
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
        if (this.router.url.includes('solicitud')) {
            return true;
        }
        return false;
    }

    getButtonLabel(): string {
        if (this.role.includes('ROLE_DOCENTE') && this.isDocenteCreated) {
            return 'Modificar Informacion';
        } else if (
            this.role.includes('ROLE_COORDINADOR') &&
            this.isCoordinadorFase1Created &&
            this.isCoordinadorFase2Created
        ) {
            return 'Modificar Informacion';
        } else {
            return 'Guardar';
        }
    }
}
