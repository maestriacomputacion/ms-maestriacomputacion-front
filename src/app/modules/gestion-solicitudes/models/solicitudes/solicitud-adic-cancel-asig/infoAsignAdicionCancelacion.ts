export class InfoAsingAdicionCancelacion {
    static nuevoInfoAsignAdicionCancelacion(obj: Object) {
        return new InfoAsingAdicionCancelacion(obj['nombreAsignatura'], obj['grupo'], obj['idDocente']);
    }

    constructor(public nombreAsignatura: string, public grupo: string, public idDocente: string) {}
}
