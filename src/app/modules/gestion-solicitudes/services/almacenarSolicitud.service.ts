import { Injectable } from '@angular/core';
import * as Modelos from '../models/indiceModelos';
import { HttpService } from './http.service';
import { RadicarService } from './radicar.service';
import { HttpClient } from '@angular/common/http';
import { InfoAsingAdicionCancelacion } from '../models/solicitudes/solicitud-adic-cancel-asig/infoAsignAdicionCancelacion';
import { catchError, map, throwError } from 'rxjs';
import { UtilidadesService } from './utilidades.service';

@Injectable({
    providedIn: 'root',
})
export class AlmacenarSolicitudService {
    firmaSolicitante: string;

    constructor(
        public radicar: RadicarService,
        public http: HttpService,
        public httpService: HttpClient,
        private utilidades: UtilidadesService
    ) {}

    // Almacena una solicitud en la base de datos y retorna el resultado como una promesa de tipo string.
    async almacenarSolicitudEnBD(): Promise<string> {
        // Crear una nueva promesa que resuelve una cadena
        return new Promise<string>(async (resolver, rechazar) => {
            let resultado: string = null;

            // Función para manejar la respuesta del observable
            const manejarRespuesta = (observable) => {
                observable
                    .pipe(
                        map((respuesta: any) => {
                            return typeof respuesta === 'string'
                                ? respuesta
                                : JSON.stringify(respuesta);
                        }),
                        catchError((error: any) => {
                            if (error.error.text) {
                                return [error.error.text];
                            }
                            return throwError(error);
                        })
                    )
                    .subscribe({
                        next: (respuesta: string) => {
                            resultado = respuesta;
                            resolver(resultado);
                        },
                        error: (error) => {
                            rechazar(error);
                        },
                    });
            };

            // Función para manejar diferentes tipos de solicitudes
            const manejarSolicitud = async (
                reunirDatosFn: () => Promise<any>
            ) => {
                const datosSolicitud = await reunirDatosFn();
                const observable = this.http.guardarSolicitud(datosSolicitud);
                manejarRespuesta(observable);
            };

            // Diccionario para mapear códigos de solicitud a funciones de datos
            const mapaSolicitudes = {
                AD_ASIG: this.reunirDatosSolAdicion,
                CA_ASIG: this.reunirDatosSolCancelAsig,
                HO_ASIG_POS: this.reunirDatosSolHomolog,
                HO_ASIG_ESP: this.reunirDatosSolHomolog,
                AP_SEME: this.reunirDatosSolAplazamiento,
                CU_ASIG: this.reunirDatosSolCurAsigExternas,
                AV_PASA_INV: this.reunirDatosSolAvalPasant,
                AP_ECON_INV: this.reunirDatosSolApoyoPasantia,
                AP_ECON_ASI: this.reunirDatosSolApoyoCongreso,
                PA_PUBL_EVE: this.reunirDatosSolApoyoPublicacionInscripcion,
                RE_CRED_PR_DOC: this.reunirDatosSolRecCredPracticaDocente,
                RE_CRED_PAS: this.reunirDatosSolRecCreditosPasantia,
                RE_CRED_PUB: this.reunirDatosSolRecCreditosPublicacion,
                AV_COMI_PR: this.reunirDatosAvalPractDocente,
                SO_BECA: this.reunirDatosSolBecaDescuento,
                CER_VOTO: this.reunirDatosCertificadoVoto,
            };

            // Obtener el código de solicitud actual
            const codigoSolicitud =
                this.radicar.tipoSolicitudEscogida.codigoSolicitud;

            // Si el código de solicitud existe en el mapa, manejar la solicitud correspondiente
            if (mapaSolicitudes[codigoSolicitud]) {
                await manejarSolicitud(
                    mapaSolicitudes[codigoSolicitud].bind(this)
                );
            } else {
                resolver(resultado);
            }
        });
    }

