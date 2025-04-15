import { Injectable } from '@angular/core';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';

import * as StAdic from './adicion-asignaturas-strategy';
import * as StApla from './aplazamiento-semestre-strategy';
import * as StApPa from './apoyo-pasantia-strategy';
import * as StApPu from './apoyo-publicaciones-strategy';
import * as StAvPr from './aval-practica-docente-strategy';
import * as StApCo from './apoyo-congresos-strategy';
import * as StAvPa from './aval-pasantia-strategy';
import * as StCanc from './cancel-asignaturas-strategy';
import * as StCuAs from './curs-asignaturas-ext-strategy';
import * as StHoEs from './homologacion-asig-esp-strategy';
import * as StHoPs from './homologacion-asig-pos-strategy';
import * as StRePd from './rec-cred-practica-doc-strategy';
import * as StRePa from './rec-cred-pasantia-strategy';
import * as StRePu from './rec-cred-publicacion-strategy';
import * as StBeca from './solicitud-becas-strategy';
import * as StOtra from './otro-tipo-solicitud-strategy';
import * as StReVo from './certificado-votacion-strategy';
import { GestorService } from '../../../services/gestor.service';

@Injectable({
    providedIn: 'root',
})
export class DocumentoPDFFactory {
    private estrategiasPorSolicitud: {
        [codigoSolicitud: string]: { [tipoDocumento: string]: any };
    } = {};
    private estrategiasSinSolicitud: { [tipoDocumento: string]: any } = {};

    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {
        // Inicializar las estrategias para documentos con código de solicitud
        this.estrategiasPorSolicitud['AD_ASIG'] = {
            'carta-solicitud': StAdic.SolicitudAdicionAsignaturas,
            'respuesta-comite': StAdic.RespuestaComiteAdicionAsignaturas,
            'oficio-consejo': StAdic.OficioConcejoAdicionAsignaturas,
            'respuesta-consejo': StAdic.RespuestaConcejoAdicionAsignaturas,
        };
        // Estrategias para Aplazamiento de Semestre
        this.estrategiasPorSolicitud['AP_SEME'] = {
            'carta-solicitud': StApla.SolicitudAplazamientoSemestre,
            'respuesta-comite': StApla.RespuestaComiteAplazamientoSemestre,
            'oficio-consejo': StApla.OficioConcejoAplazamientoSemestre,
            'respuesta-consejo': StApla.RespuestaConcejoAplazamientoSemestre,
        };

        // Estrategias para Apoyo Económico en Congresos y Eventos
        this.estrategiasPorSolicitud['AP_ECON_ASI'] = {
            'carta-solicitud': StApCo.SolicitudApoyoEconomicoCongresos,
            'respuesta-comite': StApCo.RespuestaComiteApoyoEconomicoCongresos,
            'oficio-consejo': StApCo.OficioConcejoApoyoEconomicoCongresos,
            'respuesta-consejo': StApCo.RespuestaConcejoApoyoEconomicoCongresos,
        };

        // Estrategias para Apoyo Económico en Pasantías
        this.estrategiasPorSolicitud['AP_ECON_INV'] = {
            'carta-solicitud': StApPa.SolicitudApoyoEconomicoPasantia,
            'respuesta-comite': StApPa.RespuestaComiteApoyoEconomicoPasantia,
            'oficio-consejo': StApPa.OficioConcejoApoyoEconomicoPasantia,
            'respuesta-consejo': StApPa.RespuestaConcejoApoyoEconomicoPasantia,
        };

        // Estrategias para Publicaciones y Eventos
        this.estrategiasPorSolicitud['PA_PUBL_EVE'] = {
            'carta-solicitud': StApPu.SolicitudApoyoPublicOInscrip,
            'respuesta-comite': StApPu.RespuestaComiteApoyoPublicOInscrip,
            'oficio-consejo': StApPu.OficioConcejoApoyoPublicOInscrip,
            'respuesta-consejo': StApPu.RespuestaConcejoApoyoPublicOInscrip,
        };

        // Estrategias para Aval de Práctica Docente
        this.estrategiasPorSolicitud['AV_COMI_PR'] = {
            'carta-solicitud': StAvPr.SolicitudAvalPracticaDocente,
            'respuesta-comite': StAvPr.RespuestaComiteAvalPracticaDocente,
            'oficio-consejo': StAvPr.OficioConcejoAvalPracticaDocente,
            'respuesta-consejo': StAvPr.RespuestaConcejoAvalPracticaDocente,
        };

        // Estrategias para Aval de Pasantía
        this.estrategiasPorSolicitud['AV_PASA_INV'] = {
            'carta-solicitud': StAvPa.SolicitudAvalPasantia,
            'respuesta-comite': StAvPa.RespuestaComiteAvalPasantia,
            'oficio-consejo': StAvPa.OficioConcejoAvalPasantia,
            'respuesta-consejo': StAvPa.RespuestaConcejoAvalPasantia,
        };

        // Estrategias para Cancelación de Asignaturas
        this.estrategiasPorSolicitud['CA_ASIG'] = {
            'carta-solicitud': StCanc.SolicitudCancelacionAsignaturas,
            'respuesta-comite': StCanc.RespuestaComiteCancelacionAsignaturas,
            'oficio-consejo': StCanc.OficioConcejoCancelacionAsignaturas,
            'respuesta-consejo': StCanc.RespuestaConcejoCancelacionAsignaturas,
        };

        // Estrategias para Cursar en Otros Programas
        this.estrategiasPorSolicitud['CU_ASIG'] = {
            'carta-solicitud': StCuAs.SolicitudCursarEnOtrosProgramas,
            'respuesta-comite': StCuAs.RespuestaComiteCursarEnOtrosProgramas,
            'oficio-consejo': StCuAs.OficioConcejoCursarEnOtrosProgramas,
            'respuesta-consejo': StCuAs.RespuestaConcejoCursarEnOtrosProgramas,
        };

        // Estrategias para Homologación de Asignaturas (Esp.)
        this.estrategiasPorSolicitud['HO_ASIG_ESP'] = {
            'carta-solicitud': StHoEs.SolicitudHomologAsignaturasEsp,
            'respuesta-comite': StHoEs.RespuestaComiteHomologAsignaturasEsp,
            'oficio-consejo': StHoEs.OficioConcejoHomologAsignaturasEsp,
            'respuesta-consejo': StHoEs.RespuestaConcejoHomologAsignaturasEsp,
        };

        // Estrategias para Homologación de Asignaturas (Posgrado)
        this.estrategiasPorSolicitud['HO_ASIG_POS'] = {
            'carta-solicitud': StHoPs.SolicitudHomologAsignaturasPos,
            'respuesta-comite': StHoPs.RespuestaComiteHomologAsignaturasPos,
            'oficio-consejo': StHoPs.OficioConcejoHomologAsignaturasPos,
            'respuesta-consejo': StHoPs.RespuestaConcejoHomologAsignaturasPos,
        };

        // Estrategias para Recomendación de Créditos por Práctica Docente
        this.estrategiasPorSolicitud['RE_CRED_PR_DOC'] = {
            'carta-solicitud': StRePd.SolicitudRecoCredPracticaDocente,
            'respuesta-comite': StRePd.RespuestaComiteRecoCredPracticaDocente,
            'oficio-consejo': StRePd.OficioConcejoRecoCredPracticaDocente,
            'respuesta-consejo': StRePd.RespuestaConcejoRecoCredPracticaDocente,
        };

        // Estrategias para Recomendación de Créditos por Pasantía
        this.estrategiasPorSolicitud['RE_CRED_PAS'] = {
            'carta-solicitud': StRePa.SolicitudRecoCredPasantia,
            'respuesta-comite': StRePa.RespuestaComiteRecoCredPasantia,
            'oficio-consejo': StRePa.OficioConcejoRecoCredPasantia,
            'respuesta-consejo': StRePa.RespuestaComiteRecoCredPasantia,
        };

        // Estrategias para Recomendación de Créditos por Publicación
        this.estrategiasPorSolicitud['RE_CRED_PUB'] = {
            'carta-solicitud': StRePu.SolicitudRecoCredPublicacion,
            'respuesta-comite': StRePu.RespuestaComiteRecoCredPublicacion,
            'oficio-consejo': StRePu.OficioConcejoRecoCredPublicacion,
            'respuesta-consejo': StRePu.RespuestaConcejoRecoCredPublicacion,
        };

        // Estrategias para Solicitud de Beca
        this.estrategiasPorSolicitud['SO_BECA'] = {
            'carta-solicitud': StBeca.SolicitudDeBeca,
            'respuesta-comite': StBeca.RespuestaComiteSolicitudDeBeca,
            'oficio-consejo': StBeca.OficioConcejoSolicitudDeBeca,
            'respuesta-consejo': StBeca.RespuestaConcejoSolicitudDeBeca,
        };

        // Estrategias para Solicitud de Otro tipo
        this.estrategiasPorSolicitud['SO_OTRA'] = {
            'carta-solicitud': StOtra.SolicitudDeOtroTipo,
            'respuesta-comite': StOtra.RespuestaSolicitudDeOtroTipo,
        };

        // Estrategias para Solicitud de Certificado de votación
        this.estrategiasPorSolicitud['CER_VOTO'] = {
            'carta-solicitud': StReVo.SolicitudRegistroVoto,
        };
        // Añadir otras solicitudes...

        // Inicializar las estrategias para documentos sin código de solicitud
        //this.estrategiasSinSolicitud['tipo-documento'] = TipoDocumentoStrategy;
        // Añadir otros documentos sin solicitud...
    }

    crearEstrategia(codigoSolicitud: string | null, tipoDocumento: string): DocumentoPDFStrategy | null {
        if (codigoSolicitud) {
            // Para documentos que tienen código de solicitud
            const estrategias = this.estrategiasPorSolicitud[codigoSolicitud];
            if (estrategias && estrategias[tipoDocumento]) {
                return new estrategias[tipoDocumento](
                    this.servicioRadicar,
                    this.servicioPDF,
                    this.servicioGestor,
                    this.servicioUtilidades
                );
            }
        } else {
            // Para documentos que no tienen código de solicitud
            const estrategia = this.estrategiasSinSolicitud[tipoDocumento];
            if (estrategia) {
                return new estrategia(
                    this.servicioRadicar,
                    this.servicioPDF,
                    this.servicioGestor,
                    this.servicioUtilidades
                );
            }
        }
        return null;
    }
}
