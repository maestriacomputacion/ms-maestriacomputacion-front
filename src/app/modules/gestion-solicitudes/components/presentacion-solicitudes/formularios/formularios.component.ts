import { Component, EventEmitter, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';

import { RadicarService } from '../../../services/radicar.service';
import { DatosAsignaturaAdicion, InfoPersonal, TutorYDirector } from '../../../models/indiceModelos';
import { HostListener } from '@angular/core';
import { MessageService } from 'primeng/api';
import { HttpService } from '../../../services/http.service';
import { AsignaturadicioncancelComponent } from './complementarios/asignaturadicioncancel/asignaturadicioncancel.component';
import { ListatutoresComponent } from './complementarios/listatutores/listatutores.component';
import { MotivosolicitudComponent } from './complementarios/motivosolicitud/motivosolicitud.component';
import { AsignaturahomologarComponent } from './complementarios/asignaturahomologar/asignaturahomologar.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SemestreaplazarComponent } from './complementarios/semestreaplazar/semestreaplazar.component';
import { AsignaturaexternaComponent } from './complementarios/asignaturaexterna/asignaturaexterna.component';
import { AvalpasantiainvestComponent } from './complementarios/avalpasantiainvest/avalpasantiainvest.component';
import { ListadirectoresComponent } from './complementarios/listadirectores/listadirectores.component';
import { ApyeconomicoestanciaComponent } from './complementarios/apyeconomicoestancia/apyeconomicoestancia.component';
import { ApyasistenciaeventoComponent } from './complementarios/apyasistenciaevento/apyasistenciaevento.component';
import { ApypublicacionComponent } from './complementarios/apypublicacion/apypublicacion.component';
import { TipoBeca } from 'src/app/core/enums/domain-enum';
import { CreditosComponent } from './complementarios/creditos/creditos.component';
import { AvalpracticadocenteComponent } from './complementarios/avalpracticadocente/avalpracticadocente.component';
import { ApyinscripcionComponent } from './complementarios/apyinscripcion/apyinscripcion.component';
import { OtrasolicitudComponent } from './complementarios/otrasolicitud/otrasolicitud.component';
import { BecaDescuentoComponent } from './complementarios/becadescuento/becadescuento.component';

@Component({
    selector: 'app-formularios',
    templateUrl: './formularios.component.html',
    styleUrls: ['./formularios.component.scss'],
    providers: [MessageService],
})
export class FormulariosComponent implements OnInit {
    @Output() cambioDePaso = new EventEmitter<number>();

    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHander(event: Event) {
        event.returnValue = true;
        return '¿Estás seguro de que quieres salir de la página?';
    }
    @ViewChildren(AsignaturadicioncancelComponent)
    formsAsignaturadicioncancel: QueryList<AsignaturadicioncancelComponent>;
    @ViewChild(ListatutoresComponent) formListaTutores: ListatutoresComponent;
    @ViewChild(MotivosolicitudComponent) formMotivo: MotivosolicitudComponent;
    @ViewChildren(AsignaturahomologarComponent)
    formsAsigHomolog: QueryList<AsignaturahomologarComponent>;
    @ViewChild(SemestreaplazarComponent)
    formAplzSemestre: SemestreaplazarComponent;
    @ViewChildren(AsignaturaexternaComponent)
    formsAsigExt: QueryList<AsignaturaexternaComponent>;
    @ViewChild(AvalpasantiainvestComponent)
    formPasInvest: AvalpasantiainvestComponent;
    @ViewChild(ListadirectoresComponent)
    formDirectores: ListadirectoresComponent;
    @ViewChild(ApyeconomicoestanciaComponent)
    formApyEconEst: ApyeconomicoestanciaComponent;
    @ViewChild(ApyasistenciaeventoComponent)
    formApyAsistEvnt: ApyasistenciaeventoComponent;
    @ViewChild(ApypublicacionComponent)
    formApyPagoPublic: ApypublicacionComponent;
    @ViewChild(ApyinscripcionComponent)
    formApyPagoIncrip: ApyinscripcionComponent;
    @ViewChild(CreditosComponent)
    formReCredPracDocente: CreditosComponent;
    @ViewChild(AvalpracticadocenteComponent)
    formAvalPracDocente: AvalpracticadocenteComponent;
    @ViewChild(OtrasolicitudComponent)
    formOtraSolicitud: OtrasolicitudComponent;
    @ViewChild(BecaDescuentoComponent)
    formBecaDescuento: BecaDescuentoComponent;

    identificadorSolicitante: string = 'ctorres@unicauca.edu.co';
    tiposIdentificacion: string[];

    ofertaAcademicaAdiciones: DatosAsignaturaAdicion[];

    formAsigHomologarCont: FormGroup;

    tutorSeleccionado: any;

    tipoSolicitudEscogida: any;

    variableprovisional: boolean = false;

    solicitudEsOtras: boolean = false;

    constructor(
        public radicar: RadicarService,
        private gestorHttp: HttpService,

        private messageService: MessageService,
        private fb: FormBuilder
    ) {
        try {
            this.tipoSolicitudEscogida = this.radicar.tipoSolicitudEscogida;

            if (this.radicar.tipoSolicitudEscogida.codigoSolicitud === 'HO_ASIG_ESP') {
                this.radicar.datosInstitucionHomologar = {
                    institucion: 'Universidad del Cauca',
                    programa: 'Especialización en Desarrollo de Soluciones Informáticas',
                };
            }

            if (['HO_ASIG_POS', 'HO_ASIG_ESP'].includes(this.radicar.tipoSolicitudEscogida.codigoSolicitud)) {
                this.formAsigHomologarCont = this.fb.group({
                    nombrePrograma: [
                        {
                            value: '',
                            disabled: radicar.tipoSolicitudEscogida.codigoSolicitud === 'HO_ASIG_ESP',
                        },
                        Validators.required,
                    ],
                    nombreInstitucion: [
                        {
                            value: '',
                            disabled: radicar.tipoSolicitudEscogida.codigoSolicitud === 'HO_ASIG_ESP',
                        },
                        Validators.required,
                    ],
                });
            }

            if (['AV_COMI_PR'].includes(this.radicar.tipoSolicitudEscogida.codigoSolicitud)) {
                this.gestorHttp.obtenerActividadesDePracticaDocente('aval').subscribe((respuesta) => {
                    this.radicar.actividadesReCreditos = respuesta;
                });
            }

            if (['RE_CRED_PR_DOC'].includes(this.radicar.tipoSolicitudEscogida.codigoSolicitud)) {
                this.gestorHttp.obtenerActividadesDePracticaDocente('creditos').subscribe((respuesta) => {
                    this.radicar.actividadesReCreditos = respuesta;
                });
            }
        } catch (error) {
            console.error('Se produjo un error:', error);

            // Verificar si el error es del tipo TypeError y si contiene la cadena 'codigoSolicitud'
            if (error instanceof TypeError && error.message.includes('codigoSolicitud')) {
                // Redirigir al usuario a una ruta específica
                //this.router.navigate(['/gestionsolicitudes/portafolio/radicar/selector']);
            } else {
                // Manejar otros errores de manera apropiada
                console.error('Error no esperado:', error);
            }
        }

        this.tiposIdentificacion = [
            'Cédula de ciudadania',
            'Cédula de extrangeria',
            'Tarjeta de identidad',
            'Pasaporte',
            'CC',
        ];
    }

    ngOnInit(): void {
        /*
        if (this.radicar.formInfoPersonal.get('nombres').value == null) {
            this.obtenerInfoDeSolicitante();
        }
            */

        if (
            this.radicar.tipoSolicitudEscogida &&
            ['HO_ASIG_POS', 'HO_ASIG_ESP'].includes(this.radicar.tipoSolicitudEscogida.codigoSolicitud)
        ) {
            // Verificar si hay texto en las variables del servicio radicar y llenar el formulario
            if (this.radicar.datosInstitucionHomologar.institucion.trim() !== '') {
                this.formAsigHomologarCont.patchValue({
                    nombreInstitucion: this.radicar.datosInstitucionHomologar.institucion,
                });
            }
            if (this.radicar.datosInstitucionHomologar.programa.trim() !== '') {
                this.formAsigHomologarCont.patchValue({
                    nombrePrograma: this.radicar.datosInstitucionHomologar.programa,
                });
            }

            // Escuchar cambios en el formulario y actualizar las variables en radicar
            this.formAsigHomologarCont.valueChanges.subscribe((value) => {
                this.radicar.datosInstitucionHomologar.institucion = value.nombreInstitucion;
                this.radicar.datosInstitucionHomologar.programa = value.nombrePrograma;
            });
        }

        // Inicializa `solicitudEsOtras`
        this.solicitudEsOtras = this.radicar.tipoSolicitudEscogida.codigoSolicitud === 'SO_OTRA';

        this.recuperarListadoTutores();
    }

    // Obtener el estado de los avales
    get requiereAvalTutor(): boolean {
        return this.radicar.formInfoOtraSolicitud.get('requiereAvalTutor')?.value;
    }

    get requiereAvalDirector(): boolean {
        return this.radicar.formInfoOtraSolicitud.get('requiereAvalDirector')?.value;
    }

    validarDatosFormulario(): boolean {
        let estadoGeneral: boolean = false;

        switch (this.radicar.tipoSolicitudEscogida.codigoSolicitud) {
            case 'AD_ASIG':
                estadoGeneral =
                    this.formsAsignaturadicioncancel.length > 0 &&
                    this.formsAsignaturadicioncancel
                        .toArray()
                        .every((formulario) => formulario.obtenerEstadoFormulario()) &&
                    this.formListaTutores.obtenerEstadoFormulario();
                break;

            case 'CA_ASIG':
                estadoGeneral =
                    this.formsAsignaturadicioncancel.length > 0 &&
                    this.formsAsignaturadicioncancel
                        .toArray()
                        .every((formulario) => formulario.obtenerEstadoFormulario()) &&
                    this.formMotivo.obtenerEstadoFormulario() &&
                    this.formListaTutores.obtenerEstadoFormulario();
                break;
            case 'AP_SEME':
                estadoGeneral =
                    this.formAplzSemestre.obtenerEstadoFormulario() && this.formListaTutores.obtenerEstadoFormulario();
                break;
            case 'CU_ASIG':
                estadoGeneral =
                    this.formsAsigExt.length > 0 &&
                    this.formsAsigExt
                        .toArray()
                        .every(
                            (formulario) =>
                                formulario.obtenerEstadoFormulario() && formulario.validarDocumentosCargados()
                        ) &&
                    this.formListaTutores.obtenerEstadoFormulario() &&
                    this.formMotivo.obtenerEstadoFormulario();
                break;
            case 'HO_ASIG_POS':
                estadoGeneral =
                    this.formsAsigHomolog.length > 0 &&
                    this.formsAsigHomolog
                        .toArray()
                        .every(
                            (formulario) => formulario.obtenerEstadoFormulario() && formulario.validarDocumentoCargado()
                        ) &&
                    this.formListaTutores.obtenerEstadoFormulario() &&
                    this.obtenerEstadoFormularioHomAsig();
                break;
            case 'HO_ASIG_ESP':
                estadoGeneral =
                    this.formsAsigHomolog.length > 0 &&
                    this.formsAsigHomolog.toArray().every((formulario) => formulario.obtenerEstadoFormulario()) &&
                    this.formListaTutores.obtenerEstadoFormulario();

                break;
            case 'AV_PASA_INV':
                estadoGeneral =
                    this.formPasInvest.obtenerEstadoFormulario() &&
                    this.formPasInvest.validarFechas() &&
                    this.formListaTutores.obtenerEstadoFormulario();
                break;
            case 'AP_ECON_INV':
                estadoGeneral =
                    this.formApyEconEst.obtenerEstadoFormulario() &&
                    this.formApyEconEst.validarFechas() &&
                    this.formListaTutores.obtenerEstadoFormulario() &&
                    this.formDirectores.obtenerEstadoFormulario();
                break;
            case 'AP_ECON_ASI':
                estadoGeneral =
                    this.formApyAsistEvnt.obtenerEstadoFormulario() &&
                    this.formApyAsistEvnt.validarFechas() &&
                    this.formListaTutores.obtenerEstadoFormulario() &&
                    this.formDirectores.obtenerEstadoFormulario();
                break;
            case 'PA_PUBL_EVE':
                if (this.radicar.tipoApoyo === 'inscripcion') {
                    const fechasValidas = this.formApyPagoIncrip.validarFechas();

                    estadoGeneral =
                        this.formApyPagoIncrip.obtenerEstadoFormulario() &&
                        fechasValidas &&
                        this.formListaTutores.obtenerEstadoFormulario() &&
                        this.formDirectores.obtenerEstadoFormulario();
                }

                if (this.radicar.tipoApoyo === 'publicacion') {
                    estadoGeneral =
                        this.formApyPagoPublic.obtenerEstadoFormulario() &&
                        this.formListaTutores.obtenerEstadoFormulario() &&
                        this.formDirectores.obtenerEstadoFormulario();
                }

                break;

            case 'RE_CRED_PR_DOC':
                let totalHoras: number = 0;

                estadoGeneral =
                    this.formReCredPracDocente.validarFormulario() && this.formListaTutores.obtenerEstadoFormulario();

                this.radicar.horasAsignables.forEach((horas) => {
                    totalHoras += horas;
                });

                if (totalHoras < 96) {
                    this.showWarnHoras();
                    estadoGeneral = false;
                }

                break;

            case 'AV_COMI_PR':
                estadoGeneral =
                    this.formAvalPracDocente.validarFormulario() && this.formListaTutores.obtenerEstadoFormulario();

                break;

            case 'SO_BECA':
                estadoGeneral =
                    this.formBecaDescuento.validarFormulario() && this.formListaTutores.obtenerEstadoFormulario();

                break;
            case 'CER_VOTO':
                estadoGeneral = true
                
                break;
            case 'SO_OTRA':
                const esRequeridoTutor = this.radicar.seRequiereTutor;
                const esRequeridoDirector = this.radicar.seRequieraDirector;

                estadoGeneral =
                    (esRequeridoTutor ? this.formListaTutores.obtenerEstadoFormulario() : true) &&
                    (esRequeridoDirector ? this.formDirectores.obtenerEstadoFormulario() : true) &&
                    this.formOtraSolicitud.obtenerEstadoFormulario();

                break;
            default:
                estadoGeneral = this.formListaTutores.obtenerEstadoFormulario();
                break;

        }

        return estadoGeneral;
    }

    /*
    obtenerInfoDeSolicitante() {
        this.gestorHttp
            .obtenerInfoPersonalSolicitante(this.identificadorSolicitante)
            .subscribe((respuesta) => {
                this.radicar.datosSolicitante = respuesta;
            });
    }
        */

    agregarInstancia() {
        this.radicar.numeroInstAsignHomologar++;
        this.radicar.instanciasAsignHomologar.push({});
    }

    agregarInstanciaAsigExt() {
        this.radicar.numeroInstanciasAsignExterna++;
        this.radicar.instanciasAsignExterna.push({});
    }

    eliminarInstancia(index: number) {
        this.radicar.datosAsignaturasAHomologar.splice(index, 1);
        this.radicar.instanciasAsignHomologar.splice(index, 1);
    }

    eliminarInstanciaAsigExt(index: number) {
        this.radicar.datosAsignaturasExternas.splice(index, 1);
        this.radicar.instanciasAsignExterna.splice(index, 1);
    }

    agregarInstanciaAsigAdiCancel() {
        this.radicar.numeroInstanciasAsignAdiCancel++;
        this.radicar.instanciasAsignAdiCancel.push({});
    }

    eliminarInstanciaAsigAdiCancel(index: number) {
        this.radicar.datosAsignAdiCancel.splice(index, 1);
        this.radicar.instanciasAsignAdiCancel.splice(index, 1);
    }

    obtenerEstadoFormularioHomAsig(): boolean {
        return this.formAsigHomologarCont.valid;
    }

    recuperarListadoTutores() {
        this.gestorHttp.obtenerTutoresYDirectores().subscribe((respuesta) => {
            // Asignamos la respuesta al arreglo listadoTutoresYDirectores
            this.radicar.listadoTutoresYDirectores = respuesta;

            // Creamos un nuevo tutor
            const nuevoTutor: TutorYDirector = {
                id: '-1',
                codigoTutor: 'codigoNuevoTutor',
                nombreTutor: 'Seleccione un docente',
            };

            // Agregamos el nuevo tutor al inicio del arreglo
            this.radicar.listadoTutoresYDirectores.unshift(nuevoTutor);
        });
    }

    showWarn() {
        this.messageService.add({
            severity: 'warn',
            summary: 'Información Incompleta',
            detail: 'Diligencie todos los campos requeridos',
        });
    }

    showWarnHoras() {
        this.messageService.add({
            severity: 'warn',
            summary: 'Horas Insuficientes',
            detail: 'Las actividades realizadas deben sumar 96 horas como mínimo.',
        });
    }

    navigateToNext() {
        if (this.validarDatosFormulario()) {
            if (
                ['SO_OTRA', 'AD_ASIG', 'CU_ASIG', 'AV_COMI_PR', 'RE_CRED_PR_DOC', 'SO_BECA'].includes(
                    this.radicar.tipoSolicitudEscogida.codigoSolicitud
                )
            ) {
                this.cambioDePaso.emit(2); // Avanzar al ultimo paso
            } else {
                this.cambioDePaso.emit(1); // Avanzar al siguiente paso
            }
        } else {
            this.showWarn();
        }
    }

    navigateToBack() {
        /*
        this.radicar.setDatosSolicitante(this.datosSolicitante);
        this.radicar.setMaterias(this.materiasSeleccionadas);
        */
        this.cambioDePaso.emit(-1); // Retroceder al paso anterior
    }
}