    // Reúne los datos para una solicitud de adición de asignatura.
    async reunirDatosSolAdicion(): Promise<Modelos.SolicitudSave> {
        const asignaturasParaAdicionar: InfoAsingAdicionCancelacion[] =
            this.radicar.datosAsignAdiCancel.map((item) => ({
                nombreAsignatura: item.nombreAsignatura,
                grupo: item.grupoAsignatura,
                idDocente: item.docente.id,
            }));

        return this.construirObjAGuardar('AD_ASIG', asignaturasParaAdicionar);
    }

    // Reúne los datos para una solicitud de beca o descuento.
    async reunirDatosSolBecaDescuento(): Promise<Modelos.SolicitudSave> {
        const tipo =
            this.radicar.formSolicitudBecaDescuento.get('tipoBeca')?.value ||
            '';
        const justificacion =
            this.radicar.formSolicitudBecaDescuento.get('justificacion')
                ?.value || '';
        const documentoAdjunto = this.radicar.documentosAdjuntos[0] || null;

        // Convertimos a base64 solo si hay un documento adjunto
        const formatoDiligenciado = documentoAdjunto
            ? await this.utilidades.convertirFileABase64(documentoAdjunto)
            : '';

        // Creamos el objeto a guardar con los valores extraídos
        const infoBecaDescuento: Modelos.DatosSolicitudBecaDescuento = {
            formatoSolicitudBeca: formatoDiligenciado,
            tipo,
            motivo: justificacion,
        };

        return this.construirObjAGuardar('SO_BECA', infoBecaDescuento);
    }

    // Reúne los datos para una solicitud de cancelación de asignatura.
    async reunirDatosSolCancelAsig(): Promise<Modelos.SolicitudSave> {
        const asignaturas: InfoAsingAdicionCancelacion[] =
            this.radicar.datosAsignAdiCancel.map((item) => ({
                nombreAsignatura: item.nombreAsignatura,
                grupo: item.grupoAsignatura,
                idDocente: item.docente.id,
            }));

        const infoCancelacion: Modelos.DatosSolicitudCancelacionAsignatura = {
            listaAsignaturas: asignaturas,
            motivo: this.radicar.motivoDeSolicitud,
            documentoAdjunto: this.radicar.documentosAdjuntos[0]
                ? await this.utilidades.convertirFileABase64(
                      this.radicar.documentosAdjuntos[0]
                  )
                : null,
        };

        return this.construirObjAGuardar('CA_ASIG', infoCancelacion);
    }

    // Reúne los datos para una solicitud de certificado de votación.
    async reunirDatosCertificadoVoto(): Promise<Modelos.SolicitudSave> {
        let certificado: any;
        //captura de datos
        
        return this.construirObjAGuardar('CER_VOTO', certificado);
    }

    // Reúne los datos para una solicitud de cursar asignaturas externas.
    async reunirDatosSolCurAsigExternas(): Promise<Modelos.SolicitudSave> {
        // Convertir los datos de asignaturas externas en un array de promesas
        const asignaturasExternas = await Promise.all(
            this.radicar.datosAsignaturasExternas.map(async (asignatura) => ({
                programaProcedencia: asignatura.programa,
                institutoProcedencia: asignatura.institucion,
                nombreAsignatura: asignatura.nombre,
                numeroCreditos: asignatura.creditos,
                intensidadHoraria: asignatura.intensidad,
                contenidoProgramatico:
                    await this.utilidades.convertirFileABase64(
                        asignatura.contenidos
                    ),
                codigoAsignatura: asignatura.codigo,
                grupo: asignatura.grupo,
                nombreDocente: asignatura.docente,
                tituloDocente: asignatura.tituloDocente,
                cartaAceptacion: await this.utilidades.convertirFileABase64(
                    asignatura.cartaAceptacion
                ),
            }))
        );

        // Construir el objeto de solicitud con los datos
        const datos: Modelos.DatosCursarAsignaturaDto = {
            motivo: this.radicar.motivoDeSolicitud,
            listaAsignaturasCursar: asignaturasExternas,
        };

        const infoSolicitada: Modelos.DatosSolicitudCursarAsignatura = {
            datosCursarAsignaturaDto: datos,
        };

        return this.construirObjAGuardar('CU_ASIG', infoSolicitada);
    }

