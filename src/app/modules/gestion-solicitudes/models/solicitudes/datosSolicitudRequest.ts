import * as Modelos from '../indiceModelos';

export class DatosSolicitudRequest {
    static nuevoDatosSolicitudRequest(obj: Object) {
        return new DatosSolicitudRequest(
            obj['datosComunSolicitud'],
            obj['datosSolicitudHomologacion'],
            obj['datosSolicitudAplazarSemestre'],
            obj['datosSolicitudCursarAsignaturas'],
            obj['dadicionCancelacionAsignatura'],
            obj['datoAvalPasantiaInv'],
            obj['datosApoyoEconomico'],
            obj['datosRecCreditosPasantia'],
            obj['datosAvalSeminario'],
            obj['datosApoyoEconomicoCongreso'],
            obj['datosApoyoEconomicoPublicacion'],
            obj['datosActividadDocente'],
            obj['datosAvalComite'],
            obj['datoSolicitudBeca']
        );
    }

    constructor(
        public datosComunSolicitud: Modelos.DatosComunSolicitud,
        public datosSolicitudHomologacion: Modelos.DatosSolHomologPostRequest,
        public datosSolicitudAplazarSemestre: Modelos.DatosSolicitudAplazamiento,
        public datosSolicitudCursarAsignaturas: Modelos.DatosAsignaturaProgramasExt,
        public dadicionCancelacionAsignatura: Modelos.InfoAsingSimple,
        public datoAvalPasantiaInv: Modelos.DatosSolicitudAvalPasantia,
        public datosApoyoEconomico: Modelos.DatosApoyoPasantia,
        public datosReconocimientoCreditos: Modelos.DatosReconoCreditos,
        public datosAvalSeminario: any,
        public datosApoyoEconomicoCongreso: Modelos.DatosApoyoCongreso,
        public datosApoyoEconomicoPublicacion: Modelos.DatosApoyoPublicacion,
        public datosActividadDocente: Modelos.DatosReCreditosPracticaDocente[],
        public datosAvalComite: Modelos.DatosAvalPracticaDResponse[],
        public datoSolicitudBeca: Modelos.DatosSolicitudBecaDescuento
    ) {}
}
