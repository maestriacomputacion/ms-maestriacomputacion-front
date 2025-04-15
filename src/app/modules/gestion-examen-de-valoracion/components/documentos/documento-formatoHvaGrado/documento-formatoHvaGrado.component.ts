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
import { Subscription } from 'rxjs';
import * as PizZip from 'pizzip';
import * as Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import * as JSZipUtils from 'pizzip/utils/index.js';
import { Mensaje } from 'src/app/core/enums/enums';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { TrabajoDeGradoService } from '../../../services/trabajoDeGrado.service';

@Component({
    selector: 'documento-formatoHvaGrado',
    templateUrl: 'documento-formatoHvaGrado.component.html',
    styleUrls: ['documento-formatoHvaGrado.component.scss'],
})
export class DocumentoFormatoHvaGradoComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();

    @ViewChild('formatoHvaGrado') formatoHvaGrado!: ElementRef;

    tituloSubscription: Subscription;
    estudianteSubscription: Subscription;

    formatoHvaGradoForm: FormGroup;

    loading = false;

    estudianteSeleccionado: any;

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private trabajoDeGradoService: TrabajoDeGradoService
    ) {}

    get estudiante(): FormControl {
        return this.formatoHvaGradoForm.get('estudiante') as FormControl;
    }

    ngOnInit() {
        this.initForm();

        this.estudianteSubscription =
            this.trabajoDeGradoService.estudianteSeleccionado$.subscribe({
                next: (response) => {
                    if (response) {
                        this.estudianteSeleccionado = response;
                        this.formatoHvaGradoForm
                            .get('estudiante')
                            .setValue(
                                this.nombreCompletoEstudiante(
                                    this.estudianteSeleccionado
                                )
                            );
                        this.formatoHvaGradoForm
                            .get('codigo')
                            .setValue(this.estudianteSeleccionado.codigo);
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });
    }

    initForm(): void {
        const today = new Date();
        const dia = today.getDate();
        const mes = today.getMonth() + 1;
        const anio = today.getFullYear();

        this.formatoHvaGradoForm = this.fb.group({
            dia: [dia, Validators.required],
            mes: [mes, Validators.required],
            anio: [anio, Validators.required],
            facultad: [
                'Ingeniería Electrónica y Telecomunicaciones',
                Validators.required,
            ],
            programa: ['Maestría en Computación', Validators.required],
            estudiante: [null, Validators.required],
            cedula: [null, Validators.required],
            lugarExpedicion: [null, Validators.required],
            codigo: [null, Validators.required],
            telefonoFijo: [null, Validators.required],
            telefonoCelular: [null, Validators.required],
            codigoSaberPro: [null, Validators.required],
            residenciaActual: [null, Validators.required],
            departamento: [null, Validators.required],
            municipio: [null, Validators.required],
            email: [null, Validators.required],
            coordinador: ['[NOMBRE]', Validators.required],
        });
        this.formReady.emit(this.formatoHvaGradoForm);
    }

    ngOnDestroy() {
        if (this.estudianteSubscription) {
            this.estudianteSubscription.unsubscribe();
        }
    }

    onDownload() {
        if (this.formatoHvaGradoForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            this.loading = true;
            const formValues = this.formatoHvaGradoForm.value;
            const docData: any = {
                dia: formValues.dia,
                mes: formValues.mes,
                anio: formValues.anio,
                facultad: formValues.facultad,
                programa: formValues.programa,
                estudiante: formValues.estudiante,
                cedula: formValues.cedula,
                lugarExpedicion: formValues.lugarExpedicion,
                codigo: formValues.codigo,
                telefonoFijo: formValues.telefonoFijo,
                telefonoCelular: formValues.telefonoCelular,
                codigoSaberPro: formValues.codigoSaberPro,
                residenciaActual: formValues.residenciaActual,
                departamento: formValues.departamento,
                municipio: formValues.municipio,
                email: formValues.email,
                coordinador: formValues.coordinador,
            };

            this.loadFile(
                'assets/docs/formatoHvaGrado.docx',
                (error: any, content: any) => {
                    if (error) {
                        throw error;
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
                        console.error(error);
                        throw error;
                    }

                    const out = doc.getZip().generate({
                        type: 'blob',
                        mimeType:
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    });

                    saveAs(out, 'formatoHvaGrado.docx');
                    this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
                    this.loading = false;
                }
            );
        }
    }

    loadFile(url: string, callback: (error: any, content: any) => void) {
        JSZipUtils.default.getBinaryContent(url, callback);
    }

    getFormControl(formControlName: string): FormControl {
        return this.formatoHvaGradoForm.get(formControlName) as FormControl;
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