    // Reúne los datos para una solicitud de aplazamiento de semestre.
    async reunirDatosSolAplazamiento(): Promise<Modelos.SolicitudSave> {
        const { semestre = '', motivo = '' } =
            this.radicar.formSemestreAplazar.getRawValue();

        const documentoAdjunto = this.radicar.documentosAdjuntos[0]
            ? await this.utilidades.convertirFileABase64(
                  this.radicar.documentosAdjuntos[0]
              )
            : null;

        const datos: Modelos.DatosSolicitudAplazamiento = {
            semestre,
            motivo,
            documentoAdjunto,
        };

        return this.construirObjAGuardar('AP_SEME', datos);
    }

    // Reúne los datos para una solicitud de aval pasantia de investigación.
    async reunirDatosSolAvalPasant(): Promise<Modelos.SolicitudSave> {
        const docsAdjuntos = await this.convertirDocumentosAdjuntos();

        const datos: Modelos.DatosSolicitudAvalPasantia = {
            lugarPasantia: this.radicar.lugarEstancia,
            fechaInicio: this.formatearDate(this.radicar.fechasEstancia[0]),
            fechaFin: this.formatearDate(this.radicar.fechasEstancia[1]),
            documentosAdjuntos: docsAdjuntos,
            universidadResidencia: this.radicar.UniversidadExternaPasantia,
            grupoUniversidadResidencia:
                this.radicar.grupoInvestigacionExternoPanatia,
            nombreDocenteExterno: this.radicar.docenteExternoPas,
        };

        return this.construirObjAGuardar('AV_PASA_INV', datos);
    }

    // Reúne los datos para una solicitud de apoyo económico para pasantia.
    async reunirDatosSolApoyoPasantia() {
        const docsAdjuntos = await this.convertirDocumentosAdjuntos();

        const datos: Modelos.DatosApoyoPasantia = {
            lugarPasantia: this.radicar.lugarEstancia,
            fechaInicio: this.formatearDate(this.radicar.fechasEstancia[0]),
            fechaFin: this.formatearDate(this.radicar.fechasEstancia[1]),
            idDirectorGrupo: this.radicar.director.id,
            nombreDirectorGrupo: null,
            grupoInvestigacion: this.radicar.grupoInvestigacion,
            valorApoyo: this.radicar.valorApoyoEcon,
            entidadBancaria: this.radicar.banco,
            tipoCuenta: this.radicar.tipoCuenta,
            numeroCuenta: this.radicar.numeroCuenta,
            numeroCedulaAsociada: this.radicar.cedulaCuentaBanco,
            direccionResidencia: this.radicar.direccion,
            documentosAdjuntos: docsAdjuntos,
            universidadResidencia: this.radicar.UniversidadExternaPasantia,
            grupoUniversidadResidencia:
                this.radicar.grupoInvestigacionExternoPanatia,
        };

        return this.construirObjAGuardar('AP_ECON_INV', datos);
    }

    // Reúne los datos para una solicitud de cursar apoyo economico para asistencia a congresos.
    async reunirDatosSolApoyoCongreso() {
        const docsAdjuntos = await this.convertirDocumentosAdjuntos();

        const {
            nombreCongreso,
            tipoCongreso,
            fechas,
            tituloPublicacion,
            valorApoyo,
            entidadBancaria,
            tipoCuenta,
            numeroCuenta,
            numeroCedulaAsociada,
            direccionResidencia,
            grupoInvestigacion,
            lugarEvento,
        } = this.radicar.formApoyoAsistEvento.getRawValue();

        const [fechaInicio, fechaFin] = [
            this.utilidades.extraerFechaDeRange(fechas, 0, '-', 1),
            this.utilidades.extraerFechaDeRange(fechas, 1, '-', 1),
        ];

        const datos: Modelos.DatosApoyoCongreso = {
            nombreCongreso,
            tipoCongreso,
            fechaInicio,
            fechaFin,
            idDirectorGrupo: this.radicar.director.id,
            nombreDirectorGrupo: null,
            tituloPublicacion,
            valorApoyo,
            entidadBancaria,
            tipoCuenta,
            numeroCuenta,
            numeroCedulaAsociada,
            direccionResidencia,
            documentosAdjuntos: docsAdjuntos,
            grupoInvestigacion,
            lugarEvento,
        };

        return this.construirObjAGuardar('AP_ECON_ASI', datos);
    }

