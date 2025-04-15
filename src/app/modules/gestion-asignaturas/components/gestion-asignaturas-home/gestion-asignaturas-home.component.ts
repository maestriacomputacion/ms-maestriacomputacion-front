import { Component, OnInit, ViewChild } from '@angular/core';
import { Asignatura } from '../../models/asignatura';
import { AsignaturasService } from '../../services/asignaturas.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RegistrarAsignaturasComponent } from '../registrar-asignaturas/registrar-asignaturas.component';
import { ListadoAsignaturas } from '../../models/listadoAsignaturas';
import { DatePipe } from '@angular/common';
import { Oficio } from '../../models/oficio';
import { Otro } from '../../models/otro';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileUpload } from 'primeng/fileupload';

@Component({
    selector: 'gestion-asignaturas-home',
    templateUrl: './gestion-asignaturas-home.component.html',
    styleUrls: ['./gestion-asignaturas-home.component.scss'],
})
export class GestionAsignaturasHomeComponent implements OnInit {
    documentoForm!: FormGroup;
    asignaturas: ListadoAsignaturas[] = [];
    loading: boolean = false;
    dialogRef: DynamicDialogRef; // Variable para guardar la referencia al diálogo

    asignaturaSeleccionada: Asignatura; // Propiedad para almacenar la asignatura seleccionada
    displayModal: boolean = false; // Propiedad para mostrar u ocultar el modal

    buscarAsignatura: string;

    //SECCION OFICIO
    nuevoOficio: Oficio = {};
    numeroOficio: string;

    asuntoOfi: string;
    adjuntarOficio: any[] = [];
    fechaAprobacionOficio: Date;
    base64FileOficio: string;
    fileNameOficio: string;

    //SECCION OTROS
    nuevoOtro: Otro = {};
    versionDoc: number;
    nombreDocumento: string;
    descripcionDocumento: string;

    constructor(
        private readonly fb: FormBuilder,
        private asignaturaService: AsignaturasService,
        private dialogService: DialogService,
        private datePipe: DatePipe
    ) {}

    ngOnInit(): void {
        this.documentoForm = this.initForm();
        this.asignaturaService.getListaAsignaturas().subscribe({
            next: (response) => {
                this.asignaturas = response.map((asignatura) => ({
                    ...asignatura,
                    fechaAprobacion: this.formatDate(
                        asignatura.fechaAprobacion
                    ),
                    estadoAsignatura: asignatura.estadoAsignatura
                        ? 'Activa'
                        : 'Inactiva',
                }));
                console.log('Asignaturas recuperadas:', this.asignaturas);
                this.filtrarAsignaturas();
            },
            error: (error) => console.log(error),
            complete: () => (this.loading = true),
        });
    }

    private formatDate(date: string): string {
        const parsedDate = new Date(date);
        return this.datePipe.transform(parsedDate, 'dd/MM/yyyy');
    }

    // Agregar una propiedad para almacenar los detalles de la asignatura seleccionada
    detalleAsignatura: any;

    // Método para abrir el modal y cargar los detalles de la asignatura
    visualizarAsignatura(asignatura: Asignatura) {
        // Llamar al servicio para obtener los detalles de la asignatura por su ID
        this.asignaturaService
            .getDetalleAsignatura(asignatura.idAsignatura)
            .subscribe((detalle) => {
                this.detalleAsignatura = detalle;
                console.log(this.detalleAsignatura);
                // Abrir el modal aquí
                this.displayModal = true;
            });
    }

