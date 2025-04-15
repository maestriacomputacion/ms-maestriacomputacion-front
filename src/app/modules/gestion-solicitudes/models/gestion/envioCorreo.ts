export class EnvioCorreoRequest {
    static nuevoEnvioCorreoRequest(obj: Object) {
        return new EnvioCorreoRequest(obj['destinatario'], obj['oficio']);
    }

    constructor(public destinatario: string, public oficio: string) {}
}