    // Reúne los datos para una solicitud de pago de publicación o incripción.
    async reunirDatosSolApoyoPublicacionInscripcion(): Promise<Modelos.SolicitudSave> {
        const documentosAdjuntos = await this.convertirDocumentosAdjuntos();

        // Atributos comunes a ambos tipos de apoyo (publicación e inscripción)
        const datosComunes = {
            idDirectorGrupo: this.radicar.director.id,
            nombreDirectorGrupo: null,
            valorApoyo: this.radicar.valorApoyoEcon,
            entidadBancaria: this.radicar.banco,
            tipoCuenta: this.radicar.tipoCuenta,
            numeroCuenta: this.radicar.numeroCuenta,
            numeroCedulaAsociada: this.radicar.cedulaCuentaBanco,
            direccionResidencia: this.radicar.direccion,
            documentosAdjuntos,
            grupoInvestigacion: this.radicar.grupoInvestigacion,
            finalidadApoyo: this.radicar.tipoApoyo,
            informacionPago: this.radicar.InfoDePago,
        };

        // Si el tipo de apoyo es "publicacion", completa los datos específicos para una publicación
        const datosEspecificos =
            this.radicar.tipoApoyo === 'publicacion'
                ? {
                      nombreEvento: null,
                      tipoEvento: this.radicar.tipoCongreso,
                      fechaInicio: null,
                      fechaFin: null,
                      tituloPublicacion: this.radicar.tituloPublicacion,
                      nombreRevista: this.radicar.nombreRevistaLibro,
                      lugarEvento: null,
                  }
                : // En caso contrario "inscripcion", completa los datos específicos para una inscripción
                  {
                      nombreEvento: this.radicar.nombreCongreso,
                      tipoEvento: null,
                      fechaInicio: this.formatearDate(
                          this.radicar.fechasEstancia[0]
                      ),
                      fechaFin: this.formatearDate(
                          this.radicar.fechasEstancia[1]
                      ),
                      tituloPublicacion: null,
                      nombreRevista: null,
                      lugarEvento: this.radicar.lugarEstancia,
                  };

        // Combina los datos comunes y específicos en un solo objeto
        const datos: Modelos.DatosApoyoPublicacion = {
            ...datosComunes,
            ...datosEspecificos,
        };

        // Construye y retorna el objeto de solicitud utilizando 'PA_PUBL_EVE' como identificador de tipo de solicitud
        return this.construirObjAGuardar('PA_PUBL_EVE', datos);
    }

    // Reúne los datos para una solicitud de reconociminto de creditos publicación.
    async reunirDatosSolRecCreditosPublicacion() {
        const docsAdjuntos = await this.convertirDocumentosAdjuntos();

        const datos: Modelos.DatosReconoCreditos = {
            documentosAdjuntos: docsAdjuntos,
            enlacesAdjuntos: this.radicar.enlacesAdjuntos,
        };

        return this.construirObjAGuardar('RE_CRED_PUB', datos);
    }

    // Reúne los datos para una solicitud de reconociminto de creditos pasantia.
    async reunirDatosSolRecCreditosPasantia() {
        const documentos = await Promise.all(
            this.radicar.documentosAdjuntos.map(
                async (documento: any) =>
                    await this.utilidades.convertirFileABase64(documento)
            )
        );

        documentos.push(this.radicar.enlaceMaterialAudiovisual);

        const datos: Modelos.DatosReconoCreditos = {
            documentosAdjuntos: documentos,
            enlacesAdjuntos: this.radicar.enlacesAdjuntos,
        };

        return this.construirObjAGuardar('RE_CRED_PAS', datos);
    }

