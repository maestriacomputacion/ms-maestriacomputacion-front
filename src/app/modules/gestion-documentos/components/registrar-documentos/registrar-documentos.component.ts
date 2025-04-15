import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    ConfirmationService,
    MenuItem,
    MessageService,
    PrimeNGConfig,
} from 'primeng/api';
import { DocumentosService } from '../../services/documentos.service';

import { Acta } from 'src/app/modules/gestion-asignaturas/models/acta';
import { DocMaestria } from 'src/app/modules/gestion-asignaturas/models/docMaestria';

import { FileUpload } from 'primeng/fileupload';
import { Oficio } from 'src/app/modules/gestion-asignaturas/models/oficio';
import { Otro } from 'src/app/modules/gestion-asignaturas/models/otro';

@Component({
    selector: 'app-registrar-documentos',
    templateUrl: './registrar-documentos.component.html',
    styleUrls: ['./registrar-documentos.component.scss'],
})
export class RegistrarDocumentosComponent implements OnInit {
    documentoForm!: FormGroup;

    idDocMaestria: DocMaestria = {};
    selectedTipoDocumento: string;
    fechaAprobacion: Date;
    selectedOption: string;
    base64File: string;
    fileName: string;

    //SECCION ACTAS
    nuevaActa: Acta = {};
    numeroActa: string;
    adjuntarActa: any[] = [];

    //SECCION OFICIO
    nuevoOficio: Oficio = {};
    numeroOficio: string;

    //SECCION OTROS
    nuevoOtro: Otro = {};
    versionDoc: number;
    nombreDocumento: string;
    descripcionDocumento: string;


    items: MenuItem[];
    home: MenuItem;

    constructor(
        private readonly fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private documentosService: DocumentosService,
        private primengConfig: PrimeNGConfig
    ) {}

    ngOnInit(): void {
        this.documentoForm = this.initForm();
        this.primengConfig.ripple = true;
        this.items = [

            {label: 'Gestión Documentos', routerLink: ['/gestion-documentos'] },
            {label: 'Registrar Documento'}
        ];

        this.home = {icon: 'pi pi-home', routerLink: ['/']};
    }

