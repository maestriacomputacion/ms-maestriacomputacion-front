import { DatosSolicitante } from '../indiceModelos';

export class DatosComunSolicitud {
    static nuevoDatosComunSolicitud(obj: Object) {
        return new DatosComunSolicitud(
            obj['tipoSolicitud'],
            obj['radicado'],
            obj['fechaEnvioSolicitud'],
            obj['nombreSolicitante'],
            obj['apellidoSolicitante'],
            obj['codigoSolicitante'],
            obj['emailSolicitante'],
            obj['celularSolicitante'],
            obj['tipoIdentSolicitante'],
            obj['numeroIdentSolicitante'],
            obj['nombreTutor'],
            obj['nombreDirector'],
            obj['requiereFirmaDirector'],
            obj['firmaSolicitante'],
            obj['firmaTutor'],
            obj['firmaDirector'],
            obj['estadoSolicitud'],
            obj['numPaginaTutor'],
            obj['numPaginaDirector'],
            obj['posXTutor'],
            obj['posYTutor'],
            obj['posXDirector'],
            obj['posYDirector'],
            obj['oficioPdf']
        );
    }

    constructor(
        public tipoSolicitud: string,
        public radicado: string,
        public fechaEnvioSolicitud: Date,
        public nombreSolicitante: string,
        public apellidoSolicitante: string,
        public codigoSolicitante: string,
        public emailSolicitante: string,
        public celularSolicitante: string,
        public tipoIdentSolicitante: string,
        public numeroIdentSolicitante: string,
        public nombreTutor: string,
        public nombreDirector: string,
        public requiereFirmaDirector: boolean,
        public firmaSolicitante: boolean,
        public firmaTutor: boolean,
        public firmaDirector: boolean,
        public estadoSolicitud: string,
        public numPaginaTutor: number,
        public numPaginaDirector: number,
        public posXTutor: number,
        public posYTutor: number,
        public posXDirector: number,
        public posYDirector: number,
        public oficioPdf: string
    ) {}

    static toDatosSolicitante(obj: DatosComunSolicitud): DatosSolicitante {
        return new DatosSolicitante(
            obj.nombreSolicitante,
            obj.apellidoSolicitante,
            obj.emailSolicitante,
            obj.celularSolicitante,
            obj.codigoSolicitante,
            obj.tipoIdentSolicitante,
            obj.numeroIdentSolicitante
        );
    }
}