    // Reúne los datos para una solicitud de aval actividades de practica docente.
    async reunirDatosAvalPractDocente() {
        const datos = await Promise.all(
            this.radicar.actividadesSeleccionadas.map(
                async (actividad, index) => {
                    const intensidad = this.radicar.horasIngresadas[index] || 0;

                    return {
                        codigoSubtipo: actividad.codigo,
                        intensidadHoraria: intensidad,
                        horasReconocer: this.radicar.horasAsignables[index],
                        descripcionActividad:
                            this.radicar.descripcionesActividades[index],
                        documentoAdjunto:
                            actividad.codigo === 'CUR_COR_SEM'
                                ? await this.utilidades.convertirFileABase64(
                                      this.radicar.documentosAdjuntos[index]
                                  )
                                : null,
                    };
                }
            )
        );

        return this.construirObjAGuardar('AV_COMI_PR', datos);
    }

    // Reúne los datos para una solicitud de reconocimiento de créditos actividades de practica docente.
    async reunirDatosSolRecCredPracticaDocente() {
        const datos: Modelos.DatosActividadPracticaDocente[] =
            await Promise.all(
                this.radicar.actividadesSeleccionadas.map(
                    async (actividad, index) => {
                        const docsAdjuntos = await Promise.all(
                            this.radicar.adjuntosDeActividades[
                                index
                            ].archivos.map((archivo) =>
                                this.utilidades.convertirFileABase64(archivo)
                            )
                        );

                        return {
                            codigoSubtipo: actividad.codigo,
                            intensidadHoraria:
                                this.radicar.horasIngresadas[index],
                            horasReconocer: this.radicar.horasAsignables[index],
                            documentosAdjuntos: docsAdjuntos,
                            enlacesAdjuntos:
                                this.radicar.adjuntosDeActividades[index]
                                    .enlaces,
                        };
                    }
                )
            );

        console.log(datos);
        return this.construirObjAGuardar('RE_CRED_PR_DOC', datos);
    }

    // Reúne los datos para una solicitud de homologacion de asignaturas.
    async reunirDatosSolHomolog(): Promise<Modelos.SolicitudSave> {
        const asignaturasAHomologar: Modelos.AsignaturaHomologPost[] = [];
        const conversionesBase64: Promise<string>[] = [];

        for (const asignatura of this.radicar.datosAsignaturasAHomologar) {
            const contenido = asignatura?.contenidos;
            if (contenido) {
                conversionesBase64.push(
                    this.utilidades
                        .convertirFileABase64(contenido)
                        .then((base64String) => base64String?.toString())
                        .catch((error) => {
                            console.error(
                                'Error al convertir a base64:',
                                error
                            );
                            return null;
                        })
                );
            }
        }

        const base64Contents = await Promise.all(conversionesBase64);

        for (
            let index = 0;
            index < this.radicar.datosAsignaturasAHomologar.length;
            index++
        ) {
            const datos: Modelos.AsignaturaHomologPost = {
                nombreAsignatura:
                    this.radicar.datosAsignaturasAHomologar[index].asignatura,
                numeroCreditos:
                    this.radicar.datosAsignaturasAHomologar[index].creditos,
                intensidadHoraria:
                    this.radicar.datosAsignaturasAHomologar[index].intensidad,
                calificacion:
                    this.radicar.datosAsignaturasAHomologar[index].calificacion,
                contenidoProgramatico: base64Contents[index],
            };
            asignaturasAHomologar.push(datos);
        }

        const datosHomologacion: Modelos.FormHomologPost = {
            programaProcedencia:
                this.radicar.datosInstitucionHomologar.programa,
            institucionProcedencia:
                this.radicar.datosInstitucionHomologar.institucion,
            listaAsignaturas: asignaturasAHomologar,
        };

        const documentosAdjuntos = await this.convertirDocumentosAdjuntos();

        const datosSolHomologacion: Modelos.DatosSolHomologPostSave = {
            datosHomologacionDto: datosHomologacion,
            documentosAdjuntos: documentosAdjuntos,
        };

        return this.construirObjAGuardar('HO_ASIG', datosSolHomologacion);
    }

