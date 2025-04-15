import {
    Component,
    ElementRef,
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
import { MessageService } from 'primeng/api';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import { PdfService } from 'src/app/shared/services/pdf.service';
import { TrabajoDeGradoService } from '../../../services/trabajoDeGrado.service';
import { Mensaje } from 'src/app/core/enums/enums';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { Subscription } from 'rxjs';

@Component({
    selector: 'documento-formatoB',
    templateUrl: 'documento-formatoB.component.html',
    styleUrls: ['documento-formatoB.component.scss'],
})
export class DocumentoFormatoBComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();
    @Output() formatoBPdfGenerated = new EventEmitter<File>();

    @ViewChild('formatoB') formatoB!: ElementRef;

    private estudianteSubscription: Subscription;
    private tituloSubscription: Subscription;
    private evaluadorInternoSubscription: Subscription;
    private evaluadorExternoSubscription: Subscription;

    formatoBForm: FormGroup;
    fechaActual: Date;

    loading = false;

    estudianteSeleccionado: Estudiante = {};
    estados: string[] = ['Aprobado', 'Aplazado', 'No Aprobado'];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private trabajoDeGradoService: TrabajoDeGradoService,
        private pdfService: PdfService
    ) {}

    get titulo(): FormControl {
        return this.formatoBForm.get('titulo') as FormControl;
    }

    get estudiante(): FormControl {
        return this.formatoBForm.get('estudiante') as FormControl;
    }

    get experto(): FormControl {
        return this.formatoBForm.get('juradoExterno') as FormControl;
    }

    get docente(): FormControl {
        return this.formatoBForm.get('juradoInterno') as FormControl;
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

        this.evaluadorExternoSubscription =
            this.trabajoDeGradoService.evaluadorExternoSeleccionadoSubject$.subscribe(
                {
                    next: (response) => {
                        if (response) {
                            this.experto.setValue(response);
                        }
                    },
                    error: (e) => this.handlerResponseException(e),
                }
            );
        this.evaluadorInternoSubscription =
            this.trabajoDeGradoService.evaluadorInternoSeleccionadoSubject$.subscribe(
                {
                    next: (response) => {
                        if (response) {
                            this.docente.setValue(response);
                        }
                    },
                    error: (e) => this.handlerResponseException(e),
                }
            );

        this.formatoBForm.get('fecha').setValue(this.fechaActual);
    }

    initForm(): void {
        this.formatoBForm = this.fb.group({
            titulo: [null, Validators.required],
            estudiante: [null, Validators.required],
            juradoInterno: [null, Validators.required],
            juradoExterno: [null, Validators.required],
            conceptoJurado: [null, Validators.required],
            fecha: [null, Validators.required],
        });

        this.formatoBForm.get('titulo').disable();
        this.formatoBForm.get('estudiante').disable();
        this.formatoBForm.get('juradoInterno').disable();
        this.formatoBForm.get('juradoExterno').disable();
        this.formatoBForm.get('fecha').disable();
        this.formatoBForm.get('conceptoJurado').disable();
        this.formReady.emit(this.formatoBForm);
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

    getFormattedDate(): string {
        const rawDate = new Date();
        const day = rawDate.getDate();
        const month = rawDate.toLocaleString('default', { month: 'short' });
        const year = rawDate.getFullYear();
        return `${day} ${month} ${year}`;
    }

    onDownload() {
        if (this.formatoBForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const content = document.getElementById('formatoB1');
            const nextContent = document.getElementById('formatoB2');
            this.pdfService
                .generatePDF(content, nextContent)
                .then((pdfBlob: Blob) => {
                    const file = new File(
                        [pdfBlob],
                        `${this.estudianteSeleccionado.codigo} - formatoB.pdf`,
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
                });
        }
    }

    onAdjuntar() {
        if (this.formatoBForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const content = document.getElementById('formatoB1');
            const nextContent = document.getElementById('formatoB2');
            this.pdfService
                .generatePDF(content, nextContent)
                .then((pdfBlob: Blob) => {
                    const file = new File(
                        [pdfBlob],
                        `${this.estudianteSeleccionado.codigo} - formatoB.pdf`,
                        {
                            type: 'application/pdf',
                        }
                    );
                    this.formatoBPdfGenerated.emit(file);
                    this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
                });
        }
    }

    getFormControl(formControlName: string): FormControl {
        return this.formatoBForm.get(formControlName) as FormControl;
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