    editarAsignaturaDialog: boolean;
    submitted: boolean;
    editAsignatura(id: any) {


        //this.asignaturaSeleccionada = ;
        // console.log(this.asignaturaSeleccionada);
        // Guardar la asignatura seleccionada en el servicio

        this.asignaturaService.getDetalleAsignatura(id).subscribe(
            (detalleAsignatura) => {
                // Guarda los detalles de la asignatura en una propiedad local
                this.asignaturaSeleccionada = detalleAsignatura;
                //this.asignaturaSeleccionada.docentesSeleccionados=detalleAsignatura.docentesAsignaturas;
                this.asignaturaService.setAsignaturaData(this.asignaturaSeleccionada);
                console.log(this.asignaturaSeleccionada);
                // Configura las opciones del modal
                const modalOptions = {
                    header: 'Editar Asignatura',
                    width: '70%',
                    contentStyle: { 'max-height': '500px', overflow: 'auto' },
                    data: { asignatura: this.asignaturaSeleccionada },
                };

                // Abre el modal
                this.dialogRef = this.dialogService.open(
                    RegistrarAsignaturasComponent,
                    modalOptions
                );

                // Suscríbete al observable afterClosed para realizar una acción cuando se cierre el diálogo
                this.dialogRef.onClose.subscribe((result) => {
                    if (result === 'saved') {
                        console.log(
                            'El diálogo fue cerrado y se guardaron los cambios.'
                        );
                        this.asignaturaService.clearAsignaturaData();
                    } else if (result === 'canceled') {
                        console.log(
                            'El diálogo fue cerrado y se canceló la acción.'
                        );
                        this.asignaturaService.clearAsignaturaData();
                    } else {
                        console.log(
                            'El diálogo fue cerrado sin realizar ninguna acción.'
                        );
                        this.asignaturaService.clearAsignaturaData();
                    }
                });
            },
            (error) => {
                console.error(
                    'Error al obtener los detalles de la asignatura',
                    error
                );
            }
        );
    }

    asignaturasFiltradas: ListadoAsignaturas[];

    filtrarAsignaturas() {
        //console.log(this.asignaturasFiltradas);

        // Crear una expresión regular para buscar el texto en cualquier parte de la cadena
        const regex = new RegExp(this.buscarAsignatura, 'i');

        // Filtrar asignaturas por oficioFacultad o nombre que coincidan con la expresión regular
        this.asignaturasFiltradas = this.asignaturas.filter(
            (asignatura) =>
                regex.test(asignatura.codigoAsignatura.toString()) ||
                regex.test(asignatura.nombreAsignatura.toLowerCase())
        );

        // console.log(this.asignaturasFiltradas);
        this.buscarAsignatura = '';
    }

    initForm(): FormGroup {
        return this.fb.group({
            numeroOficio: [null, Validators.required],
            asuntoOfi: [null, Validators.required],
            adjuntarOficio: [null, Validators.required],
            fechaAprobacionOficio: [null, Validators.required],
            base64FileOficio: [null, Validators.required],
            fileNameOficio: [null],

            nombreDocumentoContenidoProgramatico: [null, Validators.required],
            versionDocContenidoProgramatico: [null, Validators.required],
            descripcionDocumentoContenidoProgramatico: [
                null,
                Validators.required,
            ],
            adjuntarContenidoProgramatico: [null, Validators.required],
            fechaAprobacionContenidoProgramatico: [null, Validators.required],
            base64FileContenidoProgramatico: [null, Validators.required],
            fileNameContenidoProgramatico: [null],

            nombreDocumentoMicrocurriculo: [null, Validators.required],
            versionDocMicrocurriculo: [null, Validators.required],
            descripcionDocumentoMicrocurriculo: [null, Validators.required],
            adjuntarMicrocurriculo: [null, Validators.required],
            fechaAprobacionMicrocurriculo: [null, Validators.required],
            base64FileMicrocurriculo: [null, Validators.required],
            fileNameMicrocurriculo: [null],
        });
    }
    @ViewChild('fubauto', { static: false }) fileUpload: FileUpload;
    limpiarBase64Oficio() {
        this.documentoForm.patchValue({
            base64FileOficio: null,
        });
        if (this.fileUpload) {
            this.fileUpload.clear(); // método clear() para resetear el componente
        }
    }
}
