import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { InfoActividadesReCreditos, RequisitosSolicitud, TipoSolicitud, TutorYDirector } from '../models/indiceModelos';
import { InfoAsingAdicionCancelacion } from '../models/solicitudes/solicitud-adic-cancel-asig/infoAsignAdicionCancelacion';
import { HttpService } from './http.service';
import { UtilidadesService } from './utilidades.service';
import { FormBuilder, FormGroup } from '@angular/forms';

interface AdjuntosActividad {
    archivos: File[];
    enlaces: string[];
}
interface AdjuntosDeActividades {
    [actividadId: number]: AdjuntosActividad;
}

@Injectable({
    providedIn: 'root',
})
export class RadicarService {
    //private clickSubject = new Subject<void>();

    formInfoPersonal: FormGroup = new FormGroup({});
    formSemestreAplazar: FormGroup = new FormGroup({});
    formApoyoAsistEvento: FormGroup = new FormGroup({});
    formSolicitudBecaDescuento: FormGroup = new FormGroup({});
    formInfoCoordinador: FormGroup = new FormGroup({});
    formInfoPresidenteConsejo: FormGroup = new FormGroup({});
    formInfoOtraSolicitud: FormGroup = new FormGroup({});

    tipoSolicitudEscogida: TipoSolicitud;
    requisitosSolicitudEscogida: RequisitosSolicitud;
    radicadoAsignado: string = '';
    estadoSolicitud: string = '';
    fechaEnvio: Date = null;

    oficioDeSolicitud: File = null;
    documentosAdjuntos: File[] = [];
    enlacesAdjuntos: string[] = [];

    motivoDeSolicitud: string = '';

    listadoTutoresYDirectores: TutorYDirector[];
    tutor: TutorYDirector;
    director: TutorYDirector;

    firmaSolicitante: File = null;
    firmaSolicitanteUrl: SafeUrl = '';
    firmaTutor: File = null;
    firmaTutorUrl: SafeUrl = '';
    firmaTutorPag: number = 0;
    firmaTutorX: number = 0;
    firmaTutorY: number = 0;
    firmaDirector: File = null;
    firmaDirectorUrl: SafeUrl = '';
    firmaDirectorPag: number = 0;
    firmaDirectorX: number = 0;
    firmaDirectorY: number = 0;

    actividadesReCreditos: InfoActividadesReCreditos[];
    actividadesSeleccionadas: InfoActividadesReCreditos[];
    descripcionesActividades: string[] = [];
    adjuntosDeActividades: AdjuntosDeActividades = {};
    horasIngresadas: number[] = [];
    numSemanasIngresado: number[] = [];
    horasAsignables: number[] = [];

    tipoApoyo: string = null;
    InfoDePago: string = '';
    fechasEstancia: Date[] = [];
    lugarEstancia: string = '';
    nombreCongreso: string = '';
    tipoCongreso: string = '';
    tituloPublicacion: string = '';
    nombreRevistaLibro: string = '';

    grupoInvestigacion: string = '';
    valorApoyoEcon: number = 0;
    banco: string = '';
    tipoCuenta: string = '';
    numeroCuenta: string = '';
    cedulaCuentaBanco: string = null;
    direccion: string = '';

    grupoInvestigacionExternoPanatia: string = '';
    UniversidadExternaPasantia: string = '';
    docenteExternoPas: string = '';

    seRequiereTutor: boolean = false;
    seRequieraDirector: boolean = false;

    tipoBeca: string = '';

    asignaturasAdicCancel: InfoAsingAdicionCancelacion[] = [];

    numeroInstanciasAsignExterna: number = 1;
    instanciasAsignExterna: any[] = [{}];
    datosAsignaturasExternas: {
        nombre: string;
        programa: string;
        institucion: string;
        creditos: number;
        intensidad: number;
        codigo: string;
        grupo: string;
        docente: string;
        tituloDocente: string;
        contenidos: File;
        cartaAceptacion: File;
    }[] = [];

    numeroInstanciasAsignAdiCancel: number = 1;
    instanciasAsignAdiCancel: any[] = [{}];
    datosAsignAdiCancel: {
        nombreAsignatura: string;
        grupoAsignatura: string;
        docente: TutorYDirector;
    }[] = [];

    numeroInstAsignHomologar: number = 1;
    instanciasAsignHomologar: any[] = [{}];
    datosInstitucionHomologar: { institucion: string; programa: string } = {
        institucion: '',
        programa: '',
    };

    datosAsignaturasAHomologar: {
        asignatura: string;
        creditos: number;
        intensidad: number;
        calificacion: number;
        contenidos: File;
    }[] = [];

    enlaceMaterialAudiovisual = '';

    constructor(
        private gestorHttp: HttpService,
        private sanitizer: DomSanitizer,
        private utilidades: UtilidadesService,
        private fb: FormBuilder
    ) {}

