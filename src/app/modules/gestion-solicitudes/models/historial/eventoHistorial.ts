export class EventoHistorial {
    static nuevoEventoHistorial(obj: Object) {
        return new EventoHistorial(
            obj['radicado'],
            obj['estadoSolicitud'],
            obj['fechaHora'],
            obj['pdfBase64'],
            obj['descripcion'],
            obj['comentarios']
        );
    }

    constructor(
        public radicado: string,
        public estadoSolicitud: string,
        public fechaHora: Date,
        public pdfBase64: string,
        public descripcion: string,
        public comentarios: string
    ) {}
}
