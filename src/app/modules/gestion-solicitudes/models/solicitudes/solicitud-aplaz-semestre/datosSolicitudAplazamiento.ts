export class DatosSolicitudAplazamiento {
    static nuevoDatosSolicitudAplazamiento(obj: Object) {
        return new DatosSolicitudAplazamiento(obj['semestre'], obj['motivo'], obj['documentoAdjunto']);
    }

    constructor(public semestre: string, public motivo: string, public documentoAdjunto: string) {}
}
