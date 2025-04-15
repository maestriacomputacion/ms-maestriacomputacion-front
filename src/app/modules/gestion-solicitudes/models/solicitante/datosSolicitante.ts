import { DatosComunSolicitud } from '../indiceModelos';

export class DatosSolicitante {
    static nuevoDatosSolicitante(obj: Object) {
        return new DatosSolicitante(
            obj['nombres'],
            obj['apellidos'],
            obj['correo'],
            obj['celular'],
            obj['codAcademico'],
            obj['tipoIdentificacion'],
            obj['identificacion']
        );
    }

    constructor(
        public nombres: string = null,
        public apellidos: string = null,
        public correo: string = null,
        public celular: string = null,
        public codAcademico: string = null,
        public tipoIdentificacion: string = null,
        public identificacion: string = null
    ) {}
}
