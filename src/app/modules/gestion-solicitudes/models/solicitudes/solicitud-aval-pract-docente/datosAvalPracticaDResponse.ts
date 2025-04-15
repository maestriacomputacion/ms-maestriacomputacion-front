export class DatosAvalPracticaDResponse {
    static nuevoDatosAvalPracticaDResponse(obj: Object) {
        return new DatosAvalPracticaDResponse(obj['nombreActividad'], obj['horasReconocer'], obj['documentoAdjunto']);
    }

    constructor(public nombreActividad: string, public horasReconocer: number, public documentoAdjunto: string) {}
}
