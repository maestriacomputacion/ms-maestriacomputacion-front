export class DetallesRechazo {
    static nuevoDetallesRechazo(obj: Object) {
        return new DetallesRechazo(
            obj['idSolicitud'],
            obj['emailRevisor'],
            obj['estado'],
            obj['comentario']
        );
    }

    constructor(
        public idSolicitud: number,
        public emailRevisor: string,
        public estado: string,
        public comentario: string
    ) {}
}
