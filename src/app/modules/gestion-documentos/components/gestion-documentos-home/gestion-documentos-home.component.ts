import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DocumentosService } from '../../services/documentos.service';
import { Acta } from 'src/app/modules/gestion-asignaturas/models/acta';
import { Documento } from '../../models/documento';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { Oficio } from 'src/app/modules/gestion-asignaturas/models/oficio';
import { Otro } from 'src/app/modules/gestion-asignaturas/models/otro';
import { format } from 'date-fns';
import { FileUpload } from 'primeng/fileupload';
import { Table } from 'primeng/table';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface TipoDocumento {
    nombre: string;
    codigo: string;
}

@Component({
    selector: 'app-gestion-documentos-home',
    templateUrl: './gestion-documentos-home.component.html',
    styleUrls: ['./gestion-documentos-home.component.scss'],
})
export class GestionDocumentosHomeComponent implements OnInit {
    buscarDocumento: string;
    actas: Acta[] = [];
    oficios: Oficio[] = [];
    otros: Otro[] = [];

    selectedTipoDocumento: string;
    numeroActa: string;
    numeroOficio: string;
    fechaActa: Date;
    selectedOption: string;
    base64File: string;
    fileName: string;
    adjuntarActa: any[] = [];
    estado: boolean;

    documento: Documento;

    opcionesSelectTipoDocumento: TipoDocumento[];
    opcionSeleccionada: TipoDocumento;

    fechaInicio: Date;
    fechaFin: Date;
    maxFechaFin: Date;

    constructor(
        private readonly fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private documentosService: DocumentosService,
        private datePipe: DatePipe,
        private elementRef: ElementRef
    ) {
        this.opcionesSelectTipoDocumento = [
            { nombre: 'Acta', codigo: 'AC' },
            { nombre: 'Oficio', codigo: 'OF' },
            { nombre: 'Otro', codigo: 'OT' },
        ];
    }

    formatDate(dateISO8601: string): string {
        const date = new Date(dateISO8601);
        return format(date, 'dd/MM/yyyy');
    }
   // @ViewChild('nombreDocumentoInput') nombreDocumentoInput: ElementRef;
    ngOnInit(): void {
        this.getDocumentos();
        this.maxFechaFin = new Date();
        this.maxFechaFin.setHours(23, 59, 59, 999);
        this.loading = false;

        // if (this.nombreDocumentoInput) {
        //     fromEvent(this.nombreDocumentoInput.nativeElement, 'keyup')
        //       .pipe(
        //         debounceTime(1000),
        //         distinctUntilChanged()
        //       )
        //       .subscribe(() => {
        //         this.filtrarDocumentos();
        //       });
        //   }
    }




    // onDropdownClear() {
    //     // Esta función se ejecutará cuando se borre la selección del dropdown
    //     console.log('Selección del dropdown borrada');
    //     this.getDocumentos();
    // }

