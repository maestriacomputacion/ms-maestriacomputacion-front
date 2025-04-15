import { Component, OnInit, ViewChild } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
    FormControl,
} from '@angular/forms';
import { Asignatura } from '../../models/asignatura';
import { Router } from '@angular/router';
import { Acta } from '../../models/acta';
import { AsignaturasService } from '../../services/asignaturas.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Docente } from '../../models/docente';
import { Documento } from 'src/app/modules/gestion-documentos/models/documento';
import { MenuItem } from 'primeng/api';
import { DocumentosService } from 'src/app/modules/gestion-documentos/services/documentos.service';
import { FileUpload } from 'primeng/fileupload';
import { AreaFormacion } from '../../models/areaFormacion';
import { LineaInvestigacion } from '../../models/lineaInvestigacion';
import { DocMaestria } from '../../models/docMaestria';
import { Oficio } from '../../models/oficio';
import { ContenidoProgramatico } from '../../models/contenidoProgramatico';
import { Microcurriculo } from '../../models/microcurriculo';

@Component({
    selector: 'app-registrar-asignaturas',
    templateUrl: './registrar-asignaturas.component.html',
    styleUrls: ['./registrar-asignaturas.component.scss'],
})
export class RegistrarAsignaturasComponent implements OnInit {
    asignaturaForm!: FormGroup;
    asignatura: Asignatura;
    asignaturas: Asignatura[];
    estado: string;
    fechaAprobacion: Date;
    areasDeFormacion: AreaFormacion[];
    areaFormacion: AreaFormacion;
    lineasInvestigacion: LineaInvestigacion[];
    lineaInvestigacionAsignatura: LineaInvestigacion;
    codigoAsignatura: string;
    tipo: string;
    horasPresenciales: number = 5;
    opcionesNumericas: number = 3;
    base64File: string;

    //Seccion para el modal de actas
    actaDialog: boolean;
    actas: Acta[];
    acta: Acta;
    actasSeleccionadas: Acta[] = [];
    submitted: boolean;

    //Seccion para Docentes
    docentes: Docente[];
    docentesSeleccionados: Docente[] = [];

    //Seccion para el modal del oficio
    oficio: Documento;
    oficioDialog: boolean;

    //Seccion para el modal del microcurriculo
    microcurriculoDialog: boolean;

    //Seccion para el modal del contenido Programatico
    contenidoProgramaticoDialog: boolean;

    //Variable para recibir la asignatura a editar
    asignaturaEdit: Asignatura;

    // Propiedad para determinar si la asignatura está en modo edición o registro
    isEditMode: boolean = false;

    items: MenuItem[];
    home: MenuItem;

    asuntoOfi: string;
    adjuntarOficio: any[] = [];
    fechaAprobacionOficio: Date;
    base64FileOficio: string;
    fileNameOficio: string;

    versionDocContenidoProgramatico: number;
    nombreDocumentoContenidoProgrmatico: string;
    descripcionDocumentoContenidoProgramatico: string;
    base64FileContenidoProgramatico: string;
    fileNameContenidoProgramatico: string;

    versionDoc: number;
    nombreDocumentoMicrocurriculo: string;
    descripcionDocumentoMicrocurriculo: string;
    base64FileMicrocurriculo: string;
    fileNameMicrocurriculo: string;

    showDocumentInfo: boolean;
    showContenidoProgramaticoInfo: boolean;
    showMicrocurriculoInfo: boolean;
    oficioRecuperado: Oficio;
    nombreContenidoProgramaticoRecuperado: string;
    nombreMicrocurriculoRecuperado: string;

    contenidoProgramaticoRecuperado: ContenidoProgramatico;
    microcurriculoRecuperado: Microcurriculo = {};

    @ViewChild('fubauto', { static: false }) fileUpload: FileUpload;

