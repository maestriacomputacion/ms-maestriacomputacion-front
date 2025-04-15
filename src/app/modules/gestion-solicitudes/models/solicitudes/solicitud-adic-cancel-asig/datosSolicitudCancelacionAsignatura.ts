import { InfoAsingAdicionCancelacion } from './infoAsignAdicionCancelacion';

export class DatosSolicitudCancelacionAsignatura {
    static nuevoDatosSolicitudCancelacionAsignatura(obj: Object) {
        return new DatosSolicitudCancelacionAsignatura(obj['listaAsignaturas'], obj['motivo'], obj['documentoAdjunto']);
    }

    constructor(
        public listaAsignaturas: InfoAsingAdicionCancelacion[],
        public motivo: string,
        public documentoAdjunto: string
    ) {}
}