    numeroActaFiltrar: string;
    numeroOficioFiltrar: string;
    nombreDocumentoFiltrar: string;
    filtrarDocumentos() {
        if (!this.opcionSeleccionada) {
            return;
        }

        const codigo = this.opcionSeleccionada.codigo;

        if (codigo === 'AC' || codigo === 'OF') {
            if (!this.fechaInicio && this.fechaFin) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error en las fechas',
                    detail: 'La fecha de inicio no puede estar vacía.',
                });
                return;
            }

            if (
                this.fechaInicio &&
                this.fechaFin &&
                this.fechaInicio > this.fechaFin
            ) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error en las fechas',
                    detail: 'La fecha de inicio no puede ser mayor que la fecha de fin.',
                });
                return;
            }
        }

        const fechaInicioFormatted = this.fechaInicio
            ? this.formatDateForComparison(this.fechaInicio)
            : null;
        const fechaFinFormatted = this.fechaFin
            ? this.formatDateForComparison(this.fechaFin)
            : null;

        switch (codigo) {
            case 'AC':
                this.documentos = this.documentos
                    .filter((documento) => documento.tipo === 'Acta')
                    .filter((documento) => {
                        if (!this.numeroActaFiltrar) {
                            return true;
                        }
                        return documento.numeroActa === this.numeroActaFiltrar;
                    })
                    .filter((documento) => {
                        if (!fechaInicioFormatted || !fechaFinFormatted) {
                            return true;
                        }
                        const fechaDocumentoFormatted =
                            this.formatDateForComparison(
                                new Date(documento.fechaActa)
                            );
                        return (
                            fechaDocumentoFormatted >= fechaInicioFormatted &&
                            fechaDocumentoFormatted <= fechaFinFormatted
                        );
                    });
                break;
            case 'OF':
                this.documentos = this.documentos
                    .filter((documento) => documento.tipo === 'Oficio')
                    .filter((documento) => {
                        if (!this.numeroOficioFiltrar) {
                            return true;
                        }
                        return (
                            documento.numeroOficio === this.numeroOficioFiltrar
                        );
                    })
                    .filter((documento) => {
                        if (!fechaInicioFormatted || !fechaFinFormatted) {
                            return true;
                        }
                        const fechaDocumentoFormatted =
                            this.formatDateForComparison(
                                new Date(documento.fechaOficio)
                            );
                        return (
                            fechaDocumentoFormatted >= fechaInicioFormatted &&
                            fechaDocumentoFormatted <= fechaFinFormatted
                        );
                    });
                break;
            case 'OT':
                this.documentos = this.documentos
                    .filter((documento) => documento.tipo === 'Otro')
                    .filter((documento) => {
                        if (!this.nombreDocumentoFiltrar) {
                            return true;
                        }
                        const regex = new RegExp(
                            this.nombreDocumentoFiltrar,
                            'i'
                        );
                        const nombreDocumento =
                            documento.nombreDocumento.toLowerCase();
                        return regex.test(nombreDocumento);
                    });
                break;
            default:
                // Lógica para otros tipos de documentos
                break;
        }
    }

    formatDateForComparison(date: Date): Date {
        if (date) {
            const dateUtc = new Date(date);
            dateUtc.setUTCHours(0, 0, 0, 0);
            return dateUtc;
        }

        return null;
    }

    tiposDocumentos = [
        {
            prop: 'actas',
            serviceMethod: 'getDocumentosActas',
            dateField: 'fechaActa',
        },
        {
            prop: 'oficios',
            serviceMethod: 'getDocumentosOficios',
            dateField: 'fechaOficio',
        },
        {
            prop: 'otros',
            serviceMethod: 'getDocumentosOtros',
            dateField: null,
        },
    ];

    documentos: any[] = [];
    getDocumentos() {
        this.documentosService.getDocumentosCombinados().subscribe({
            next: (documentos) => {
                this.documentos = this.formatDocumentos(documentos);
                //console.log(this.documentos);
            },
            error: (error) => {
                console.error('Error al obtener documentos:', error);
            },
        });
    }

    formatDocumentos(documentos: any[]): any[] {
        return documentos.map((documento) => {
            let tipo = '';
            let nombre = '';
            if (documento.numeroActa) {
                tipo = 'Acta';
                nombre = `${documento.numeroActa} del ${this.formatDate(
                    documento.fechaActa
                )}`;
            } else if (documento.numeroOficio) {
                tipo = 'Oficio';
                nombre = `${documento.numeroOficio} del ${this.formatDate(
                    documento.fechaOficio
                )}`;
            } else if (documento.idDocMaestria) {
                tipo = 'Otro';
            }

            return {
                ...documento,
                tipo: tipo,
                nombre: nombre,
            };
        });
    }

    initForm(): FormGroup {
        return this.fb.group({
            selectedOption: ['acta', Validators.required],
            numeroActa: [null, Validators.required],
            fechaActa: [null, Validators.required],
            base64File: [[], Validators.required],
            adjuntarActa: [null, Validators.required],
            numeroOficio: [null, Validators.required],
            estado: [null, Validators.required],
        });
    }

    // Método para manejar la selección del archivo
    handleFileSelect(event: any) {
        const file = event.files[0];
        const fileReader = new FileReader();

        fileReader.onload = (e) => {
            const arrayBuffer: any = e.target.result;
            const workbook: XLSX.WorkBook = XLSX.read(arrayBuffer, {
                type: 'array',
            });

            // Acceder a las hojas del archivo y procesar los datos
            // Por ejemplo, si la hoja se llama "Sheet1":
            const sheetName = workbook.SheetNames[0];
            const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

            // Convertir los datos de la hoja a un array de objetos
            const documentsData = XLSX.utils.sheet_to_json(worksheet);

            // Filtrar documentos con los campos requeridos
            const validDocuments = documentsData.filter((document: any) => {
                return (
                    document.numeroActa &&
                    document.fechaActa &&
                    document.numeroOficio &&
                    document.asunto &&
                    document.nombreDocumento &&
                    document.version &&
                    document.descripcion
                );
            });

            // Procesar los documentos válidos
            console.log(validDocuments);
        };

        fileReader.readAsArrayBuffer(file);
    }

    // Método para subir el archivo Excel y procesar los datos
    uploadExcel() {
        // Lógica para subir el archivo y procesar los datos
        // ...

        this.messageService.add({
            severity: 'success',
            summary: 'Archivo Excel cargado',
            detail: 'El archivo Excel se ha cargado y procesado correctamente.',
        });
    }

    displayModal: boolean = false;
    selectedDocumento: any = {};
    selectedFechaActaFormatted: string;
    selectedFechaOficioFormatted: string;

    visualizarDocumento(documento: any) {
        this.selectedDocumento = documento;
        console.log(this.selectedDocumento);
        if (this.selectedDocumento.fechaActa) {
            this.selectedFechaActaFormatted = this.formatDate(
                this.selectedDocumento.fechaActa
            );
            //console.log(this.selectedFechaActaFormatted);
            //this.selectedDocumento.fechaActaFormatted = this.selectedFechaActaFormatted;
        }
        if (this.selectedDocumento.fechaOficio) {
            this.selectedFechaOficioFormatted = this.formatDate(
                this.selectedDocumento.fechaOficio
            );
        }
        this.displayModal = true;
    }

    closeModal() {
        this.displayModal = false;
        this.isEditing = false;
    }

    // Propiedad para rastrear si el modal está en modo edición
    isEditing: boolean = false;

    onFechaActaChange(event: Date): void {
        this.selectedDocumento.fechaActa = event;
    }

    onFechaOficioChange(event: Date): void {
        this.selectedDocumento.fechaOficio = event;
    }

    validarCamposDocumento(): boolean {
        const tipoDocumento = this.selectedDocumento.tipo;
        // console.log(tipoDocumento);
        switch (tipoDocumento) {
            case 'Acta':
                return (
                    this.selectedDocumento.numeroActa !== '' &&
                    this.selectedDocumento.fechaActa !== null
                );

            case 'Oficio':
                return (
                    this.selectedDocumento.numeroOficio !== '' &&
                    this.selectedDocumento.asunto?.trim() !== '' &&
                    this.selectedDocumento.fechaOficio !== null
                );

            case 'Otro':
                return (
                    this.selectedDocumento.nombreDocumento.trim() !== '' &&
                    this.selectedDocumento.descripcionDocumento.trim() !== '' &&
                    this.selectedDocumento.versionDoc !== null
                );

            default:
                return false;
        }
    }

    documentoEditadoCopiaTemp: any = {};
    // Método para guardar los cambios después de la edición
    guardarEdicion() {
        if (!this.validarCamposDocumento()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Debes proporcionar todos los campos requeridos para guardar los cambios.',
            });
            return;
        }

        if (this.selectedFechaActaFormatted) {
            this.selectedDocumento.fechaActa = new Date(
                this.selectedFechaActaFormatted
            );
            this.selectedDocumento.estado = true;
        }

        if (this.selectedFechaOficioFormatted) {
            this.selectedDocumento.fechaOficio = new Date(
                this.selectedFechaOficioFormatted
            );
            this.selectedDocumento.estado = true;
        }

        this.confirmationService.confirm({
            message: '¿Estás seguro de que deseas guardar los cambios?',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                const cambiarFile = {
                    linkDocumento: this.fileName + this.base64File,
                };
                //this.documentoEditadoCopiaTemp = { ...this.selectedDocumento };

                if (cambiarFile) {
                    // this.documentoEditadoCopiaTemp.idDocMaestria = cambiarFile;
                    this.selectedDocumento.idDocMaestria = cambiarFile;
                    // this.selectedDocumento.idDocMaestria.idDocMaestria =
                    // this.selectedDocumento.idDocMaestria.idDocMaestria;
                    this.selectedDocumento.idDocMaestria.estado = true;
                }
                console.log(this.selectedDocumento);

                this.documentosService
                    .updateDocumento(this.selectedDocumento)
                    .subscribe(
                        (updatedDocument) => {
                            console.log(
                                'Documento actualizado:',
                                updatedDocument
                            );
                            this.isEditing = false;
                            this.displayModal = false;
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail: 'El documento se ha actualizado correctamente.',
                            });
                            this.getDocumentos();
                            this.isEditing = false;
                            this.displayModal = false;
                        },
                        (error) => {
                            console.error(
                                'Error al actualizar el documento:',
                                error
                            );
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Ha ocurrido un error al actualizar el documento.',
                            });
                        }
                    );
            },
            reject: () => {
                // El usuario rechazó la confirmación, no se hace nada
                //this.documentoEditadoCopiaTemp= null;
                this.limpiarBase64();
            },
        });
    }

    editarDocumento(documento: any) {
        this.selectedDocumento = { ...documento };

        if (this.selectedDocumento.fechaActa) {
            this.selectedFechaActaFormatted = this.formatDate(
                this.selectedDocumento.fechaActa
            );
        }

        if (this.selectedDocumento.fechaOficio) {
            this.selectedFechaOficioFormatted = this.formatDate(
                this.selectedDocumento.fechaOficio
            );
            console.log(this.selectedFechaOficioFormatted);
        }

        this.isEditing = true;
        this.displayModal = true;
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
            };
            reader.readAsDataURL(file);
        }
    }

    @ViewChild('fubauto', { static: false }) fileUpload: FileUpload;
    limpiarBase64() {
        this.base64File = null;
        this.fileName = null;
        if (this.fileUpload) {
            this.fileUpload.clear(); // método clear() para resetear el componente
        }
    }

    eliminarAsignatura(documento: any) {
        // Lógica para eliminar el documento
        console.log(documento);
        this.confirmationService.confirm({
            message: '¿Estás seguro de que deseas eliminar el documento?',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                documento.idDocMaestria.estado = false;
                this.documentosService.updateDocumento(documento).subscribe(
                    (updatedDocument) => {
                        console.log('Documento actualizado:', updatedDocument);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'El documento se ha eliminado correctamente.',
                        });
                        this.getDocumentos();
                    },
                    (error) => {
                        console.error(
                            'Error al actualizar el documento:',
                            error
                        );
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Ha ocurrido un error al actualizar el documento.',
                        });
                    }
                );
            },
            reject: () => {
                // El usuario rechazó la confirmación, no se hace nada
            },
        });
    }

    @ViewChild('tablaDocumentos') tablaDocumentos: Table;
    limpiarFiltros() {
        this.numeroActaFiltrar = null;
        this.numeroOficioFiltrar = null;
        this.nombreDocumentoFiltrar = null;
        this.fechaInicio = null;
        this.fechaFin = null;
        // Reiniciar el paginador de la tabla
        this.tablaDocumentos.reset();

        this.getDocumentos(); // Llamar al método de filtrado para actualizar la lista de documentos
    }

    loading: boolean = true;
}
