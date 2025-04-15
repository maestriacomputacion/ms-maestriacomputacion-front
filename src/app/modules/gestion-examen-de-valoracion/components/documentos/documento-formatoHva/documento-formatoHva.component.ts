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
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subscription, firstValueFrom } from 'rxjs';
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
import { ResolucionService } from '../../../services/resolucion.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'documento-formatoHva',
    templateUrl: 'documento-formatoHva.component.html',
    styleUrls: ['documento-formatoHva.component.scss'],
})
export class DocumentoFormatoHvaComponent implements OnInit {
    @Input() trabajoDeGradoId: number;
    @Input() fileFormatoHva: File;

    @Output() formReady = new EventEmitter<FormGroup>();
    @Output() formatoHvaDocxGenerated = new EventEmitter<Blob>();

    @ViewChild('formatoHva') formatoHva!: ElementRef;

    formatoHvaForm: FormGroup;

    estudianteSubscription: Subscription;
    tituloSubscription: Subscription;

    loading: boolean = false;

    fechaActual: string;

    title: string = 'docx-generator';

    estudianteSeleccionado: any;
    selectedSemestre: any;
    selectedArea: any;

    tiposAreaFormacion = [
        { label: 'Fundamentación', value: 'F' },
        { label: 'Electiva', value: 'E' },
        { label: 'Investigación', value: 'I' },
        { label: 'Complementación', value: 'C' },
    ];

    asignaturas = [
        { nombre: 'Asignatura A', creditos: 3 },
        { nombre: 'Asignatura B', creditos: 4 },
        { nombre: 'Asignatura C', creditos: 5 },
        { nombre: 'Asignatura D', creditos: 2 },
        { nombre: 'Asignatura E', creditos: 5 },
        { nombre: 'Asignatura F', creditos: 4 },
        { nombre: 'Asignatura G', creditos: 5 },
    ];

    semestres = [
        { label: 'Semestre I', value: 'I' },
        { label: 'Semestre II', value: 'II' },
        { label: 'Semestre III', value: 'III' },
        { label: 'Semestre IV', value: 'IV' },
    ];

