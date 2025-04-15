export class DatosReconoCreditos {
    static nuevoDatosReconoCreditos(obj: Object) {
        return new DatosReconoCreditos(obj['documentosAdjuntos'], obj['enlacesAdjuntos']);
    }

    constructor(public documentosAdjuntos: string[], public enlacesAdjuntos: string[]) {}
}