    async construirObjAGuardar(
        tipo: string,
        infoEspecifica: any
    ): Promise<Modelos.SolicitudSave> {
        let pdfCombinado: File = null;
        if (tipo === 'CER_VOTO') {
            // Llama a la función combinarPDFs para combinar el oficio de solicitud con otros PDFs
            const archivosAdicionales: File[] =
                this.radicar.documentosAdjuntos || [];
            pdfCombinado = await this.utilidades.combinarPDFs(
                this.radicar.oficioDeSolicitud,
                archivosAdicionales
            );

            if (pdfCombinado) {
                // Crear un objeto Blob a partir del PDF combinado
                const blob = new Blob([await pdfCombinado.arrayBuffer()], {
                    type: 'application/pdf',
                });

                // Crear un enlace temporal para descargar el PDF
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'certificado-votacion.pdf'; // Nombre del archivo descargado
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Liberar el objeto URL para evitar fugas de memoria
                URL.revokeObjectURL(url);
            }
        }
        const infoSolicitud: Modelos.SolicitudSave = {
            idTipoSolicitud: this.radicar.tipoSolicitudEscogida.idSolicitud,
            idEstudiante: this.radicar.formInfoPersonal.get('id').value,
            idTutor: tipo !== 'CER_VOTO' ? this.radicar.tutor.id : null, // Solo asigna idTutor si el tipo no es CER_VOTO
            datosHomologacion: tipo === 'HO_ASIG' ? infoEspecifica : null,
            datosAdicionAsignatura: tipo === 'AD_ASIG' ? infoEspecifica : null,
            datosCancelarAsignatura: tipo === 'CA_ASIG' ? infoEspecifica : null,
            datosAplazarSemestre: tipo === 'AP_SEME' ? infoEspecifica : null,
            datosCursarAsignatura: tipo === 'CU_ASIG' ? infoEspecifica : null,
            datosAvalPasantiaInv:
                tipo === 'AV_PASA_INV' ? infoEspecifica : null,
            datosApoyoEconomico: tipo === 'AP_ECON_INV' ? infoEspecifica : null,
            datosReconocimientoCreditos:
                tipo === 'RE_CRED_PAS' || tipo === 'RE_CRED_PUB'
                    ? infoEspecifica
                    : null,
            datosAvalSeminario: tipo === 'AV_SEMI_ACT' ? infoEspecifica : null,
            datosApoyoEconomicoCongreso:
                tipo === 'AP_ECON_ASI' ? infoEspecifica : null,
            datosApoyoEconomicoPublicacion:
                tipo === 'PA_PUBL_EVE' ? infoEspecifica : null,
            datosActividadDocenteRequest:
                tipo === 'RE_CRED_PR_DOC' ? infoEspecifica : null,
            datosAvalComite: tipo === 'AV_COMI_PR' ? infoEspecifica : null,
            datosSolicitudBeca: tipo === 'SO_BECA' ? infoEspecifica : null,
            requiereFirmaDirector:
                tipo === 'AP_ECON_INV' ||
                tipo === 'AP_ECON_ASI' ||
                tipo === 'PA_PUBL_EVE'
                    ? true
                    : false,
            idDirector:
                tipo === 'AP_ECON_ASI' ||
                tipo === 'AP_ECON_INV' ||
                tipo === 'PA_PUBL_EVE'
                    ? this.radicar.director.id
                    : null,
            firmaEstudiante: true,
            oficioPdf:
                tipo === 'CER_VOTO'
                    ? await this.utilidades.convertirFileABase64(pdfCombinado)
                    : await this.utilidades.convertirFileABase64(
                          this.radicar.oficioDeSolicitud
                      ),
            numPaginaTutor: this.radicar.firmaTutorPag,
            numPaginaDirector: this.radicar.firmaDirectorPag,
            posXTutor: this.radicar.firmaTutorX,
            posYTutor: this.radicar.firmaTutorY,
            posXDirector: this.radicar.firmaDirectorX,
            posYDirector: this.radicar.firmaDirectorY,
        };

        return infoSolicitud;
    }

    async convertirDocumentosAdjuntos(): Promise<string[]> {
        const documentosAdjuntosPromises: Promise<string>[] =
            this.radicar.documentosAdjuntos.map(async (adjunto) => {
                if (adjunto instanceof File) {
                    return await this.utilidades.convertirFileABase64(adjunto);
                } else {
                    return Promise.resolve(null);
                }
            });

        return Promise.all(documentosAdjuntosPromises);
    }

    formatearDate(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear());
        return `${year}-${month}-${day}`;
    }
}
