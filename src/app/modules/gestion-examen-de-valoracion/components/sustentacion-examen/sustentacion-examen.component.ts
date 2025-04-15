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
import { BuscadorDocentesComponent } from 'src/app/shared/components/buscador-docentes/buscador-docentes.component';
import { BuscadorExpertosComponent } from 'src/app/shared/components/buscador-expertos/buscador-expertos.component';
import { DocenteService } from 'src/app/shared/services/docente.service';
import { ExpertoService } from 'src/app/shared/services/experto.service';
import { Estudiante } from '../../../gestion-estudiantes/models/estudiante';
import { SustentacionService } from '../../services/sustentacion.service';
import { TrabajoDeGradoService } from '../../services/trabajoDeGrado.service';
import { Experto } from '../../models/experto';
import { Sustentacion } from '../../models/sustentacion';
import { AutenticacionService } from 'src/app/modules/gestion-autenticacion/services/autenticacion.service';
import { ResolucionService } from '../../services/resolucion.service';

@Component({
    selector: 'app-sustentacion-examen',
    templateUrl: './sustentacion-examen.component.html',
    styleUrls: ['./sustentacion-examen.component.scss'],
})
export class SustentacionExamenComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();
    sustentacionForm: FormGroup;

    private checkboxChangeSubject = new Subject<boolean>();
    checkboxChange$ = this.checkboxChangeSubject.asObservable();

    private subscriptions: Subscription = new Subscription();
    private checkboxCoordinadorSubscription: Subscription;
    private checkboxComiteSubscription: Subscription;
    private checkboxJuradosSubscription: Subscription;
    private checkboxRespuestasSubscription: Subscription;
    private estudianteSubscription: Subscription;
    private trabajoSeleccionadoSubscription: Subscription;
    private resolucionSubscription: Subscription;
    private sustentacionSubscription: Subscription;

    @ViewChild('FormatoF') FormatoF!: FileUpload;
    @ViewChild('Monografia') Monografia!: FileUpload;
    @ViewChild('FormatoG') FormatoG!: FileUpload;
    @ViewChild('EstudioHVA') EstudioHVA!: FileUpload;
    @ViewChild('OficioConsejo') OficioConsejo!: FileUpload;
    @ViewChild('FormatoH') FormatoH!: FileUpload;
    @ViewChild('FormatoI') FormatoI!: FileUpload;
    @ViewChild('EstudioHVAGrado') EstudioHVAGrado!: FileUpload;

    FileFormatoF: File | null = null;
    FileMonografia: File | null = null;
    FileFormatoG: File | null = null;
    FileEstudioHVA: File | null = null;
    FileOficioConsejo: File | null = null;
    FileFormatoH: File | null = null;
    FileFormatoI: File | null = null;
    FileEstudioHVAGrado: File | null = null;

    editMode: boolean = false;
    errorMessageShown: boolean = false;
    displayModal: boolean = false;
    displayFormatoHVA: boolean = false;
    displayFormatoHVAGrado: boolean = false;
    displayFormatoF: boolean = false;
    displayFormatoG: boolean = false;
    isPdfLoaded: boolean = false;
    isDocente: boolean = false;
    isCoordinadorFase1: boolean = false;
    isEstudiante: boolean = false;
    isCoordinadorFase2: boolean = false;
    isCoordinadorFase3: boolean = false;
    isCoordinadorFase4: boolean = false;
    isDocenteCreated: boolean = false;
    isCoordinadorFase1Created: boolean = false;
    isEstudianteCreated: boolean = false;
    isCoordinadorFase2Created: boolean = false;
    isCoordinadorFase3Created: boolean = false;
    isCoordinadorFase4Created: boolean = false;
    isSustentacionCreated: boolean = false;
    isLoading: boolean = false;
    isSending: boolean = false;
    isReviewed: boolean = false;
    updateCoordinadorFase1: boolean = false;
    updateCoordinadorFase2: boolean = false;
    updateCoordinadorFase3: boolean = false;
    messageShown: boolean = false;

    pdfUrls: { name: string; url: string }[] = [];
    role: string[];
    anexosFiles: File[] = [];
    anexosBase64: { linkAnexo: string }[] = [];
    estado: string;

    trabajoDeGradoId: number;
    respuestaId: number;
    resolucionId: number;
    sustentacionId: number;
    currentPdfIndex: number = 0;

    estudianteSeleccionado: Estudiante = {};
    juradoExternoSeleccionado: Experto;
    juradoInternoSeleccionado: Docente;

    estados: string[] = ['Aceptado', 'Rechazado'];
    estadosComite: string[] = ['Aprobado', 'No Aprobado'];
    respuestas: string[] = [
        'Aprobado',
        'Aprobado Con Observaciones',
        'No Aprobado',
        'Aplazado',
    ];

    maxDate: Date;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private confirmationService: ConfirmationService,
        private trabajoDeGradoService: TrabajoDeGradoService,
        private resolucionService: ResolucionService,
        private sustentacionService: SustentacionService,
        private dialogService: DialogService,
        private messageService: MessageService,
        private autenticacion: AutenticacionService,
        private docenteService: DocenteService,
        private expertoService: ExpertoService
    ) {
        this.maxDate = new Date();
    }

    get juradoInterno(): FormControl {
        return this.sustentacionForm.get('idJuradoInterno') as FormControl;
    }

    get juradoExterno(): FormControl {
        return this.sustentacionForm.get('idJuradoExterno') as FormControl;
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
        await this.loadSustentacion();
    }

    initForm(): void {
        this.sustentacionForm = this.fb.group({
            linkFormatoF: [null, Validators.required],
            linkMonografia: [null, Validators.required],
            anexos: [[]],
            asuntoCoordinador: [null],
            mensajeCoordinador: [null],
            conceptoCoordinador: [null, Validators.required],
            asuntoComite: [null],
            mensajeComite: [null],
            conceptoComite: [null, Validators.required],
            linkFormatoG: [null, Validators.required],
            linkEstudioHojaVidaAcademica: [null, Validators.required],
            linkOficioConsejo: [null, Validators.required],
            numeroActa: [null, Validators.required],
            fechaActa: [null, Validators.required],
            nota: [null],
            juradosAceptados: [null],
            idJuradoInterno: [null, Validators.required],
            idJuradoExterno: [null, Validators.required],
            fechaSustentacion: [null, Validators.required],
            numeroActaConsejo: [null, Validators.required],
            fechaActaConsejo: [null, Validators.required],
            linkFormatoH: [null, Validators.required],
            linkFormatoI: [null, Validators.required],
            linkEstudioHojaVidaAcademicaGrado: [null, Validators.required],
            respuestaSustentacion: [null, Validators.required],
            numeroActaFinal: [null, Validators.required],
            fechaActaFinal: [null, Validators.required],
        });

        this.formReady.emit(this.sustentacionForm);

        this.checkboxCoordinadorSubscription = this.sustentacionForm
            .get('conceptoCoordinador')
            .valueChanges.subscribe((value) => {
                if (value == 'Rechazado') {
                    this.sustentacionForm
                        .get('asuntoCoordinador')
                        .setValue('Revisión requerida');
                    this.sustentacionForm
                        .get('mensajeCoordinador')
                        .setValue(
                            'Se requiere realizar una revisión adicional de los documentos. Por favor, ajuste según las observaciones.'
                        );
                }
            });

        this.checkboxComiteSubscription = this.sustentacionForm
            .get('conceptoComite')
            .valueChanges.subscribe((value) => {
                if (value == 'Aprobado') {
                    this.sustentacionForm
                        .get('asuntoComite')
                        .setValue('Revisión aprobada de la sustentación');

                    this.sustentacionForm
                        .get('mensajeComite')
                        .setValue(
                            'La sustentación ha sido aprobada. Por favor, continúe con los siguientes pasos.'
                        );
                }
                if (value == 'No Aprobado') {
                    this.sustentacionForm
                        .get('asuntoComite')
                        .setValue('Corrección requerida por parte del comité');
                    this.sustentacionForm
                        .get('mensajeComite')
                        .setValue(
                            'La sustentación ha sido rechazada. Se requiere realizar correcciones y volver a enviar para revisión.'
                        );
                    this.isReviewed = true;
                }
            });

        this.checkboxJuradosSubscription = this.sustentacionForm
            .get('juradosAceptados')
            .valueChanges.subscribe((value) => {
                if (value == 'Aceptado') {
                    this.juradoInterno.setValue(
                        this.juradoInternoSeleccionado.id
                    );
                    this.juradoExterno.setValue(
                        this.juradoExternoSeleccionado.id
                    );
                    this.sustentacionForm
                        .get('nota')
                        .setValue(
                            'Los jurados han sido aceptados y confirmados según la documentación correspondiente.'
                        );
                }
                if (value == 'Rechazado') {
                    this.sustentacionForm
                        .get('nota')
                        .setValue(
                            'El jurado ha sido rechazado. Se recomienda revisar la asignación de jurados.'
                        );
                }
            });

        this.checkboxRespuestasSubscription = this.sustentacionForm
            .get('respuestaSustentacion')
            .valueChanges.subscribe((value) => {
                if (value == 'Aplazado') {
                    this.isReviewed = true;
                }
                if (value == 'No Aprobado') {
                    this.isReviewed = true;
                }
            });

        this.setupIsReviewedCheckBox();
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

    updateFormFields(role: string[]): void {
        const formControls = this.sustentacionForm.controls;

        for (const control in formControls) {
            formControls[control].disable();
        }

        if (role.includes('ROLE_DOCENTE')) {
            formControls['linkFormatoF'].enable();
            formControls['linkMonografia'].enable();
            formControls['anexos'].enable();
            formControls['idJuradoInterno'].enable();
            formControls['idJuradoExterno'].enable();
        }

        if (role.includes('ROLE_COORDINADOR')) {
            if (this.isDocente && !this.isCoordinadorFase1) {
                formControls['asuntoCoordinador'].enable();
                formControls['mensajeCoordinador'].enable();
                formControls['conceptoCoordinador'].enable();
                this.sustentacionForm
                    .get('conceptoCoordinador')
                    .valueChanges.subscribe((value) => {
                        if (value == 'Aceptado') {
                            this.isReviewed = false;
                            formControls[
                                'linkEstudioHojaVidaAcademica'
                            ].enable();
                        } else if (value == 'Rechazado') {
                            this.isReviewed = true;
                            formControls[
                                'linkEstudioHojaVidaAcademica'
                            ].disable();
                        }
                    });
            }

            if (this.isCoordinadorFase1 && !this.isCoordinadorFase2) {
                formControls['asuntoComite'].enable();
                formControls['mensajeComite'].enable();
                formControls['conceptoComite'].enable();
                formControls['numeroActa'].enable();
                formControls['fechaActa'].enable();
                this.sustentacionForm
                    .get('conceptoComite')
                    .valueChanges.subscribe((value) => {
                        if (value == 'Aprobado') {
                            this.isReviewed = false;
                            formControls['linkFormatoG'].enable();
                        } else if (value == 'No Aprobado') {
                            this.isReviewed = true;
                            formControls['linkFormatoG'].disable();
                        }
                    });
            }

            if (this.isCoordinadorFase2 && !this.isCoordinadorFase3) {
                formControls['juradosAceptados'].enable();
                formControls['nota'].enable();
                formControls['idJuradoInterno'].enable();
                formControls['idJuradoExterno'].enable();
                formControls['linkOficioConsejo'].enable();
                formControls['numeroActaConsejo'].enable();
                formControls['fechaActaConsejo'].enable();
            }

            if (this.isEstudiante) {
                formControls['respuestaSustentacion'].enable();
            }
        }

        if (role.includes('ROLE_ESTUDIANTE')) {
            if (this.isCoordinadorFase3) {
                formControls['linkFormatoH'].enable();
                formControls['linkFormatoI'].enable();
                formControls['linkEstudioHojaVidaAcademicaGrado'].enable();
                formControls['fechaSustentacion'].enable();
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

        this.trabajoSeleccionadoSubscription =
            this.trabajoDeGradoService.trabajoSeleccionadoSubject$.subscribe({
                next: (response) => {
                    if (response) {
                        this.trabajoDeGradoId = response.id;
                        this.estado = response.estado;
                        if (
                            this.estado ==
                                EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_DOCENTE_SUSTENTACION &&
                            this.role.includes('ROLE_COORDINADOR')
                        ) {
                            this.router.navigate(['examen-de-valoracion']);
                        }
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

    async setup(fieldName: string) {
        if (fieldName === 'anexos') {
            for (const anexo of this.sustentacionForm.get(fieldName).value) {
                try {
                    const response = await firstValueFrom(
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
                } catch {
                    if (!this.errorMessageShown) {
                        this.messageService.clear();
                        this.messageService.add(
                            warnMessage('Pendiente subir archivos.')
                        );
                        this.errorMessageShown = true;
                    }
                }
            }
        } else {
            const rutaArchivo = this.sustentacionForm.get(fieldName).value;
            try {
                const response = await firstValueFrom(
                    this.trabajoDeGradoService.getFile(rutaArchivo)
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
                        case 'linkFormatoF':
                            this.FileFormatoF = file;
                            break;
                        case 'linkMonografia':
                            this.FileMonografia = file;
                            break;
                        case 'linkEstudioHojaVidaAcademica':
                            this.FileEstudioHVA = file;
                            break;
                        case 'linkFormatoG':
                            this.FileFormatoG = file;
                            break;
                        case 'linkOficioConsejo':
                            this.FileOficioConsejo = file;
                            break;
                        case 'linkFormatoH':
                            this.FileFormatoH = file;
                            break;
                        case 'linkFormatoI':
                            this.FileFormatoI = file;
                            break;
                        case 'linkEstudioHojaVidaAcademicaGrado':
                            this.FileEstudioHVAGrado = file;
                            break;
                        default:
                            break;
                    }
                }
            } catch {
                if (!this.errorMessageShown) {
                    this.messageService.clear();
                    this.messageService.add(
                        warnMessage('Pendiente subir archivos.')
                    );
                    this.errorMessageShown = true;
                }
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
        if (this.sustentacionSubscription) {
            this.sustentacionSubscription.unsubscribe();
        }
        if (this.resolucionSubscription) {
            this.resolucionSubscription.unsubscribe();
        }
        if (this.checkboxCoordinadorSubscription) {
            this.checkboxCoordinadorSubscription.unsubscribe();
        }
        if (this.checkboxComiteSubscription) {
            this.checkboxComiteSubscription.unsubscribe();
        }
        if (this.checkboxJuradosSubscription) {
            this.checkboxJuradosSubscription.unsubscribe();
        }
        if (this.checkboxRespuestasSubscription) {
            this.checkboxJuradosSubscription.unsubscribe();
        }
        if (this.subscriptions) {
            this.subscriptions.unsubscribe();
        }
    }

    checkEstados() {
        switch (this.estado) {
            case EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COORDINADOR:
                this.messageService.clear();
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COORDINADOR,
                    life: 2000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = false;
                this.isCoordinadorFase2 = false;
                this.isCoordinadorFase3 = false;
                this.isEstudiante = false;
                this.isCoordinadorFase4 = false;
                break;

            case EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COMITE:
                this.messageService.clear();
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COMITE,
                    life: 2000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = false;
                this.isCoordinadorFase3 = false;
                this.isEstudiante = false;
                this.isCoordinadorFase4 = false;
                break;

            case EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_DOCENTE_SUSTENTACION:
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
                this.isEstudiante = false;
                this.isCoordinadorFase4 = false;
                break;

            case EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE1_SUSTENTACION:
                this.isDocente = true;
                this.isCoordinadorFase1 = false;
                this.isCoordinadorFase2 = false;
                this.isCoordinadorFase3 = false;
                this.isEstudiante = false;
                this.isCoordinadorFase4 = false;
                break;

            case EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE2_SUSTENTACION:
                if (this.role.includes('ROLE_COORDINADOR')) {
                    this.messageService.clear();
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Informacion',
                        detail: 'Se van anexar los formatos de Monografia, Anexos, Anteproyecto Final y Estudio Hoja de Vida Academica.',
                        life: 5000,
                    });
                }
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = false;
                this.isCoordinadorFase3 = false;
                this.isEstudiante = false;
                this.isCoordinadorFase4 = false;
                break;

            case EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE3_SUSTENTACION:
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = true;
                this.isCoordinadorFase3 = false;
                this.isEstudiante = false;
                this.isCoordinadorFase4 = false;
                break;

            case EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_ESTUDIANTE_SUSTENTACION:
                this.messageService.clear();
                this.messageService.add({
                    severity: 'info',
                    summary: 'Informacion',
                    detail: EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_ESTUDIANTE_SUSTENTACION,
                    life: 2000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = true;
                this.isCoordinadorFase3 = true;
                this.isEstudiante = false;
                this.isCoordinadorFase4 = false;
                break;

            case EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE4_SUSTENTACION:
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = true;
                this.isCoordinadorFase3 = true;
                this.isEstudiante = true;
                this.isCoordinadorFase4 = false;
                break;

            case EstadoProceso.SUSTENTACION_APROBADA:
                this.messageService.clear();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Informacion',
                    detail: EstadoProceso.SUSTENTACION_APROBADA,
                    life: 2000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isEstudiante = true;
                this.isCoordinadorFase2 = true;
                this.isCoordinadorFase3 = true;
                this.isCoordinadorFase4 = true;
                this.isSustentacionCreated = true;
                break;

            case EstadoProceso.SUSTENTACION_APROBADA_CON_OBSERVACIONES:
                this.messageService.clear();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Informacion',
                    detail: EstadoProceso.SUSTENTACION_APROBADA_CON_OBSERVACIONES,
                    life: 2000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isEstudiante = true;
                this.isCoordinadorFase2 = true;
                this.isCoordinadorFase3 = true;
                this.isCoordinadorFase4 = true;
                this.isSustentacionCreated = true;
                break;

            case EstadoProceso.SUSTENTACION_NO_APROBADA:
                this.messageService.clear();
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Informacion',
                    detail: EstadoProceso.SUSTENTACION_NO_APROBADA,
                    life: 2000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isEstudiante = true;
                this.isCoordinadorFase2 = true;
                this.isCoordinadorFase3 = true;
                this.isCoordinadorFase4 = true;
                this.isSustentacionCreated = true;
                break;

            case EstadoProceso.SUSTENTACION_APLAZADA:
                this.messageService.clear();
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Informacion',
                    detail: EstadoProceso.SUSTENTACION_APLAZADA,
                    life: 2000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isEstudiante = true;
                this.isCoordinadorFase2 = true;
                this.isCoordinadorFase3 = true;
                this.isCoordinadorFase4 = true;
                this.isSustentacionCreated = true;
                break;

            default:
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isEstudiante = true;
                this.isCoordinadorFase2 = true;
                this.isCoordinadorFase3 = true;
                this.isCoordinadorFase4 = true;
                break;
        }

        this.updateFormFields(this.role);
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
                    this.isEstudiante = false;
                    this.isCoordinadorFase4 = false;
                    this.updateCoordinadorFase1 = true;
                    this.updateFormFields(this.role);
                } else if (fase == 'coordinadorFase2') {
                    this.isDocente = true;
                    this.isCoordinadorFase1 = true;
                    this.isCoordinadorFase2 = false;
                    this.isCoordinadorFase3 = false;
                    this.isEstudiante = false;
                    this.isCoordinadorFase4 = false;
                    this.updateCoordinadorFase2 = true;
                    this.updateFormFields(this.role);
                } else if (fase == 'coordinadorFase3') {
                    this.isDocente = true;
                    this.isCoordinadorFase1 = true;
                    this.isCoordinadorFase2 = true;
                    this.isCoordinadorFase3 = false;
                    this.isEstudiante = false;
                    this.isCoordinadorFase4 = false;
                    this.updateCoordinadorFase3 = true;
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
                    file: this.FileFormatoF,
                    fieldName: 'Formato F',
                },
                ...this.anexosFiles.map((file) => ({
                    file,
                    fieldName: 'Anexo',
                }))
            );
        }

        if (
            this.role.includes('ROLE_COORDINADOR') &&
            this.updateCoordinadorFase2 == false &&
            this.updateCoordinadorFase3 == false &&
            (this.estado ==
                EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE1_SUSTENTACION ||
                this.estado ==
                    EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COORDINADOR ||
                this.updateCoordinadorFase1 == true)
        ) {
            filesToConvert.push(
                {
                    file: this.FileFormatoF,
                    fieldName: 'Formato F',
                },
                ...this.anexosFiles.map((file) => ({
                    file,
                    fieldName: 'Anexo',
                }))
            );
        }

        if (
            this.role.includes('ROLE_COORDINADOR') &&
            this.updateCoordinadorFase1 == false &&
            this.updateCoordinadorFase3 == false &&
            (this.estado ==
                EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE2_SUSTENTACION ||
                this.estado ==
                    EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COMITE ||
                this.updateCoordinadorFase2 == true)
        ) {
            filesToConvert.push({
                file: this.FileFormatoG,
                fieldName: 'Formato G',
            });
        }

        if (
            (this.role.includes('ROLE_COORDINADOR') &&
                this.updateCoordinadorFase1 == false &&
                this.updateCoordinadorFase2 == false &&
                this.estado ==
                    EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE3_SUSTENTACION) ||
            this.updateCoordinadorFase3 == true
        ) {
            filesToConvert.push({
                file: this.FileOficioConsejo,
                fieldName: 'Oficio consejo',
            });
        }

        if (this.role.includes('ROLE_ESTUDIANTE')) {
            filesToConvert.push(
                {
                    file: this.FileFormatoH,
                    fieldName: 'Formato H',
                },
                {
                    file: this.FileFormatoI,
                    fieldName: 'Formato I',
                }
            );
        }

        if (
            this.role.includes('ROLE_COORDINADOR') &&
            (this.estado ==
                EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE4_SUSTENTACION ||
                this.estado == EstadoProceso.SUSTENTACION_APROBADA ||
                this.estado == EstadoProceso.SUSTENTACION_APLAZADA ||
                this.estado == EstadoProceso.SUSTENTACION_NO_APROBADA ||
                this.estado ==
                    EstadoProceso.SUSTENTACION_APROBADA_CON_OBSERVACIONES)
        ) {
            filesToConvert.push(
                {
                    file: this.FileFormatoH,
                    fieldName: 'Formato H',
                },
                {
                    file: this.FileFormatoI,
                    fieldName: 'Formato I',
                }
            );
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

    showFormatoHVA() {
        this.displayFormatoHVA = true;
    }

    showFormatoHVAGrado() {
        this.displayFormatoHVAGrado = true;
    }

    showFormatoF() {
        this.displayFormatoF = true;
    }

    showFormatoG() {
        this.displayFormatoG = true;
    }

    handleFormatoHvaDocxGenerated(blob: Blob) {
        const docxFile = new File([blob], 'EstudioHojaVidaAcademica.docx', {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        this.FileEstudioHVA = docxFile;
        this.convertFileToBase64(docxFile)
            .then((base64) => {
                this.sustentacionForm
                    .get('linkEstudioHojaVidaAcademica')
                    .setValue(`linkEstudioHojaVidaAcademica.docx-${base64}`);
                this.displayFormatoHVA = false;
            })
            .catch((error) => {
                console.error('Error al convertir el archivo a base64:', error);
            });
    }

    handleFormatoFGenerated(file: File) {
        const pdfFile = new File([file], 'FormatoF.pdf', {
            type: 'application/pdf',
        });
        this.FileFormatoF = pdfFile;
        this.convertFileToBase64(pdfFile)
            .then((base64) => {
                this.sustentacionForm
                    .get('linkFormatoF')
                    .setValue(`linkFormatoF.pdf-${base64}`);
                this.displayFormatoF = false;
            })
            .catch((error) => {
                console.error('Error al convertir el archivo a base64:', error);
            });
    }

    handleFormatoGGenerated(file: File) {
        const pdfFile = new File([file], 'FormatoG.pdf', {
            type: 'application/pdf',
        });
        this.FileFormatoG = pdfFile;
        this.convertFileToBase64(pdfFile)
            .then((base64) => {
                this.sustentacionForm
                    .get('linkFormatoG')
                    .setValue(`linkFormatoG.pdf-${base64}`);
                this.displayFormatoG = false;
            })
            .catch((error) => {
                console.error('Error al convertir el archivo a base64:', error);
            });
    }

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
                    this.sustentacionForm.patchValue({
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
        this.sustentacionForm.get('anexos').setValue(this.anexosFiles);
    }
    //#endregion

    setValuesForm(sustentacion: Sustentacion) {
        this.sustentacionForm.patchValue({
            ...sustentacion,
        });
    }

    async loadJuradoExterno() {
        try {
            const idJuradoExterno =
                this.sustentacionForm.get('idJuradoExterno').value;
            const response = await firstValueFrom(
                this.expertoService.obtenerExperto(idJuradoExterno)
            );
            if (response) {
                this.juradoExternoSeleccionado =
                    this.mapJuradoExternoLabel(response);
                this.juradoExterno.setValue(response.id);
            }
        } catch (error) {
            console.error('Error al obtener el jurado externo:', error);
        }
    }

    async loadJuradoInterno() {
        try {
            const idJuradoInterno =
                this.sustentacionForm.get('idJuradoInterno').value;
            const response = await firstValueFrom(
                this.docenteService.obtenerDocente(idJuradoInterno)
            );
            if (response) {
                this.juradoInternoSeleccionado =
                    this.mapJuradoInternoLabel(response);
                this.juradoInterno.setValue(response.id);
            }
        } catch (error) {
            console.error('Error al obtener el jurado interno:', error);
        }
    }

    loadSustentacion(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.isLoading = true;
            const docenteObs =
                this.role.includes('ROLE_DOCENTE') ||
                this.role.includes('ROLE_COORDINADOR')
                    ? this.sustentacionService
                          .getSustentacionDocente(this.trabajoDeGradoId)
                          .pipe(
                              catchError(() => {
                                  this.isDocenteCreated = false;
                                  return of(null);
                              })
                          )
                    : of(null);
            const coordinadorFase1Obs = this.role.includes('ROLE_COORDINADOR')
                ? this.sustentacionService
                      .getSustentacionCoordinadorFase1(this.trabajoDeGradoId)
                      .pipe(
                          catchError(() => {
                              this.isCoordinadorFase1Created = false;
                              return of(null);
                          })
                      )
                : of(null);
            const coordinadorFase2Obs = this.role.includes('ROLE_COORDINADOR')
                ? this.sustentacionService
                      .getSustentacionCoordinadorFase2(this.trabajoDeGradoId)
                      .pipe(
                          catchError(() => {
                              this.isCoordinadorFase2Created = false;
                              return of(null);
                          })
                      )
                : of(null);
            const coordinadorFase3Obs = this.role.includes('ROLE_COORDINADOR')
                ? this.sustentacionService
                      .getSustentacionCoordinadorFase3(this.trabajoDeGradoId)
                      .pipe(
                          catchError(() => {
                              this.isCoordinadorFase3Created = false;
                              return of(null);
                          })
                      )
                : of(null);
            const estudianteObs =
                this.role.includes('ROLE_COORDINADOR') ||
                this.role.includes('ROLE_ESTUDIANTE')
                    ? this.sustentacionService
                          .getSustentacionEstudiante(this.trabajoDeGradoId)
                          .pipe(
                              catchError(() => {
                                  this.isEstudianteCreated = false;
                                  return of(null);
                              })
                          )
                    : of(null);
            const coordinadorFase4Obs = this.role.includes('ROLE_COORDINADOR')
                ? this.sustentacionService
                      .getSustentacionCoordinadorFase4(this.trabajoDeGradoId)
                      .pipe(
                          catchError(() => {
                              this.isCoordinadorFase4Created = false;
                              return of(null);
                          })
                      )
                : of(null);

            const combinedSubscription = forkJoin({
                docente: docenteObs,
                coordinadorFase1: coordinadorFase1Obs,
                coordinadorFase2: coordinadorFase2Obs,
                estudiante: estudianteObs,
                coordinadorFase3: coordinadorFase3Obs,
                coordinadorFase4: coordinadorFase4Obs,
            }).subscribe({
                next: (responses) => {
                    if (responses.docente) {
                        this.isDocenteCreated = true;
                        const data = responses.docente;
                        this.setValuesForm(data);

                        this.juradoInternoSeleccionado =
                            this.mapJuradoInternoLabel(data.juradoInterno);
                        this.juradoInterno.setValue(
                            this.juradoInternoSeleccionado.id
                        );

                        this.juradoExternoSeleccionado =
                            this.mapJuradoExternoLabel(data.juradoExterno);
                        this.juradoExterno.setValue(
                            this.juradoExternoSeleccionado.id
                        );
                    }

                    if (responses.coordinadorFase1) {
                        this.isCoordinadorFase1Created = true;
                        const data = responses.coordinadorFase1;
                        this.setValuesForm(data);

                        this.sustentacionForm
                            .get('conceptoCoordinador')
                            .setValue(
                                data.conceptoCoordinador == 'ACEPTADO'
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

                        this.sustentacionForm
                            .get('fechaActa')
                            .setValue(
                                actaDate
                                    ? new Date(`${actaDate}T00:00:00`)
                                    : null
                            );

                        this.sustentacionForm
                            .get('numeroActa')
                            .setValue(actaNumber ? actaNumber : null);

                        this.sustentacionForm
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
                        this.loadJuradoExterno();
                        this.loadJuradoInterno();
                        this.sustentacionForm
                            .get('juradosAceptados')
                            .setValue(
                                data?.juradosAceptados == 'ACEPTADO'
                                    ? 'Aceptado'
                                    : 'Rechazado'
                            );

                        this.sustentacionForm
                            .get('fechaActaConsejo')
                            .setValue(
                                data.fechaActaConsejo
                                    ? new Date(
                                          `${data.fechaActaConsejo}T00:00:00`
                                      )
                                    : null
                            );
                    }

                    if (responses.estudiante) {
                        this.isEstudianteCreated = true;
                        const data = responses.estudiante;
                        this.setValuesForm(data);

                        this.sustentacionForm
                            .get('fechaSustentacion')
                            .setValue(
                                data.fechaSustentacion
                                    ? new Date(
                                          `${data.fechaSustentacion}T00:00:00`
                                      )
                                    : null
                            );
                    }

                    if (responses.coordinadorFase4) {
                        this.isCoordinadorFase4Created = true;
                        const data = responses.coordinadorFase4;
                        this.setValuesForm(data);

                        let respuesta = '';
                        if (data.respuestaSustentacion == 'APROBADO') {
                            respuesta = 'Aprobado';
                        }
                        if (
                            data.respuestaSustentacion ==
                            'APROBADO_CON_OBSERVACIONES'
                        ) {
                            respuesta = 'Aprobado Con Observaciones';
                        }
                        if (data.respuestaSustentacion == 'NO_APROBADO') {
                            respuesta = 'No Aprobado';
                        }
                        if (data.respuestaSustentacion == 'APLAZADO') {
                            respuesta = 'Aplazado';
                        }
                        this.sustentacionForm
                            .get('respuestaSustentacion')
                            .setValue(respuesta);

                        this.sustentacionForm
                            .get('fechaActaFinal')
                            .setValue(
                                data?.fechaActaFinal
                                    ? new Date(
                                          `${data.fechaActaFinal}T00:00:00`
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
                        this.setup('linkFormatoF');
                        this.setup('linkMonografia');
                        this.setup('anexos');
                    }

                    if (
                        this.role.includes('ROLE_ESTUDIANTE') &&
                        this.isEstudianteCreated
                    ) {
                        this.setup('linkFormatoH');
                        this.setup('linkFormatoI');
                        this.setup('linkEstudioHojaVidaAcademicaGrado');
                    }

                    if (this.role.includes('ROLE_COORDINADOR')) {
                        if (this.isDocenteCreated) {
                            this.setup('linkFormatoF');
                            this.setup('linkMonografia');
                            this.setup('anexos');
                        }

                        if (
                            this.isCoordinadorFase1Created &&
                            this.sustentacionForm.get('conceptoCoordinador')
                                .value == 'Aceptado'
                        ) {
                            this.setup('linkEstudioHojaVidaAcademica');
                        }

                        if (
                            this.isCoordinadorFase2Created &&
                            this.sustentacionForm.get('conceptoComite').value ==
                                'Aprobado'
                        ) {
                            this.setup('linkFormatoG');
                        }

                        if (this.isCoordinadorFase3Created) {
                            this.setup('linkOficioConsejo');
                        }

                        if (this.isEstudianteCreated) {
                            this.setup('linkFormatoH');
                            this.setup('linkFormatoI');
                            this.setup('linkEstudioHojaVidaAcademicaGrado');
                        }
                    }
                    this.isLoading = false;
                    resolve();
                },
            });
            this.subscriptions.add(combinedSubscription);
        });
    }

    async updateSustentacion() {
        this.isSending = true;
        try {
            if (this.role.includes('ROLE_DOCENTE')) {
                if (
                    this.isDocenteCreated &&
                    (this.estado ===
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE1_SUSTENTACION ||
                        this.estado ===
                            EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COORDINADOR ||
                        this.estado ===
                            EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COMITE)
                ) {
                    const b64FormatoF = await this.formatFileString(
                        this.FileFormatoF,
                        'linkFormatoF'
                    );

                    const b64FormatoMonografia = await this.formatFileString(
                        this.FileMonografia,
                        'linkMonografia'
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

                    const sustentacionData = {
                        ...this.sustentacionForm.value,
                        anexos: anexosBase64,
                        linkMonografia: b64FormatoMonografia,
                        linkFormatoF: b64FormatoF,
                    };

                    await lastValueFrom(
                        this.sustentacionService.updateSustentacionDocente(
                            sustentacionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.estado ==
                    EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_ESTUDIANTE_SUSTENTACION
                ) {
                    this.isSending = false;
                    this.messageService.clear();
                    return this.messageService.add(
                        errorMessage('No puedes modificar los datos.')
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
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE1_SUSTENTACION
                ) {
                    const { linkEstudioHojaVidaAcademica } =
                        this.sustentacionForm.value;

                    const sustentacionData =
                        this.sustentacionForm.get('conceptoCoordinador')
                            .value == 'Aceptado'
                            ? {
                                  conceptoCoordinador: 'ACEPTADO',
                                  linkEstudioHojaVidaAcademica,
                              }
                            : {
                                  conceptoCoordinador: 'RECHAZADO',
                                  envioEmail: {
                                      asunto: this.sustentacionForm.get(
                                          'asuntoCoordinador'
                                      ).value,
                                      mensaje:
                                          this.sustentacionForm.get(
                                              'mensajeCoordinador'
                                          ).value,
                                  },
                              };

                    await lastValueFrom(
                        this.sustentacionService.createSustentacionCoordinadorFase1(
                            sustentacionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase2Created == false &&
                    this.updateCoordinadorFase1 == false &&
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE2_SUSTENTACION
                ) {
                    const { fechaActa, numeroActa, linkFormatoG } =
                        this.sustentacionForm.value;

                    const response = await firstValueFrom(
                        this.resolucionService.getResolucionDocente(
                            this.trabajoDeGradoId
                        )
                    );

                    const b64AnteproyectoFinal = await this.getAnteproyectoFile(
                        response.linkAnteproyectoFinal
                    );

                    const b64Monografia = await this.formatFileString(
                        this.FileMonografia,
                        null
                    );

                    const anexos = await this.formatFileString(
                        this.anexosFiles,
                        'anexos'
                    );

                    const b64HistoriaAcademica =
                        this.sustentacionForm.get('conceptoComite').value ==
                        'Aprobado'
                            ? await this.formatFileString(
                                  this.FileEstudioHVA,
                                  null
                              )
                            : '';

                    const b64FormatoG =
                        this.sustentacionForm.get('conceptoComite').value ==
                        'Aprobado'
                            ? await this.formatFileString(
                                  this.FileFormatoG,
                                  null
                              )
                            : '';

                    const b64Anexos = anexos.map(
                        (anexo: string, _: number) => anexo
                    );

                    const sustentacionData =
                        this.sustentacionForm.get('conceptoComite').value ==
                        'Aprobado'
                            ? {
                                  actaFechaRespuestaComite: [
                                      {
                                          fechaActa,
                                          numeroActa,
                                          conceptoComite: 'APROBADO',
                                      },
                                  ],
                                  envioEmail: {
                                      asunto: this.sustentacionForm.get(
                                          'asuntoComite'
                                      ).value,
                                      mensaje:
                                          this.sustentacionForm.get(
                                              'mensajeComite'
                                          ).value,
                                  },
                                  linkFormatoG,
                                  informacionEnvioConsejo: {
                                      b64Monografia,
                                      b64Anexos,
                                      b64FormatoG,
                                      b64HistoriaAcademica,
                                      b64AnteproyectoFinal,
                                  },
                              }
                            : {
                                  actaFechaRespuestaComite: [
                                      {
                                          fechaActa,
                                          numeroActa,
                                          conceptoComite: 'NO_APROBADO',
                                      },
                                  ],
                                  envioEmail: {
                                      asunto: this.sustentacionForm.get(
                                          'asuntoComite'
                                      ).value,
                                      mensaje:
                                          this.sustentacionForm.get(
                                              'mensajeComite'
                                          ).value,
                                  },
                              };

                    await lastValueFrom(
                        this.sustentacionService.createSustentacionCoordinadorFase2(
                            sustentacionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase3Created == false &&
                    this.updateCoordinadorFase2 == false &&
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE3_SUSTENTACION
                ) {
                    const {
                        idJuradoInterno,
                        idJuradoExterno,
                        linkOficioConsejo,
                        fechaActaConsejo,
                        numeroActaConsejo,
                    } = this.sustentacionForm.value;

                    const sustentacionData =
                        this.sustentacionForm.get('juradosAceptados').value ==
                        'Aceptado'
                            ? {
                                  juradosAceptados: 'ACEPTADO',
                                  idJuradoInterno: 'Sin cambios',
                                  idJuradoExterno: 'Sin cambios',
                                  linkOficioConsejo,
                                  fechaActaConsejo,
                                  numeroActaConsejo,
                              }
                            : {
                                  juradosAceptados: 'RECHAZADO',
                                  idJuradoInterno,
                                  idJuradoExterno,
                                  linkOficioConsejo,
                                  fechaActaConsejo,
                                  numeroActaConsejo,
                              };

                    await lastValueFrom(
                        this.sustentacionService.createSustentacionCoordinadorFase3(
                            sustentacionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase4Created == false &&
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE4_SUSTENTACION
                ) {
                    const respuestaMap = {
                        Aprobado: 'APROBADO',
                        'Aprobado Con Observaciones':
                            'APROBADO_CON_OBSERVACIONES',
                        Aplazado: 'APLAZADO',
                        'No Aprobado': 'NO_APROBADO',
                    };

                    const { respuestaSustentacion, ...restFormValues } =
                        this.sustentacionForm.value;

                    const sustentacionData = {
                        respuestaSustentacion:
                            respuestaMap[respuestaSustentacion],
                        ...restFormValues,
                    };

                    await lastValueFrom(
                        this.sustentacionService.createSustentacionCoordinadorFase4(
                            sustentacionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase1Created == true &&
                    (this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE1_SUSTENTACION ||
                        this.estado ==
                            EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COORDINADOR ||
                        this.updateCoordinadorFase1 == true)
                ) {
                    const { linkEstudioHojaVidaAcademica } =
                        this.sustentacionForm.value;

                    const sustentacionData =
                        this.sustentacionForm.get('conceptoCoordinador')
                            .value == 'Aceptado'
                            ? {
                                  conceptoCoordinador: 'ACEPTADO',
                                  linkEstudioHojaVidaAcademica,
                              }
                            : {
                                  conceptoCoordinador: 'RECHAZADO',
                                  envioEmail: {
                                      asunto: this.sustentacionForm.get(
                                          'asuntoCoordinador'
                                      ).value,
                                      mensaje:
                                          this.sustentacionForm.get(
                                              'mensajeCoordinador'
                                          ).value,
                                  },
                              };

                    await lastValueFrom(
                        this.sustentacionService.updateSustentacionCoordinadorFase1(
                            sustentacionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase2Created == true &&
                    (this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE2_SUSTENTACION ||
                        this.estado ==
                            EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COMITE ||
                        this.updateCoordinadorFase2 == true)
                ) {
                    const { fechaActa, numeroActa, linkFormatoG } =
                        this.sustentacionForm.value;

                    const response = await firstValueFrom(
                        this.resolucionService.getResolucionDocente(
                            this.trabajoDeGradoId
                        )
                    );

                    const b64AnteproyectoFinal = await this.getAnteproyectoFile(
                        response.linkAnteproyectoFinal
                    );

                    const b64Monografia = await this.formatFileString(
                        this.FileMonografia,
                        null
                    );

                    const anexos = await this.formatFileString(
                        this.anexosFiles,
                        'anexos'
                    );

                    const b64HistoriaAcademica =
                        this.sustentacionForm.get('conceptoComite').value ==
                        'Aprobado'
                            ? await this.formatFileString(
                                  this.FileEstudioHVA,
                                  null
                              )
                            : '';

                    const b64FormatoG =
                        this.sustentacionForm.get('conceptoComite').value ==
                        'Aprobado'
                            ? await this.formatFileString(
                                  this.FileFormatoG,
                                  null
                              )
                            : '';

                    const b64Anexos = anexos.map(
                        (anexo: string, _: number) => anexo
                    );

                    const sustentacionData =
                        this.sustentacionForm.get('conceptoComite').value ==
                        'Aprobado'
                            ? {
                                  actaFechaRespuestaComite: [
                                      {
                                          fechaActa,
                                          numeroActa,
                                          conceptoComite: 'APROBADO',
                                      },
                                  ],
                                  envioEmail: {
                                      asunto: this.sustentacionForm.get(
                                          'asuntoComite'
                                      ).value,
                                      mensaje:
                                          this.sustentacionForm.get(
                                              'mensajeComite'
                                          ).value,
                                  },
                                  linkFormatoG,
                                  informacionEnvioConsejo: {
                                      b64Monografia,
                                      b64Anexos,
                                      b64FormatoG,
                                      b64HistoriaAcademica,
                                      b64AnteproyectoFinal,
                                  },
                              }
                            : {
                                  actaFechaRespuestaComite: [
                                      {
                                          fechaActa,
                                          numeroActa,
                                          conceptoComite: 'NO_APROBADO',
                                      },
                                  ],
                                  envioEmail: {
                                      asunto: this.sustentacionForm.get(
                                          'asuntoComite'
                                      ).value,
                                      mensaje:
                                          this.sustentacionForm.get(
                                              'mensajeComite'
                                          ).value,
                                  },
                              };

                    await lastValueFrom(
                        this.sustentacionService.updateSustentacionCoordinadorFase2(
                            sustentacionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase3Created == true &&
                    (this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE3_SUSTENTACION ||
                        this.updateCoordinadorFase3 == true)
                ) {
                    const {
                        idJuradoInterno,
                        idJuradoExterno,
                        linkOficioConsejo,
                        numeroActaConsejo,
                        fechaActaConsejo,
                    } = this.sustentacionForm.value;

                    const sustentacionData =
                        this.sustentacionForm.get('juradosAceptados').value ==
                        'Aceptado'
                            ? {
                                  juradosAceptados: 'ACEPTADO',
                                  idJuradoInterno: this.juradoInterno.value,
                                  idJuradoExterno: this.juradoExterno.value,
                                  linkOficioConsejo,
                                  numeroActaConsejo,
                                  fechaActaConsejo,
                              }
                            : {
                                  juradosAceptados: 'RECHAZADO',
                                  idJuradoInterno,
                                  idJuradoExterno,
                                  linkOficioConsejo,
                                  numeroActaConsejo,
                                  fechaActaConsejo,
                              };

                    await lastValueFrom(
                        this.sustentacionService.updateSustentacionCoordinadorFase3(
                            sustentacionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase4Created == true &&
                    (this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE4_SUSTENTACION ||
                        this.estado == EstadoProceso.SUSTENTACION_APROBADA ||
                        this.estado ==
                            EstadoProceso.SUSTENTACION_APROBADA_CON_OBSERVACIONES ||
                        this.estado == EstadoProceso.SUSTENTACION_NO_APROBADA ||
                        this.estado == EstadoProceso.SUSTENTACION_APLAZADA)
                ) {
                    const respuestaMap = {
                        Aprobado: 'APROBADO',
                        'Aprobado Con Observaciones':
                            'APROBADO_CON_OBSERVACIONES',
                        Aplazado: 'APLAZADO',
                        'No Aprobado': 'NO_APROBADO',
                    };

                    const { respuestaSustentacion, ...restFormValues } =
                        this.sustentacionForm.value;

                    const sustentacionData = {
                        respuestaSustentacion:
                            respuestaMap[respuestaSustentacion],
                        ...restFormValues,
                    };

                    await lastValueFrom(
                        this.sustentacionService.updateSustentacionCoordinadorFase4(
                            sustentacionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase4Created == true &&
                    this.estado == EstadoProceso.CANCELADO_TRABAJO_GRADO
                ) {
                    this.isSending = false;
                    this.messageService.clear();
                    return this.messageService.add(
                        errorMessage('No puedes modificar los datos.')
                    );
                }
            }

            if (this.role.includes('ROLE_ESTUDIANTE')) {
                if (
                    this.isEstudianteCreated == false &&
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_ESTUDIANTE_SUSTENTACION
                ) {
                    try {
                        const response = await firstValueFrom(
                            this.sustentacionService.verificarEgresado(
                                this.trabajoDeGradoId
                            )
                        );

                        const sustentacionData = this.sustentacionForm.value;
                        const today = new Date();
                        const fechaSustentacionDate = new Date(
                            sustentacionData.fechaSustentacion
                        );
                        if (fechaSustentacionDate >= today) {
                            this.messageService.clear();
                            this.messageService.add(
                                warnMessage(
                                    'La fecha de sustentación debe ser menor que la fecha actual.'
                                )
                            );
                            this.isSending = false;
                            return;
                        }

                        if (response) {
                            await lastValueFrom(
                                this.sustentacionService.createSustentacionEstudiante(
                                    sustentacionData,
                                    this.trabajoDeGradoId
                                )
                            );
                        } else {
                            this.isSending = false;
                            this.messageService.clear();
                            return this.messageService.add(
                                warnMessage(
                                    'No es permitido registrar la información debido a que el estudiante no ha completado los datos de egresado.'
                                )
                            );
                        }
                    } catch (error) {
                        console.error('Error al crear la sustentación:', error);
                    }
                } else if (
                    this.isEstudianteCreated == true &&
                    (this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_ESTUDIANTE_SUSTENTACION ||
                        this.estado ==
                            EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE4_SUSTENTACION)
                ) {
                    const sustentacionData = this.sustentacionForm.value;

                    const today = new Date();
                    const fechaSustentacionDate = new Date(
                        sustentacionData.fechaSustentacion
                    );

                    if (fechaSustentacionDate >= today) {
                        this.messageService.clear();
                        this.messageService.add(
                            warnMessage(
                                'La fecha de sustentación debe ser menor que la fecha actual.'
                            )
                        );
                        return;
                    }

                    sustentacionData.linkFormatoH = await this.formatFileString(
                        this.FileFormatoH,
                        'linkFormatoH'
                    );

                    sustentacionData.linkFormatoI = await this.formatFileString(
                        this.FileFormatoI,
                        'linkFormatoI'
                    );

                    sustentacionData.linkEstudioHojaVidaAcademicaGrado =
                        await this.formatFileString(
                            this.FileEstudioHVAGrado,
                            'linkEstudioHojaVidaAcademicaGrado'
                        );

                    await lastValueFrom(
                        this.sustentacionService.updateSustentacionEstudiante(
                            sustentacionData,
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
            this.messageService.clear();
            this.messageService.add(
                errorMessage('Error al actualizar los datos en el backend')
            );
        }
    }

    async createSustentacion(): Promise<void> {
        this.isSending = true;
        try {
            if (this.role.includes('ROLE_DOCENTE') && !this.isDocenteCreated) {
                const response = await firstValueFrom(
                    this.sustentacionService.createSustentacionDocente(
                        this.sustentacionForm.value,
                        this.trabajoDeGradoId
                    )
                );

                if (response) {
                    this.trabajoDeGradoService.setSustentacionSeleccionada(
                        response
                    );
                    this.messageService.clear();
                    this.messageService.add(
                        infoMessage(Mensaje.GUARDADO_EXITOSO)
                    );

                    await firstValueFrom(timer(2000));

                    this.isSending = false;
                    this.router.navigate([`examen-de-valoracion`]);
                }
            }
        } catch (e) {
            this.handlerResponseException(e);
        }
    }

    createOrUpdateSustentacion() {
        if (this.sustentacionForm.invalid) {
            this.messageService.clear();
            this.messageService.add(
                warnMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS)
            );
            return;
        }

        this.router.url.includes('editar')
            ? this.updateSustentacion()
            : this.createSustentacion();
    }

    async getAnteproyectoFile(rutaArchivo: string): Promise<string> {
        try {
            const b64Anteproyecto = await firstValueFrom(
                this.trabajoDeGradoService.getFile(rutaArchivo)
            );
            return b64Anteproyecto;
        } catch (error) {
            console.error(
                `Error al obtener o convertir el archivo ${rutaArchivo}:`,
                error
            );
            return '';
        }
    }

    onFileSelectMonografia(event: any) {
        this.FileMonografia = this.uploadFileAndSetValue(
            'linkMonografia',
            event
        );
    }

    onFileSelectFormatoF(event: any) {
        this.FileFormatoF = this.uploadFileAndSetValue('linkFormatoF', event);
    }

    onFileSelectFormatoG(event: any) {
        this.FileFormatoG = this.uploadFileAndSetValue('linkFormatoG', event);
    }

    onFileSelectEstudioHVA(event: any) {
        this.FileEstudioHVA = this.uploadFileAndSetValue(
            'linkEstudioHojaVidaAcademica',
            event
        );
    }

    onFileSelectOficioConsejo(event: any) {
        this.FileOficioConsejo = this.uploadFileAndSetValue(
            'linkOficioConsejo',
            event
        );
    }

    onFileSelectFormatoH(event: any) {
        this.FileFormatoH = this.uploadFileAndSetValue('linkFormatoH', event);
    }

    onFileSelectFormatoI(event: any) {
        this.FileFormatoI = this.uploadFileAndSetValue('linkFormatoI', event);
    }

    onFileSelectEstudioHVAGrado(event: any) {
        this.FileEstudioHVAGrado = this.uploadFileAndSetValue(
            'linkEstudioHojaVidaAcademicaGrado',
            event
        );
    }

    onFileClear(field: string) {
        if (field == 'linkFormatoF') {
            this.FileFormatoF = null;
            this.FormatoF.clear();
            this.sustentacionForm.get('linkFormatoF').reset();
        }

        if (field == 'linkMonografia') {
            this.FileMonografia = null;
            this.Monografia.clear();
            this.sustentacionForm.get('linkMonografia').reset();
        }

        if (field == 'linkFormatoG') {
            this.FileFormatoG = null;
            this.FormatoG.clear();
            this.sustentacionForm.get('linkFormatoG').reset();
        }

        if (field == 'linkEstudioHojaVidaAcademica') {
            this.FileEstudioHVA = null;
            this.EstudioHVA.clear();
            this.sustentacionForm.get('linkEstudioHojaVidaAcademica').reset();
        }

        if (field == 'linkOficioConsejo') {
            this.FileOficioConsejo = null;
            this.OficioConsejo.clear();
            this.sustentacionForm.get('linkOficioConsejo').reset();
        }

        if (field == 'linkFormatoH') {
            this.FileFormatoH = null;
            this.FormatoH.clear();
            this.sustentacionForm.get('linkFormatoH').reset();
        }

        if (field == 'linkFormatoI') {
            this.FileFormatoI = null;
            this.FormatoI.clear();
            this.sustentacionForm.get('linkFormatoI').reset();
        }

        if (field == 'linkEstudioHojaVidaAcademicaGrado') {
            this.FileEstudioHVAGrado = null;
            this.EstudioHVAGrado.clear();
            this.sustentacionForm
                .get('linkEstudioHojaVidaAcademicaGrado')
                .reset();
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
                const fileExtension =
                    fileControlName === 'linkEstudioHojaVidaAcademicaGrado' ||
                    fileControlName === 'linkEstudioHojaVidaAcademica'
                        ? 'docx'
                        : 'pdf';
                const result = fileControlName
                    ? `${fileControlName}.${fileExtension}-${base64}`
                    : base64;
                return result;
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
                    this.sustentacionForm
                        .get(fileControlName)
                        .setValue(
                            `${fileControlName}.${
                                fileType.includes('pdf') ? 'pdf' : 'docx'
                            }-${base64}`
                        );
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
        return (
            filePath.startsWith('./files/') &&
            (filePath.includes('.pdf') || filePath.includes('.docx'))
        );
    };

    async getFileAndSetValue(fieldName: string) {
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
            const fieldValues = this.sustentacionForm.get(fieldName).value;
            if (fieldName === 'anexos') {
                for (const anexo of fieldValues) {
                    if (this.isValidFilePath(anexo)) {
                        try {
                            const response = await firstValueFrom(
                                this.trabajoDeGradoService.getFile(anexo)
                            );
                            this.downloadFile(response, anexo, fieldName);
                        } catch (error) {
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
                    } catch (error) {
                        handleError();
                    }
                } else {
                    handleError();
                }
            }
        } catch (error) {
            handleError();
        }
    }

    //#region Director and Coodirector
    showBuscadorJuradoInterno() {
        return this.dialogService.open(BuscadorDocentesComponent, {
            header: 'Seleccionar docente',
            width: '60%',
            styleClass: 'custom-docente-dialog',
        });
    }

    showBuscadorJuradoExterno() {
        return this.dialogService.open(BuscadorExpertosComponent, {
            header: 'Seleccionar experto',
            width: '60%',
            styleClass: 'custom-experto-dialog',
        });
    }

    mapJuradoInternoLabel(docente: any) {
        const ultimaUniversidad =
            docente?.titulos?.length > 0
                ? docente.titulos[docente.titulos.length - 1].universidad
                : null;

        return {
            id: docente.id,
            nombres: docente.nombres ?? docente.nombre + ' ' + docente.apellido,
            correo: docente.correoElectronico ?? docente.correo,
            universidad: docente.universidad ?? ultimaUniversidad,
        };
    }

    mapJuradoExternoLabel(experto: any) {
        return {
            id: experto.id,
            nombres: experto.nombres ?? experto.nombre + ' ' + experto.apellido,
            correo: experto.correoElectronico ?? experto.correo,
            universidad: experto.universidad,
        };
    }

    async onSeleccionarJuradoInterno() {
        try {
            const ref = this.showBuscadorJuradoInterno();
            const response = await firstValueFrom(ref.onClose);

            if (response) {
                const juradoInterno = this.mapJuradoInternoLabel(response);
                this.juradoInternoSeleccionado = juradoInterno;
                this.juradoInterno.setValue(juradoInterno.id);
            }
        } catch (error) {
            console.error('Error al seleccionar jurado interno', error);
        }
    }

    async onSeleccionarJuradoExterno() {
        try {
            const ref = this.showBuscadorJuradoExterno();
            const response = await firstValueFrom(ref.onClose);

            if (response) {
                const juradoExterno = this.mapJuradoExternoLabel(response);
                this.juradoExternoSeleccionado = juradoExterno;
                this.juradoExterno.setValue(juradoExterno.id);
            }
        } catch (error) {
            console.error('Error al seleccionar jurado externo', error);
        }
    }

    limpiarJuradoExterno() {
        this.juradoExterno.setValue(null);
    }

    limpiarJuradoInterno() {
        this.juradoInterno.setValue(null);
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

    redirectToResolucion(resolucionId: number) {
        resolucionId
            ? this.router.navigate([
                  `examen-de-valoracion/resolucion/editar/${this.trabajoDeGradoId}`,
              ])
            : this.router.navigate(['examen-de-valoracion/resolucion']);
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
        if (this.router.url.includes('sustentacion')) {
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
            this.isCoordinadorFase2Created &&
            this.isCoordinadorFase3Created &&
            this.isEstudianteCreated &&
            this.isCoordinadorFase4Created
        ) {
            return 'Modificar Informacion';
        } else {
            return 'Guardar';
        }
    }
}