    // Método para cambiar el modo entre edición y registro
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
    }

    constructor(
        private readonly fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private asignaturaService: AsignaturasService, //private config: DynamicDialogConfig
        private documentosService: DocumentosService,
        private router: Router
    ) {
        this.areasDeFormacion = [
            { nombre: 'Fundamentación', descripcion: 'NY' },
            { nombre: 'Electiva', descripcion: 'RM' },
            { nombre: 'Investigación', descripcion: 'LDN' },
            { nombre: 'Complementación', descripcion: 'IST' },
        ];

        this.lineasInvestigacion = [
            { nombre: 'Sistemas Inteligentes', descripcion: 'NY' },
            {
                nombre: 'Gestión de Información y Tecnologías de la información',
                descripcion: 'RM',
            },
            { nombre: 'Ingeniería de Software', descripcion: 'LDN' },
        ];
    }
    docentesRecuperados: any[] = [];
    actasRecuperadas: any[] = [];

    docMaesctriaMicro: DocMaestria = {};
    ngOnInit(): void {
        this.asignaturaForm = this.initForm();


        this.asignaturaService.getListaDocentes().subscribe({
            next: (response) => {
                this.docentes = response;
                //console.log(this.docentes);
            },
            error: (error) => {
                console.error('Error al obtener la lista de docentes:', error);
            },
        });

        this.documentosService.getDocumentosActas().subscribe({
            next: (response) => {
                this.actas = response;
                //console.log(this.actas);
            },
            error: (error) => {
                console.error('Error al obtener la lista de actas:', error);
            },
        });

        // Subscribirse a los cambios de los campos horasPresenciales y horasNoPresenciales
        this.asignaturaForm
            .get('horasPresenciales')
            .valueChanges.subscribe((horasPresenciales: number) => {
                this.actualizarHorasTotales();
            });

        this.asignaturaForm
            .get('horasNoPresenciales')
            .valueChanges.subscribe((horasNoPresenciales: number) => {
                this.actualizarHorasTotales();
            });

        // Obtener la asignatura enviada desde el componente que abre el modal
        this.asignaturaEdit = this.asignaturaService.getAsignaturaData();
        if (this.asignaturaEdit) {
            console.log('ACA ESTA: ', this.asignaturaEdit);
            const fechaAprobacion = new Date(
                this.asignaturaEdit.fechaAprobacion
            );
            if (typeof this.asignaturaEdit.oficioFacultad !== 'number') {
                //console.log(this.asignaturaEdit.oficioFacultad)
                this.oficioRecuperado = {
                    idOficio: this.asignaturaEdit.oficioFacultad.idOficio,
                    numeroOficio:
                        this.asignaturaEdit.oficioFacultad.numeroOficio,
                    fechaOficio: this.asignaturaEdit.oficioFacultad.fechaOficio,
                    asuntoOfi: this.asignaturaEdit.oficioFacultad.asuntoOfi,
                    // idDocMaestria: this.oficioRecuperado.idDocMaestria,
                };
                // this.asignaturaEdit.oficioFacultad.idDocMaestria.linkDocumento;

                this.asignaturaForm
                    .get('numeroOficio')
                    .setValue(this.asignaturaEdit.oficioFacultad.numeroOficio);
                this.asignaturaForm
                    .get('asuntoOfi')
                    .setValue(this.asignaturaEdit.oficioFacultad.asuntoOfi);
                this.asignaturaForm
                    .get('fechaAprobacionOficio')
                    .setValue(this.asignaturaEdit.oficioFacultad.fechaOficio);
                this.asignaturaForm
                    .get('base64FileOficio')
                    .setValue(
                        this.asignaturaEdit.oficioFacultad.idDocMaestria
                            .linkDocumento
                    );
            }
            console.log(this.oficioRecuperado);
            if (typeof this.asignaturaEdit.contenidoProgramatico !== 'number') {
                this.nombreContenidoProgramaticoRecuperado =
                    this.asignaturaEdit.contenidoProgramatico.nombreDocumento;
                this.contenidoProgramaticoRecuperado = {
                    idOtroDoc:
                        this.asignaturaEdit.contenidoProgramatico.idOtroDoc,
                    nombreDocumento:
                        this.asignaturaEdit.contenidoProgramatico
                            .nombreDocumento,
                    descripcionDocumento:
                        this.asignaturaEdit.contenidoProgramatico
                            .descripcionDocumento,
                    versionDoc:
                        this.asignaturaEdit.contenidoProgramatico.versionDoc,
                    // idDocMaestria: this.oficioRecuperado.idDocMaestria,
                };
                // this.asignaturaEdit.oficioFacultad.idDocMaestria.linkDocumento;

                this.asignaturaForm
                    .get('nombreDocumentoContenidoProgrmatico')
                    .setValue(
                        this.asignaturaEdit.contenidoProgramatico
                            .nombreDocumento
                    );
                this.asignaturaForm
                    .get('descripcionDocumentoContenidoProgramatico')
                    .setValue(
                        this.asignaturaEdit.contenidoProgramatico
                            .descripcionDocumento
                    );
                this.asignaturaForm
                    .get('versionDocContenidoProgramatico')
                    .setValue(
                        this.asignaturaEdit.contenidoProgramatico.versionDoc
                    );
                this.asignaturaForm
                    .get('base64FileContenidoProgramatico')
                    .setValue(
                        this.asignaturaEdit.contenidoProgramatico.idDocMaestria
                            .linkDocumento
                    );
            }

            if (typeof this.asignaturaEdit.microcurriculo !== 'number') {
                this.docMaesctriaMicro = {
                    id: this.asignaturaEdit.microcurriculo.idDocMaestria.id,
                    linkDocumento:
                        this.asignaturaEdit.microcurriculo.idDocMaestria
                            .linkDocumento,
                    estado: this.asignaturaEdit.microcurriculo.idDocMaestria
                        .estado,
                };
                this.nombreMicrocurriculoRecuperado =
                    this.docMaesctriaMicro.linkDocumento;
                this.microcurriculoRecuperado = {
                    idOtroDoc: this.asignaturaEdit.microcurriculo.idOtroDoc,
                    nombreDocumento:
                        this.asignaturaEdit.microcurriculo.nombreDocumento,
                    descripcionDocumento:
                        this.asignaturaEdit.microcurriculo.descripcionDocumento,
                    versionDoc: this.asignaturaEdit.microcurriculo.versionDoc,
                    // idDocMaestria: this.oficioRecuperado.idDocMaestria,
                };

                this.asignaturaForm
                    .get('nombreDocumentoMicrocurriculo')
                    .setValue(this.microcurriculoRecuperado.nombreDocumento);

                this.asignaturaForm
                    .get('versionDoc')
                    .setValue(this.microcurriculoRecuperado.versionDoc);

                this.asignaturaForm
                    .get('descripcionDocumentoMicrocurriculo')
                    .setValue(
                        this.microcurriculoRecuperado.descripcionDocumento
                    );

                this.asignaturaForm
                    .get('base64FileMicrocurriculo')
                    .setValue(this.docMaesctriaMicro.linkDocumento);

                //         versionDoc: [null, Validators.required],
                // nombreDocumentoMicrocurriculo: [null, Validators.required],
                // descripcionDocumentoMicrocurriculo: [null, Validators.required],
                // base64FileMicrocurriculo: [null, Validators.required],
            }

            //console.log(this.asignaturaEdit.areaFormacion);
            var areaFormacionRecuperada: AreaFormacion;
            var lineaInvestigacionRecuperada: LineaInvestigacion;
            if (typeof this.asignaturaEdit.areaFormacion !== 'string') {
                if (this.asignaturaEdit.areaFormacion) {
                    areaFormacionRecuperada = {
                        nombre: 'Electiva',
                        // descripcion:this.asignaturaEdit.areaFormacion.descripcion}
                        descripcion: 'RM',
                    };
                }
                if (areaFormacionRecuperada.nombre === 'Electiva') {
                    if (
                        typeof this.asignaturaEdit
                            .lineaInvestigacionAsignatura !== 'number'
                    ) {
                        lineaInvestigacionRecuperada = {
                            nombre: 'Sistemas Inteligentes',
                            descripcion: 'NY',
                            // descripcion:this.asignaturaEdit.areaFormacion.descripcion}
                        };
                    }
                }
            }
            this.areaFormacion = areaFormacionRecuperada;
            this.lineaInvestigacionAsignatura = lineaInvestigacionRecuperada;
            this.asignaturaForm.patchValue({
                idAsignatura: this.asignaturaEdit.idAsignatura,
                codigoAsignatura: this.asignaturaEdit.codigoAsignatura,
                nombreAsignatura: this.asignaturaEdit.nombreAsignatura,
                estadoAsignatura: this.asignaturaEdit.estadoAsignatura
                    ? 'activo'
                    : 'inactivo',
                fechaAprobacion: fechaAprobacion,
                oficioFacultad: this.oficioRecuperado,
                areaFormacion: areaFormacionRecuperada,
                tipo: this.asignaturaEdit.tipoAsignatura,
                lineaInvestigacionAsignatura: this.lineaInvestigacionAsignatura,
                creditos: this.asignaturaEdit.creditos,
                objetivo: this.asignaturaEdit.objetivoAsignatura,
                contenido: this.asignaturaEdit.contenidoAsignatura,
                contenidoProgramatico:
                    this.asignaturaEdit.contenidoProgramatico,

                horasPresenciales: this.asignaturaEdit.horasPresencial,
                horasNoPresenciales: this.asignaturaEdit.horasNoPresencial,
                horasTotal: this.asignaturaEdit.horasTotal,
            });

            if (
                this.asignaturaEdit.actasAsignaturas &&
                this.asignaturaEdit.actasAsignaturas.length > 0
            ) {
                this.actasRecuperadas = this.asignaturaEdit.actasAsignaturas;
                // Itera sobre las actas en asignaturaEdit.actasAsignaturas
                this.actasRecuperadas.forEach((item) => {
                    console.log(item);
                    const idDocMaestriaRecuperado: DocMaestria = {
                        id: item.acta.idDocMaestria.idDocMaestria,
                        linkDocumento: item.acta.idDocMaestria.linkDocumento,
                        estado: item.acta.idDocMaestria.estado,
                    };

                    console.log(idDocMaestriaRecuperado);
                    // Crea un objeto Acta a partir de los datos

                    const actaRecuperada: Acta = {
                        id: item.id,
                        numeroActa: item.acta.numeroActa,
                        fechaActa: item.acta.fechaActa,
                        idDocMaestria: idDocMaestriaRecuperado,
                    };

                    //console.log(actaRecuperada);

                    this.seleccionActa(actaRecuperada);
                });
            }

            if (
                this.asignaturaEdit.docentesAsignaturas &&
                this.asignaturaEdit.docentesAsignaturas.length > 0
            ) {
                this.docentesRecuperados =
                    this.asignaturaEdit.docentesAsignaturas;

                // Itera sobre los docentes en asignaturaEdit.docentesAsignaturas
                this.docentesRecuperados.forEach((item) => {
                    // Crea un objeto Docente a partir de los datos

                    const docenteRecuperado: Docente = {
                        id: item.docente.id,
                        identificacion:
                            item.docente.persona.identificacion.toString(),
                        nombre: item.docente.persona.nombre,
                        apellido: item.docente.persona.apellido,
                        correoElectronico:
                            item.docente.persona.correoElectronico,
                        estado: 'ACTIVO',
                    };

                    //console.log(docenteRecuperado);

                    this.seleccionDocente(docenteRecuperado);
                });
            }

            this.isEditMode = true;
        }

        this.items = [
            {
                label: 'Gestión Asignaturas',
                routerLink: ['/gestion-asignaturas'],
            },
            { label: 'Registrar Asignatura' },
        ];

        this.home = { icon: 'pi pi-home', routerLink: ['/'] };
    }

    initForm(): FormGroup {
        //Declaramos las propiedades que tendra el formulario
        return this.fb.group({
            codigoAsignatura: ['', [Validators.required]],
            nombreAsignatura: ['', [Validators.required]],
            estadoAsignatura: ['', [Validators.required]],
            fechaAprobacion: ['', [Validators.required]],
            areaFormacion: ['', [Validators.required]],
            tipo: ['', [Validators.required]],
            lineaInvestigacionAsignatura: [''],
            creditos: ['', [Validators.required]],
            objetivo: ['', [Validators.required]],
            contenido: ['', [Validators.required]],
            horasPresenciales: [0, [Validators.required]],
            horasNoPresenciales: [0, [Validators.required]],
            horasTotal: ['', [Validators.required]],
            listaDocentes: [[]],
            listaActas: [[]],

            numeroOficio: [null, Validators.required],
            asuntoOfi: [null, Validators.required],

            fechaAprobacionOficio: [null, Validators.required],
            base64FileOficio: [null, Validators.required],

            versionDocContenidoProgramatico: [null, Validators.required],
            nombreDocumentoContenidoProgrmatico: [null, Validators.required],
            descripcionDocumentoContenidoProgramatico: [
                null,
                Validators.required,
            ],
            base64FileContenidoProgramatico: [null, Validators.required],

            versionDoc: [null, Validators.required],
            nombreDocumentoMicrocurriculo: [null, Validators.required],
            descripcionDocumentoMicrocurriculo: [null, Validators.required],
            base64FileMicrocurriculo: [null, Validators.required],
            docentesSeleccionados: [[]],
        });
    }

    resetLineasInvestigacion() {
        // Resetea el valor seleccionado en el select de "Linea de Investigación" y deshabilita el select
        this.asignaturaForm.get('lineaInvestigacionAsignatura').disable();
    }

    isLineasInvestigacionEnabled() {
        // Habilita o deshabilita el select de "Linea de Investigación" según el valor seleccionado en el select de "Area de Formación"
        const areaFormacionValue =
            this.asignaturaForm.get('areaFormacion').value;

        if (areaFormacionValue != null) {
            const nombre = areaFormacionValue.nombre;
            if (nombre !== 'Electiva') {
                this.asignaturaForm.get('lineaInvestigacionAsignatura').reset();
            }

            return nombre === 'Electiva';
        } else {
            return false;
        }
    }

    guardarAsignatura(): void {
        this.submitted = true;
        if (this.asignaturaForm.valid) {
            const data = this.asignaturaForm.value;
            //console.log(data);
            const asignatura: any = {
                codigoAsignatura: data.codigoAsignatura,
                nombreAsignatura: data.nombreAsignatura,
                estadoAsignatura:
                    data.estadoAsignatura == 'activo' ? true : false,
                fechaAprobacion: data.fechaAprobacion,
                oficioFacultad: {
                    idDocMaestria: {
                        linkDocumento: data.base64FileOficio,
                    },
                    numeroOficio: data.numeroOficio,
                    fechaOficio: data.fechaAprobacionOficio,
                    asuntoOfi: data.asuntoOfi,
                },
                areaFormacion: data.areaFormacion,
                lineaInvestigacionAsignatura: data.lineaInvestigacionAsignatura,
                tipoAsignatura: data.tipo,
                creditos: data.creditos,
                objetivoAsignatura: data.objetivo,
                contenidoAsignatura: data.contenido,
                contenidoProgramatico: {
                    idDocMaestria: {
                        linkDocumento: data.base64FileContenidoProgramatico,
                    },
                    versionDoc: data.versionDocContenidoProgramatico,
                    nombreDocumento: data.nombreDocumentoContenidoProgrmatico,
                    descripcionDocumento:
                        data.descripcionDocumentoContenidoProgramatico,
                },
                microcurriculo: {
                    idDocMaestria: {
                        linkDocumento: data.base64FileMicrocurriculo,
                    },
                    versionDoc: data.versionDoc,
                    nombreDocumento: data.nombreDocumentoMicrocurriculo,
                    descripcionDocumento:
                        data.descripcionDocumentoMicrocurriculo,
                },
                horasPresencial: data.horasPresenciales,
                horasNoPresencial: data.horasNoPresenciales,
                horasTotal: data.horasTotal,
                listaDocentes: this.isEditMode
                    ? null
                    : this.docentesSeleccionados,
                listaActas: this.isEditMode ? null : this.actasSeleccionadas,
            };
            //console.log(asignatura);
            if (this.isEditMode) {
                asignatura['docentesAsignaturas'] =
                    this.asignaturaEdit.docentesAsignaturas;
                asignatura['actasAsignaturas'] =
                    this.asignaturaEdit.actasAsignaturas;
                asignatura['idAsignatura'] = this.asignaturaEdit.idAsignatura;
                this.asignaturaService.editarAsignatura(asignatura).subscribe({
                    next: (response) => {
                        //console.log('Asignatura registrada:', response);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Asignatura editada',
                            detail: 'La asignatura se ha editado correctamente.',
                        });
                        this.router.navigateByUrl('/gestion-asignaturas');
                    },
                    error: (error) => {
                        console.error(
                            'Error al editar la asignatura:',
                            error
                        );
                    },
                });
            } else {
                this.asignaturaService
                    .registrarAsignatura(asignatura)
                    .subscribe({
                        next: (response) => {
                            //console.log('Asignatura registrada:', response);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Asignatura registrada',
                                detail: 'La asignatura se ha registrado correctamente.',
                            });
                            this.router.navigateByUrl('/gestion-asignaturas');
                        },
                        error: (error) => {
                            console.error(
                                'Error al registrar la asignatura:',
                                error
                            );
                        },
                    });
            }
        } else {
            // Obtener los campos faltantes del formulario
            const camposFaltantes = [];
            const formControls = this.asignaturaForm.controls;

            for (const controlName in formControls) {
                if (formControls.hasOwnProperty(controlName)) {
                    if (formControls[controlName].invalid) {
                        camposFaltantes.push(controlName);
                    }
                }
            }

            // Mostrar mensaje de campos faltantes como lista
            if (camposFaltantes.length > 0) {
                const camposFaltantesLista = camposFaltantes
                    .map((controlName) => '- ' + controlName)
                    .join('\n');

                const mensaje = `Por favor, complete los siguientes campos requeridos:\n${camposFaltantesLista}`;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensaje,
                });
            }
        }
    }

    guardarOficio() {
        const camposFaltantes = [];

        if (
            this.asignaturaForm.controls.numeroOficio.invalid ||
            this.asignaturaForm.controls.numeroOficio.value === 0
        ) {
            camposFaltantes.push('Número de Oficio');
        }
        if (this.asignaturaForm.controls.asuntoOfi.invalid) {
            camposFaltantes.push('Asunto');
        }
        if (this.asignaturaForm.controls.fechaAprobacionOficio.invalid) {
            camposFaltantes.push('Fecha de Aprobación');
        }
        if (this.asignaturaForm.controls.base64FileOficio.invalid) {
            camposFaltantes.push('Archivo Adjunto');
        }

        if (camposFaltantes.length > 0) {
            const mensaje =
                'Por favor complete los siguientes campos del oficio:\n' +
                camposFaltantes.join(', ');

            this.messageService.add({
                severity: 'error',
                summary: 'Campos incompletos',
                detail: mensaje,
            });
        } else {
            this.messageService.add({
                severity: 'success',
                summary: 'Oficio guardado',
                detail: 'El oficio se ha guardado correctamente.',
            });
            this.oficioDialog = false;
        }
    }

    guardarContenidoProgramatico() {
        const camposFaltantes = [];

        if (
            this.asignaturaForm.controls.nombreDocumentoContenidoProgrmatico
                .invalid
        ) {
            camposFaltantes.push('Nombre del documento');
        }
        if (
            this.asignaturaForm.controls.versionDocContenidoProgramatico.invalid
        ) {
            camposFaltantes.push('Versión');
        }
        if (
            this.asignaturaForm.controls
                .descripcionDocumentoContenidoProgramatico.invalid
        ) {
            camposFaltantes.push('Descripción');
        }
        if (
            this.asignaturaForm.controls.base64FileContenidoProgramatico.invalid
        ) {
            camposFaltantes.push('Archivo Adjunto');
        }

        if (camposFaltantes.length > 0) {
            const mensaje =
                'Por favor complete los siguientes campos del contenido programático:\n' +
                camposFaltantes.join(', ');

            this.messageService.add({
                severity: 'error',
                summary: 'Campos incompletos',
                detail: mensaje,
            });
        } else {
            this.messageService.add({
                severity: 'success',
                summary: 'Contenido programático  guardado',
                detail: 'El contenido programático se ha guardado correctamente.',
            });
            this.contenidoProgramaticoDialog = false;
        }
    }

    guardarMicrocurriculo() {
        const camposFaltantes = [];

        if (
            this.asignaturaForm.controls.nombreDocumentoMicrocurriculo.invalid
        ) {
            camposFaltantes.push('Nombre del documento');
        }
        if (this.asignaturaForm.controls.versionDoc.invalid) {
            camposFaltantes.push('Versión');
        }
        if (
            this.asignaturaForm.controls.descripcionDocumentoMicrocurriculo
                .invalid
        ) {
            camposFaltantes.push('Descripción');
        }
        if (this.asignaturaForm.controls.base64FileMicrocurriculo.invalid) {
            camposFaltantes.push('Archivo Adjunto');
        }

        if (camposFaltantes.length > 0) {
            const mensaje =
                'Por favor complete los siguientes campos del microcurrículo:\n' +
                camposFaltantes.join(', ');

            this.messageService.add({
                severity: 'error',
                summary: 'Campos incompletos',
                detail: mensaje,
            });
        } else {
            this.messageService.add({
                severity: 'success',
                summary: 'Microcurrículo guardado',
                detail: 'El microcurrículo se ha guardado correctamente.',
            });
            this.microcurriculoDialog = false;
        }
    }

    // Método para calcular y actualizar las horas totales
    private actualizarHorasTotales() {
        const horasPresenciales =
            this.asignaturaForm.get('horasPresenciales').value;
        const horasNoPresenciales = this.asignaturaForm.get(
            'horasNoPresenciales'
        ).value;
        const horasTotal = horasPresenciales + horasNoPresenciales;
        this.asignaturaForm.get('horasTotal').patchValue(horasTotal);
    }

    uploadedFiles: any[] = [];

    onUploadOficio(event) {
        for (let file of event.files) {
            this.uploadedFiles.push(file);
        }
        //console.log(this.uploadedFiles);
        this.messageService.add({
            severity: 'info',
            summary: 'File Uploaded',
            detail: '',
        });
    }

    //ACTA
    openNewActa() {
        this.acta = {};
        this.submitted = false;
        this.actaDialog = true;
    }

    openNewOficio() {
        this.oficioDialog = true;
        // Restablecer el estado de touched/untouched y pristine/dirty de los campos del formulario
        this.asignaturaForm.get('numeroOficio').markAsUntouched();
        this.asignaturaForm.get('numeroOficio').markAsPristine();

        this.asignaturaForm.get('asuntoOfi').markAsUntouched();
        this.asignaturaForm.get('asuntoOfi').markAsPristine();

        this.asignaturaForm.get('fechaAprobacionOficio').markAsUntouched();
        this.asignaturaForm.get('fechaAprobacionOficio').markAsPristine();

        this.asignaturaForm.get('base64FileOficio').markAsUntouched();
        this.asignaturaForm.get('base64FileOficio').markAsPristine();
    }

    openNewContenidoProgramatico() {
        this.contenidoProgramaticoDialog = true;
    }
    openNewMicrocurriculo() {
        this.microcurriculoDialog = true;
    }

    deleteActa(actaIndex: number) {
        if (actaIndex >= 0 && actaIndex < this.actasSeleccionadas.length) {
            const actaAEliminar: Acta = this.actasSeleccionadas[actaIndex];

            // Eliminamos el acta del array docentesSeleccionados
            this.actasSeleccionadas.splice(actaIndex, 1);

            // Actualizamos el valor del formulario
            this.asignaturaForm
                .get('listaActas')
                .patchValue(this.actasSeleccionadas);

            this.messageService.add({
                severity: 'warn',
                summary: 'Aviso',
                detail: 'Se ha desasignado el acta',
            });
        } else {
            console.error('Índice de acta inválida');
        }
    }
    listaDocentes: Docente[] = [];
    seleccionDocente(docente: Docente) {
        // console.log(docente);
        const elementoExistente = this.docentesSeleccionados.find(
            (elemento) => elemento.identificacion === docente.identificacion
        );
        if (elementoExistente) {
            this.messageService.add({
                key: 'bc',
                severity: 'info',
                summary: 'Info',
                detail: 'El docente ya se encuentra seleccionado',
            });
        } else {
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Docente asignado con exito',
            });
            this.docentesSeleccionados.push(docente);
        }

        this.listaDocentes = this.docentesSeleccionados;
        this.asignaturaForm.get('listaDocentes').patchValue(this.listaDocentes);
        //console.log(this.listaDocentes);
    }

    listaActas: Acta[] = [];
    seleccionActa(acta: Acta) {
        const elementoExistente = this.actasSeleccionadas.find(
            (elemento) => elemento.numeroActa === acta.numeroActa
        );
        if (elementoExistente) {
            this.messageService.add({
                key: 'bc',
                severity: 'info',
                summary: 'Info',
                detail: 'El acta ya se encuentra seleccionada',
            });
        } else {
            this.messageService.add({
                severity: 'success',
                summary: 'Proceso Exitoso',
                detail: 'Docente asignado con exito',
            });
            this.actasSeleccionadas.push(acta);
        }

        // Creas un nuevo array con solo el atributo identificacion
        this.listaActas = this.actasSeleccionadas;
        this.asignaturaForm.get('listaActas').patchValue(this.listaActas);
        //console.log(this.listaActas);
    }

    deleteDocente(docenteIndex: number) {
        if (
            docenteIndex >= 0 &&
            docenteIndex < this.docentesSeleccionados.length
        ) {
            // Eliminamos el docente del array docentesSeleccionados
            this.docentesSeleccionados.splice(docenteIndex, 1);

            // Actualizamos el valor del formulario
            this.asignaturaForm
                .get('listaDocentes')
                .patchValue(this.docentesSeleccionados);

            this.messageService.add({
                severity: 'warn',
                summary: 'Aviso',
                detail: 'Se ha desasignado el docente',
            });
        } else {
            console.error('Índice de docente inválido');
        }
    }

    hideDialog() {
        this.actaDialog = false;
        this.submitted = false;
        this.oficioDialog = false;
    }

    // saveOficio() {
    //     this.submitted = true;

    //     // if (this.acta.numeroActa.trim()) {
    //     //     if (this.acta.id) {
    //     //         this.acta[this.findIndexById(this.acta.id)] =
    //     //             this.acta;
    //     //         this.messageService.add({
    //     //             severity: 'success',
    //     //             summary: 'Successful',
    //     //             detail: 'Product Updated',
    //     //             life: 3000,
    //     //         });
    //     //     } else {
    //     //         this.acta.id = this.createId();
    //     //         this.actas.push(this.acta);
    //     //         this.messageService.add({
    //     //             severity: 'success',
    //     //             summary: 'Successful',
    //     //             detail: 'Product Created',
    //     //             life: 3000,
    //     //         });
    //     //     }

    //     this.actas = [...this.actas];
    //     this.actaDialog = false;
    //     this.acta = {};
    //     // }
    // }

    onBlurCodigoAsignatura() {
        // const control = this.asignaturaForm.get(
        //     'codigoAsignatura'
        // ) as FormControl;
        // console.log(control);
        // const asignaturaExistente =
        //     this.asignaturaService.validarAsignaturaUnica(control.value);
        // if (asignaturaExistente) {
        //     this.messageService.add({
        //         key: 'bc',
        //         severity: 'info',
        //         summary: 'Info',
        //         detail: 'La asignatura ya se encuentra registrada',
        //     });
        //     this.asignaturaForm.get('codigoAsignatura').patchValue('');
        //     this.codigoAsignatura = '';
        // }
    }

    onBlurNombreAsignatura() {
        const control = this.asignaturaForm.get(
            'nombreAsignatura'
        ) as FormControl; // Cambia 'codigoAsignatura' por 'nombreAsignatura' si estás validando el nombre.
        const nombreAsignatura = control.value;
        this.asignaturaService
            .validarNombreAsignatura(nombreAsignatura)
            .subscribe((existe) => {
                if (existe) {
                    this.messageService.add({
                        key: 'bc',
                        severity: 'info',
                        summary: 'Info',
                        detail: 'La asignatura ya se encuentra registrada',
                    });
                    control.setValue(''); // Si deseas borrar el campo del formulario
                }
            });
    }

    onFileSelect(event: any) {
        const file: File = event.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                const base64Content = dataUrl.split(',')[1];

                // Store only the base64-encoded content in the base64File variable
                this.base64File = base64Content;
                //console.log('Archivo en base64:', this.base64File);

                // Set the base64File value in the form control
                this.asignaturaForm.patchValue({
                    base64File: this.base64File,
                });
            };
            reader.readAsDataURL(file);
        }
    }

    onFileSelectOficio(event: any) {
        const file: File = event.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                const base64Content = dataUrl.split(',')[1];
                this.base64FileOficio = base64Content;
                this.fileNameOficio = file.name.concat('-');
                this.asignaturaForm.patchValue({
                    base64FileOficio:
                        this.fileNameOficio + this.base64FileOficio,
                });
            };
            reader.readAsDataURL(file);
        }
    }

    onFileSelectContenidoProgramatico(event: any) {
        const file: File = event.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                const base64Content = dataUrl.split(',')[1];
                this.base64FileContenidoProgramatico = base64Content;
                this.fileNameContenidoProgramatico = file.name.concat('-');
                this.asignaturaForm.patchValue({
                    base64FileContenidoProgramatico:
                        this.fileNameContenidoProgramatico +
                        this.base64FileContenidoProgramatico,
                });
            };
            reader.readAsDataURL(file);
        }
    }

    onFileSelectMicrocurriculo(event: any) {
        const file: File = event.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                const base64Content = dataUrl.split(',')[1];
                this.base64FileMicrocurriculo = base64Content;
                this.fileNameMicrocurriculo = file.name.concat('-');
                this.asignaturaForm.patchValue({
                    base64FileMicrocurriculo:
                        this.fileNameMicrocurriculo +
                        this.base64FileMicrocurriculo,
                });
            };
            reader.readAsDataURL(file);
        }
    }

    cancelarOficio() {
        this.asignaturaForm.get('numeroOficio').setValue(0);
        this.asignaturaForm.get('asuntoOfi').setValue(null);
        this.asignaturaForm.get('fechaAprobacionOficio').setValue(null);
        this.asignaturaForm.get('base64FileOficio').setValue(null);

        this.asignaturaForm.get('numeroOficio').markAsUntouched();
        this.asignaturaForm.get('asuntoOfi').markAsUntouched();
        this.asignaturaForm.get('fechaAprobacionOficio').markAsUntouched();
        this.asignaturaForm.get('base64FileOficio').markAsUntouched();

        this.oficioDialog = false;
    }

    cancelarContenidoProgramatico() {
        this.asignaturaForm
            .get('versionDocContenidoProgramatico')
            .setValue(null);
        this.asignaturaForm
            .get('nombreDocumentoContenidoProgrmatico')
            .setValue(null);
        this.asignaturaForm
            .get('descripcionDocumentoContenidoProgramatico')
            .setValue(null);
        this.asignaturaForm
            .get('base64FileContenidoProgramatico')
            .setValue(null);

        this.asignaturaForm
            .get('versionDocContenidoProgramatico')
            .markAsUntouched();
        this.asignaturaForm
            .get('nombreDocumentoContenidoProgrmatico')
            .markAsUntouched();
        this.asignaturaForm
            .get('descripcionDocumentoContenidoProgramatico')
            .markAsUntouched();
        this.asignaturaForm
            .get('base64FileContenidoProgramatico')
            .markAsUntouched();

        this.contenidoProgramaticoDialog = false;
    }

    cancelarMicrocurriculo() {
        this.asignaturaForm.get('versionDoc').setValue(null);
        this.asignaturaForm.get('nombreDocumentoMicrocurriculo').setValue(null);
        this.asignaturaForm
            .get('descripcionDocumentoMicrocurriculo')
            .setValue(null);
        this.asignaturaForm.get('base64FileMicrocurriculo').setValue(null);

        this.asignaturaForm.get('versionDoc').markAsUntouched();
        this.asignaturaForm
            .get('nombreDocumentoMicrocurriculo')
            .markAsUntouched();
        this.asignaturaForm
            .get('descripcionDocumentoMicrocurriculo')
            .markAsUntouched();
        this.asignaturaForm.get('base64FileMicrocurriculo').markAsUntouched();

        this.microcurriculoDialog = false;
    }

    limpiarFormulario() {
        this.asignaturaForm.reset({
            codigoAsignatura: '',
            nombre: '',
            estado: '',
            fechaAprobacion: '',
            areaFormacion: '',
            tipo: '',
            // oficioFacultad: ['', [Validators.required]],
            lineaInvestigacionAsignatura: '',
            //  contenidoProgramatico: ['', [Validators.required]],
            // microcurriculo: ['', [Validators.required]],
            creditos: '',
            objetivo: '',
            contenido: '',
            horasPresenciales: '',
            horasNoPresenciales: '',
            horasTotal: '',
            // idDocente: ['', [Validators.required]],
            listaDocentes: '',
        });
    }

    limpiarBase64Oficio() {
        this.asignaturaForm.patchValue({
            base64FileOficio: null,
        });
        if (this.fileUpload) {
            this.fileUpload.clear();
        }
    }

    limpiarBase64FileContenidoProgramatico() {
        this.asignaturaForm.patchValue({
            base64FileContenidoProgramatico: null,
        });
        if (this.fileUpload) {
            this.fileUpload.clear();
        }
    }

    limpiarBase64FileMicrocurriculo() {
        this.asignaturaForm.patchValue({
            base64FileMicrocurriculo: null,
        });
        if (this.fileUpload) {
            this.fileUpload.clear();
        }
    }

    // editProduct(acta: Asignatura) {
    //     this.acta = {...acta};
    //     this.productDialog = true;
    // }
}