    restrablecerValores() {
        this.formInfoPersonal = new FormGroup({});
        this.formSemestreAplazar = new FormGroup({});
        this.formApoyoAsistEvento = new FormGroup({});
        this.formSolicitudBecaDescuento = new FormGroup({});
        this.formInfoCoordinador = new FormGroup({});
        this.formInfoPresidenteConsejo = new FormGroup({});
        this.formInfoOtraSolicitud = new FormGroup({});
        this.tipoSolicitudEscogida = null;
        this.radicadoAsignado = '';
        this.asignaturasAdicCancel = [];
        this.documentosAdjuntos = [];
        this.enlacesAdjuntos = [];
        this.tutor = null;
        this.director = null;
        this.oficioDeSolicitud = null;
        this.motivoDeSolicitud = '';
        this.numeroInstAsignHomologar = 1;
        this.instanciasAsignHomologar = [{}];
        this.datosAsignaturasAHomologar = [];
        this.datosInstitucionHomologar = { institucion: '', programa: '' };
        this.docenteExternoPas = '';
        this.actividadesReCreditos = [];
        this.actividadesSeleccionadas = [];
        this.numeroInstanciasAsignExterna = 1;
        this.instanciasAsignExterna = [{}];
        this.datosAsignaturasExternas = [];
        this.numeroInstanciasAsignAdiCancel = 1;
        this.instanciasAsignAdiCancel = [{}];
        this.datosAsignAdiCancel = [];
        this.tipoApoyo = null;
        this.InfoDePago = '';
        this.fechasEstancia = [];
        this.nombreRevistaLibro = '';
        this.lugarEstancia = '';
        this.grupoInvestigacion = '';
        this.grupoInvestigacionExternoPanatia = '';
        this.UniversidadExternaPasantia = '';
        this.valorApoyoEcon = 0;
        this.banco = '';
        this.tipoCuenta = '';
        this.numeroCuenta = '';
        this.cedulaCuentaBanco = '';
        this.direccion = '';
        this.nombreCongreso = '';
        this.tipoCongreso = '';
        this.tituloPublicacion = '';
        this.firmaSolicitante = null;
        this.firmaSolicitanteUrl = '';
        this.firmaTutor = null;
        this.firmaTutorUrl = '';
        this.firmaDirector = null;
        this.firmaDirectorUrl = '';
        this.fechaEnvio = null;
        this.enlaceMaterialAudiovisual = '';
        this.horasIngresadas = [];
        this.numSemanasIngresado = [];
        this.horasAsignables = [];
        this.adjuntosDeActividades = {};
        this.tipoBeca = '';
        this.descripcionesActividades = [];
        this.firmaTutorPag = 0;
        this.firmaTutorX = 0;
        this.firmaTutorY = 0;
        this.firmaDirectorPag = 0;
        this.firmaDirectorX = 0;
        this.firmaDirectorY = 0;
        this.seRequieraDirector = false;
        this.seRequiereTutor = false;
    }

    async asignarDocumentosAdjuntos(docs: string[]): Promise<void> {
        console.log(docs);
        this.documentosAdjuntos = await Promise.all(
            docs.map(async (cadenaBase64) => {
                const archivo = this.utilidades.convertirBase64AFile(cadenaBase64);
                if (archivo) {
                    return archivo;
                } else {
                    throw new Error('Error al convertir la cadena base64 a archivo.');
                }
            })
        );

        console.log(this.documentosAdjuntos);
    }

    obtenerNombreArchivosAdjuntos(): string {
        const adjuntos: string[] = [];

        const agregarNombre = (nombre: string | undefined) => {
            if (nombre) {
                adjuntos.push(nombre);
            }
        };

        // Procesar datosAsignaturasExternas
        this.datosAsignaturasExternas?.forEach((asignatura) => {
            agregarNombre(asignatura.contenidos?.name);
            agregarNombre(asignatura.cartaAceptacion?.name);
        });

        // Procesar datosAsignaturasAHomologar
        this.datosAsignaturasAHomologar?.forEach((asignatura) => {
            agregarNombre(asignatura.contenidos?.name);
        });

        // Procesar documentosAdjuntos
        this.documentosAdjuntos?.forEach((doc) => {
            if (doc && doc.name) {
                // Verificar que doc no sea null y que tenga la propiedad name
                agregarNombre(doc.name);
            }
        });

        // Procesar adjuntosDeActividades
        if (this.adjuntosDeActividades) {
            Object.keys(this.adjuntosDeActividades).forEach((actividadId) => {
                const adjuntosActividad = this.adjuntosDeActividades[Number(actividadId)];
                if (adjuntosActividad) {
                    adjuntos.push(`Actividad ${Number(actividadId) + 1}`);
                    adjuntosActividad.archivos?.forEach((archivo) => {
                        if (archivo && archivo.name) {
                            // Verificar que archivo tenga la propiedad name
                            agregarNombre(`- ${archivo.name}`);
                        }
                    });
                    adjuntosActividad.enlaces?.forEach((enlace) => {
                        agregarNombre(`- Enlace: ${enlace}`);
                    });
                }
            });
        }

        // Procesar enlaces adjuntos
        this.enlacesAdjuntos?.forEach((enlace) => {
            agregarNombre(enlace);
        });

        // Unir los nombres con salto de línea
        return adjuntos.join('\n');
    }

    parseFecha(fechaString) {
        const [day, month, year] = fechaString.split('/').map(Number);
        return new Date(year, month - 1, day);
    }

    convertirFecha(fechaStr) {
        const [dia, mes, anio] = fechaStr.split('/').map(Number);
        return new Date(anio, mes - 1, dia);
    }
}
