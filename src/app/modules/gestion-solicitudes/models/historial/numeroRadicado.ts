export class NumeroRadicado {
    static nuevoNumeroRadicado(obj: Object) {
        return new NumeroRadicado(obj['radicado']);
    }

    constructor(public radicado: string) {}
}
