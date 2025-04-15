export class DatosSolicitudBecaDescuento {
    static nuevoDatosSolicitudBecaDescuento(obj: Object) {
        return new DatosSolicitudBecaDescuento(
            obj['tipo'],
            obj['motivo'],
            obj['formatoSolicitudBeca']
        );
    }

    constructor(
        public tipo: string,
        public motivo: string,
        public formatoSolicitudBeca: string
    ) {}
}