    pruebaSuperadaOptions = [
        { label: 'Sí', value: 'Si' },
        { label: 'No', value: 'No' },
    ];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private trabajoDeGradoService: TrabajoDeGradoService,
        private resolucionService: ResolucionService
    ) {}

    get estudiante(): FormControl {
        return this.formatoHvaForm.get('estudiante') as FormControl;
    }

    get director(): FormControl {
        return this.formatoHvaForm.get('director') as FormControl;
    }

    get codirector(): FormControl {
        return this.formatoHvaForm.get('codirector') as FormControl;
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

    async loadCodirector() {
        try {
            const response = await firstValueFrom(
                this.resolucionService.getResolucionDocente(
                    this.trabajoDeGradoId
                )
            );
            if (response) {
                this.codirector.setValue(response.codirector.nombres);
            }
        } catch (error) {
            console.error('Error al obtener el codirector:', error);
        }
    }

    ngOnInit() {
        this.initForm();
        this.tituloSubscription =
            this.trabajoDeGradoService.tituloSeleccionadoSubject$.subscribe({
                next: (response) => {
                    if (response) {
                        this.formatoHvaForm.get('titulo').setValue(response);
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });

        this.estudianteSubscription =
            this.trabajoDeGradoService.estudianteSeleccionado$.subscribe({
                next: (response) => {
                    if (response) {
                        this.estudianteSeleccionado = response;
                        this.formatoHvaForm
                            .get('estudiante')
                            .setValue(
                                this.nombreCompletoEstudiante(
                                    this.estudianteSeleccionado
                                )
                            );
                        this.formatoHvaForm
                            .get('codigo')
                            .setValue(this.estudianteSeleccionado.codigo);
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });

        if (this.trabajoDeGradoId) {
            this.loadDirector();
            this.loadCodirector();
        }
    }

    initForm(): void {
        this.formatoHvaForm = this.fb.group({
            estudiante: [null, Validators.required],
            codigo: [null, Validators.required],
            planEstudios: ['2024-2', Validators.required],
            fechaRevision: [null, Validators.required],
            areasFormacion: this.fb.array([], Validators.required),
            pruebaSuperada: [null, Validators.required],
            minimoArticulo: [null, Validators.required],
            creditosCumplidos: [null, Validators.required],
            titulo: [null, Validators.required],
            director: [null, Validators.required],
            codirector: [null, Validators.required],
            coordinador: [null, Validators.required],
        });
        this.formReady.emit(this.formatoHvaForm);
    }

    ngOnDestroy() {
        if (this.estudianteSubscription) {
            this.estudianteSubscription.unsubscribe();
        }
        if (this.tituloSubscription) {
            this.tituloSubscription.unsubscribe();
        }
    }

    onSemestreChange(event: any): void {
        this.selectedSemestre = event.value;
    }

    onAreaFormacionChange(event: any): void {
        this.selectedArea = event.value;
        const areasFormacionArray = this.formatoHvaForm.get(
            'areasFormacion'
        ) as FormArray;
        const areaExistente = areasFormacionArray.controls.find(
            (control) =>
                control.get('tipo').value.label === this.selectedArea.label &&
                control.get('semestre').value.label ===
                    this.selectedSemestre.label
        );
        if (!areaExistente) {
            const areaFormGroup = this.fb.group({
                tipo: this.selectedArea,
                semestre: this.selectedSemestre,
                asignaturas: this.fb.array([]),
            });
            areasFormacionArray.push(areaFormGroup);
        }
    }

    onAsignaturaChange(areaIndex: number, asignaturaSeleccionada: any): void {
        const asignaturaFormGroup = this.fb.group({
            nombre: asignaturaSeleccionada.nombre,
            creditos: asignaturaSeleccionada.creditos,
        });
        const asignaturasFormArray = (
            this.formatoHvaForm.get('areasFormacion') as FormArray
        )
            .at(areaIndex)
            .get('asignaturas') as FormArray;
        asignaturasFormArray.push(asignaturaFormGroup);
    }

    removeAreaFormacion(areaIndex: number): void {
        const areasFormacionArray = this.formatoHvaForm.get(
            'areasFormacion'
        ) as FormArray;
        areasFormacionArray.removeAt(areaIndex);
    }

    removeAsignatura(areaIndex: number, asignaturaIndex: number): void {
        const asignaturasFormArray = (
            this.formatoHvaForm.get('areasFormacion') as FormArray
        )
            .at(areaIndex)
            .get('asignaturas') as FormArray;
        asignaturasFormArray.removeAt(asignaturaIndex);
    }

    get areasFormacionControls() {
        return (this.formatoHvaForm.get('areasFormacion') as FormArray)
            .controls;
    }

    transformFormValues(formValues: any): any {
        const transformed = { ...formValues };
        delete transformed.areasFormacion;
        formValues.areasFormacion.forEach((area: any, _: number) => {
            area.asignaturas.forEach(
                (asignatura: any, asignaturaIndex: number) => {
                    const keyNombre = `asignatura${area.tipo.value}${area.semestre.value}${asignaturaIndex}.nombre`;
                    const keyCreditos = `asignatura${area.tipo.value}${area.semestre.value}${asignaturaIndex}.creditos`;
                    transformed[keyNombre] = asignatura.nombre;
                    transformed[keyCreditos] = asignatura.creditos;
                }
            );
        });
        return transformed;
    }

    onDownload() {
        if (this.formatoHvaForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            this.loading = true;
            const formValues = this.formatoHvaForm.value;
            const transformedData = this.transformFormValues(formValues);
            const fechaRevision = new Date(
                transformedData.fechaRevision
            ).toLocaleDateString();
            const docData: any = {
                estudiante: transformedData.estudiante,
                codigo: transformedData.codigo,
                planEstudios: transformedData.planEstudios,
                fechaRevision: fechaRevision,
                pruebaSuperada: transformedData.pruebaSuperada.value,
                minimoArticulo: transformedData.minimoArticulo,
                creditosCumplidos: transformedData.creditosCumplidos,
                titulo: transformedData.titulo,
                director: transformedData.director,
                codirector: transformedData.codirector,
                coordinador: transformedData.coordinador,
            };

            const expectedKeys = [
                'asignaturaFI0.nombre',
                'asignaturaFI0.creditos',
                'asignaturaFII0.nombre',
                'asignaturaFII0.creditos',
                'asignaturaFIII0.nombre',
                'asignaturaFIII0.creditos',
                'asignaturaFIV0.nombre',
                'asignaturaFIV0.creditos',

                'asignaturaFI1.nombre',
                'asignaturaFI1.creditos',
                'asignaturaFII1.nombre',
                'asignaturaFII1.creditos',
                'asignaturaFIII1.nombre',
                'asignaturaFIII1.creditos',
                'asignaturaFIV1.nombre',
                'asignaturaFIV1.creditos',

                'asignaturaEI0.nombre',
                'asignaturaEI0.creditos',
                'asignaturaEII0.nombre',
                'asignaturaEII0.creditos',
                'asignaturaEIII0.nombre',
                'asignaturaEIII0.creditos',
                'asignaturaEIV0.nombre',
                'asignaturaEIV0.creditos',

                'asignaturaEI1.nombre',
                'asignaturaEI1.creditos',
                'asignaturaEII1.nombre',
                'asignaturaEII1.creditos',
                'asignaturaEIII1.nombre',
                'asignaturaEIII1.creditos',
                'asignaturaEIV1.nombre',
                'asignaturaEIV1.creditos',

                'asignaturaII0.nombre',
                'asignaturaII0.creditos',
                'asignaturaIII0.nombre',
                'asignaturaIII0.creditos',
                'asignaturaIIII0.nombre',
                'asignaturaIIII0.creditos',
                'asignaturaIIV0.nombre',
                'asignaturaIIV0.creditos',

                'asignaturaII1.nombre',
                'asignaturaII1.creditos',
                'asignaturaIII1.nombre',
                'asignaturaIII1.creditos',
                'asignaturaIIII1.nombre',
                'asignaturaIIII1.creditos',
                'asignaturaIIV1.nombre',
                'asignaturaIIV1.creditos',

                'asignaturaCI0.nombre',
                'asignaturaCI0.creditos',
                'asignaturaCII0.nombre',
                'asignaturaCII0.creditos',
                'asignaturaCIII0.nombre',
                'asignaturaCIII0.creditos',
                'asignaturaCIV0.nombre',
                'asignaturaCIV0.creditos',

                'asignaturaCI1.nombre',
                'asignaturaCI1.creditos',
                'asignaturaCII1.nombre',
                'asignaturaCII1.creditos',
                'asignaturaCIII1.nombre',
                'asignaturaCIII1.creditos',
                'asignaturaCIV1.nombre',
                'asignaturaCIV1.creditos',
            ];

            expectedKeys.forEach((key) => {
                docData[key] = '';
            });

            Object.keys(transformedData).forEach((key) => {
                if (expectedKeys.includes(key)) {
                    docData[key] = transformedData[key];
                }
            });

            this.loadFile(
                'assets/docs/formatoHva.docx',
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

                    saveAs(out, 'formatoHva.docx');
                    this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
                    this.loading = false;
                }
            );
        }
    }

    onInsertar() {
        if (this.formatoHvaForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const formValues = this.formatoHvaForm.value;
            const transformedData = this.transformFormValues(formValues);
            const fechaRevision = new Date(
                transformedData.fechaRevision
            ).toLocaleDateString();
            const docData: any = {
                estudiante: transformedData.estudiante,
                codigo: transformedData.codigo,
                planEstudios: transformedData.planEstudios,
                fechaRevision: fechaRevision,
                pruebaSuperada: transformedData.pruebaSuperada.value,
                minimoArticulo: transformedData.minimoArticulo,
                creditosCumplidos: transformedData.creditosCumplidos,
                titulo: transformedData.titulo,
                director: transformedData.director,
                codirector: transformedData.codirector,
                coordinador: transformedData.coordinador,
            };

            const expectedKeys = [
                'asignaturaFI0.nombre',
                'asignaturaFI0.creditos',
                'asignaturaFII0.nombre',
                'asignaturaFII0.creditos',
                'asignaturaFIII0.nombre',
                'asignaturaFIII0.creditos',
                'asignaturaFIV0.nombre',
                'asignaturaFIV0.creditos',

                'asignaturaFI1.nombre',
                'asignaturaFI1.creditos',
                'asignaturaFII1.nombre',
                'asignaturaFII1.creditos',
                'asignaturaFIII1.nombre',
                'asignaturaFIII1.creditos',
                'asignaturaFIV1.nombre',
                'asignaturaFIV1.creditos',

                'asignaturaEI0.nombre',
                'asignaturaEI0.creditos',
                'asignaturaEII0.nombre',
                'asignaturaEII0.creditos',
                'asignaturaEIII0.nombre',
                'asignaturaEIII0.creditos',
                'asignaturaEIV0.nombre',
                'asignaturaEIV0.creditos',

                'asignaturaEI1.nombre',
                'asignaturaEI1.creditos',
                'asignaturaEII1.nombre',
                'asignaturaEII1.creditos',
                'asignaturaEIII1.nombre',
                'asignaturaEIII1.creditos',
                'asignaturaEIV1.nombre',
                'asignaturaEIV1.creditos',

                'asignaturaII0.nombre',
                'asignaturaII0.creditos',
                'asignaturaIII0.nombre',
                'asignaturaIII0.creditos',
                'asignaturaIIII0.nombre',
                'asignaturaIIII0.creditos',
                'asignaturaIIV0.nombre',
                'asignaturaIIV0.creditos',

                'asignaturaII1.nombre',
                'asignaturaII1.creditos',
                'asignaturaIII1.nombre',
                'asignaturaIII1.creditos',
                'asignaturaIIII1.nombre',
                'asignaturaIIII1.creditos',
                'asignaturaIIV1.nombre',
                'asignaturaIIV1.creditos',

                'asignaturaCI0.nombre',
                'asignaturaCI0.creditos',
                'asignaturaCII0.nombre',
                'asignaturaCII0.creditos',
                'asignaturaCIII0.nombre',
                'asignaturaCIII0.creditos',
                'asignaturaCIV0.nombre',
                'asignaturaCIV0.creditos',

                'asignaturaCI1.nombre',
                'asignaturaCI1.creditos',
                'asignaturaCII1.nombre',
                'asignaturaCII1.creditos',
                'asignaturaCIII1.nombre',
                'asignaturaCIII1.creditos',
                'asignaturaCIV1.nombre',
                'asignaturaCIV1.creditos',
            ];

            expectedKeys.forEach((key) => {
                docData[key] = '';
            });

            Object.keys(transformedData).forEach((key) => {
                if (expectedKeys.includes(key)) {
                    docData[key] = transformedData[key];
                }
            });

            let fileDoc: Blob;

            this.loadFile(
                'assets/docs/formatoHva.docx',
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

                    fileDoc = doc.getZip().generate({
                        type: 'blob',
                        mimeType:
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    });
                    this.formatoHvaDocxGenerated.emit(fileDoc);
                    this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
                }
            );
        }
    }

    loadFile(url: string, callback: (error: any, content: any) => void) {
        JSZipUtils.default.getBinaryContent(url, callback);
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
