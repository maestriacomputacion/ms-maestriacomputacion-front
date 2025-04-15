export class datosSolicitudCerVoto {
    static nuevodatosSolicitudCerVoto(obj: Object) {
        return new datosSolicitudCerVoto(
            obj['codigoAcademico'],
            obj['idSolicitud'],
            obj['pdfBase64'],
            obj['fechaHoraEntrega'],
            obj['fechaHoraRevision'],
            obj['estadoSolicitud']
        );
    }

    constructor(
        public codigoAcademico: string,
        public idSolicitud: string,   
        public pdfBase64: string,
        public fechaHoraEntrega: Date,
        public fechaHoraRevision: Date,
        public estadoSolicitud: string
    ) {}
}
