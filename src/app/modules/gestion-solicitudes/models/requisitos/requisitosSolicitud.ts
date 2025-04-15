import { DocumentoRequerido } from './documentoRequerido';

export class RequisitosSolicitud {
    static nuevoRequisitosSolicitud(obj: Object) {
        return new RequisitosSolicitud(
            obj['tituloDocumento'],
            obj['descripcion'],
            obj['articulo'],
            obj['tenerEnCuenta'],
            obj['documentosRequeridos'],
            obj['enlacesRequeridos'],
            obj['notas']
        );
    }

    constructor(
        public tituloDocumento: string,
        public descripcion: string,
        public articulo: string,
        public tenerEnCuenta: string,
        public documentosRequeridos: DocumentoRequerido[],
        public enlacesRequeridos: string[],
        public notas: string[]
    ) {}
}
