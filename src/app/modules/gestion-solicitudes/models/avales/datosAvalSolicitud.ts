export class DatosAvalSolicitud {
    static nuevoDatosAvalSolicitud(obj: object) {
        return new DatosAvalSolicitud(
            obj['idSolicitud'],
            obj['firmaTutor'],
            obj['firmaDirector'],
            obj['documentoPdfSolicitud']
        );
    }

    constructor(
        public idSolicitud: number,
        public firmaTutor: boolean,
        public firmaDirector: boolean,
        public documentoPdfSolicitud: string
    ) {}
}
