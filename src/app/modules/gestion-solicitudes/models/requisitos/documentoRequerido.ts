export class DocumentoRequerido {
    static nuevoDocumentoRequerido(obj: Object) {
        return new DocumentoRequerido(obj['nombre'], obj['nombreAcortado'], obj['agregar']);
    }

    constructor(public nombre: string, public nombreAcortado: string, public adjuntarDocumento: boolean) {}
}