    registrarDocumento() {
        const data = this.documentoForm.value;
        // Switch para determinar la acción basada en selectedOption
        switch (data.selectedOption) {
            case 'acta':
                if (
                    !data.numeroActa ||
                    !data.fechaAprobacion ||
                    !data.base64File
                ) {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Info',
                        detail: 'Complete todos los campos del formulario.',
                    });
                } else {
                    this.nuevaActa.numeroActa = data.numeroActa;
                    this.nuevaActa.fechaActa = data.fechaAprobacion;
                    this.idDocMaestria.linkDocumento =
                        this.fileName + this.base64File;
                    this.nuevaActa.idDocMaestria = this.idDocMaestria;
                    console.log('Acta enviada al servicio', this.nuevaActa);
                    // Llamar al servicio para registrar el documento
                    this.documentosService
                        .createDocumentoActa(this.nuevaActa)
                        .subscribe({
                            next: (response) => {
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Documento registrado',
                                    detail: 'El documento ha sido registrado exitosamente.',
                                });
                                //console.log(response);
                                this.limpiarFormulario();
                                this.limpiarBase64();
                            },
                            error: (error) => {
                                // Manejo de errores
                                const errorMessage =
                                    this.parseErrorMessage(error);
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Error al registrar el documento',
                                    detail: errorMessage,
                                });
                            },
                        });
                }
                break;
            case 'oficio':
                if (
                    !data.numeroOficio ||
                    !data.fechaAprobacion ||
                    !data.base64File ||
                    !data.asuntoOfi?.trim()
                ) {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Info',
                        detail: 'Complete todos los campos del formulario.',
                    });
                } else {
                    this.nuevoOficio.numeroOficio = data.numeroOficio;
                    this.nuevoOficio.fechaOficio = data.fechaAprobacion;
                    this.nuevoOficio.asuntoOfi = data.asuntoOfi;
                    this.idDocMaestria.linkDocumento =
                        this.fileName + this.base64File;
                    this.nuevoOficio.idDocMaestria = this.idDocMaestria;
                    console.log(this.nuevoOficio);
                    // Llamar al servicio para registrar el documento
                    this.documentosService
                        .createDocumentoOficio(this.nuevoOficio)
                        .subscribe({
                            next: (response) => {
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Documento registrado',
                                    detail: 'El documento ha sido registrado exitosamente.',
                                });
                                this.limpiarFormulario();
                                this.limpiarBase64();
                            },
                            error: (error) => {
                                // Manejo de errores
                                // Manejo de errores
                                const errorMessage =
                                    this.parseErrorMessage(error);
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Error al registrar el documento',
                                    detail: errorMessage,
                                });
                            },
                        });
                }
                break;
            case 'formato':
            case 'reglamento':
            case 'docAcreditacion':
            case 'otro':
            case 'docSoporteMaestria':
                console.log('Entramos : ' + data.selectedOption);
                debugger;
                if (
                    (!data.nombreDocumento || !data.nombreDocumento.trim()) ||
                    !data.versionDoc ||
                    (!data.descripcionDocumento || !data.descripcionDocumento.trim()) ||
                    !data.base64File
                ) {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Info',
                        detail: 'Complete todos los campos del formulario.',
                    });
                } else {
                    this.nuevoOtro.nombreDocumento = data.nombreDocumento;
                    this.nuevoOtro.versionDoc = data.versionDoc;
                    this.nuevoOtro.descripcionDocumento =
                        data.descripcionDocumento;
                    this.idDocMaestria.linkDocumento =
                        this.fileName + this.base64File;
                    this.nuevoOtro.idDocMaestria = this.idDocMaestria;
                    console.log(this.nuevoOtro);
                    // Llamar al servicio para registrar el documento
                    this.documentosService
                        .createDocumentoOtro(this.nuevoOtro)
                        .subscribe({
                            next: (response) => {
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Documento registrado',
                                    detail: 'El documento ha sido registrado exitosamente.',
                                });
                                this.limpiarFormulario();
                                this.limpiarBase64();
                            },
                            error: (error) => {
                                // Manejo de errores
                                console.error(
                                    'Error al registrar el documento:',
                                    error
                                );
                            },
                        });
                }
                break;
            default:
                console.log('Opción no válida');
                break;
        }
    }

    @ViewChild('fubauto', { static: false }) fileUpload: FileUpload;

    limpiarFormulario() {
        // Restablecer los valores del formulario a su estado inicial
        this.selectedOption = null; // O el valor predeterminado
        this.numeroActa = null;
        this.fechaAprobacion = null;
        this.base64File = null;
        this.numeroOficio = null;
        this.documentoForm.reset({
            selectedOption: 'acta', //establecer el valor predeterminado
        });
    }

    limpiarBase64() {
        this.documentoForm.patchValue({
            base64File: null,
        });
        if (this.fileUpload) {
            this.fileUpload.clear(); // método clear() para resetear el componente
        }
    }

    onFileSelect(event: any) {
        const file: File = event.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                const base64Content = dataUrl.split(',')[1];
                this.base64File = base64Content;
                this.fileName = file.name.concat('-');
                this.documentoForm.patchValue({
                    base64File: this.fileName + this.base64File,
                });
            };
            reader.readAsDataURL(file);
        }
    }

    initForm(): FormGroup {
        return this.fb.group({
            selectedOption: ['acta', Validators.required],
            numeroActa: [null, Validators.required],
            fechaAprobacion: [null, Validators.required],
            base64File: [null, Validators.required],
            adjuntarActa: [null, Validators.required],
            numeroOficio: [null, Validators.required],
            asuntoOfi: [null, Validators.required],
            adjuntarOficio: [null, Validators.required],
            nombreDocumento: [null, Validators.required],
            versionDoc: [null, Validators.required],
            descripcionDocumento: [null, Validators.required],
            fileName: [null],
        });
    }

    onTipoDocumentoChange(): void {
        // Restablecer los valores del formulario cuando cambie la opción en el select
        this.documentoForm.reset({
            selectedOption: this.documentoForm.get('selectedOption').value,
        });
    }

    parseErrorMessage(error: any): string {
        console.log(error);
        if (error.status === 400 && error.error.fechaActa) {
            return error.error.fechaActa;
        } else if (error.status === 500) {
            // Si el servidor devuelve un error de estado 500 Internal Server Error
            return 'Ha ocurrido un error interno en el servidor.';
        } else if (error.status === 400 && error.error.fechaOficio) {
            return error.error.fechaOficio;
        } else {
            // Otros casos
            return 'Ha ocurrido un error al registrar el documento.';
        }
    }

    tipoDocumentos: any[] = [
        { label: 'Acta', value: 'acta' },
        { label: 'Oficio', value: 'oficio' },
        { label: 'Formato', value: 'formato' },
        { label: 'Reglamento', value: 'reglamento' },
        {
            label: 'Documento de Acreditación',
            value: 'docAcreditacion',
        },
        {
            label: 'Documento de soporte de la maestría',
            value: 'docSoporteMaestria',
        },
        { label: 'Otro', value: 'otro' },
    ];
}
