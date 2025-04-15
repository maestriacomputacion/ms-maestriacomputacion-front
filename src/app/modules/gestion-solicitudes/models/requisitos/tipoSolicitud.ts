import { Timestamp } from 'firebase/firestore';

export class TipoSolicitud {
    static nuevoTipoSolicitud(obj: Object) {
        return new TipoSolicitud(
            obj['idSolicitud'],
            obj['codigoSolicitud'],
            obj['nombreSolicitud'],
            obj['fechaInicio'],
            obj['fechaFinal'],
        );
    }

    constructor(
        public idSolicitud: number,
        public codigoSolicitud: string,
        public nombreSolicitud: string,
        public fechaInicio: string,
        public fechaFinal: string,

    ) {}
}
