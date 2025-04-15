export class AprobarAsignaturasExt {
    static nuevoAprobarAsignaturasExt(obj: Object) {
        return new AprobarAsignaturasExt(
            obj['idCursarAsignatura'],
            obj['nombreAsignatura'],
            obj['codigo'],
            obj['creditos'],
            obj['intensidadHoraria'],
            obj['grupo'],
            obj['nombreInstitucion'],
            obj['nombrePrograma'],
            obj['tituloDocente'],
            obj['nombreDocente'],
            obj['aprobado']
        );
    }

    constructor(
        public idCursarAsignatura: number,
        public nombreAsignatura: string,
        public codigo: string,
        public creditos: number,
        public intensidadHoraria: number,
        public grupo: string,
        public nombreInstitucion: string,
        public nombrePrograma: string,
        public tituloDocente: string,
        public nombreDocente: string,
        public aprobado: boolean
    ) {}
}
