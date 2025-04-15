export class AprobarHomologacion {
    static nuevoAprobarHomologacion(obj: Object) {
        return new AprobarHomologacion(
            obj['idHomologacion'],
            obj['nombreAsignatura'],
            obj['creditos'],
            obj['intensidadHoraria'],
            obj['calificacion'],
            obj['nombrePrograma'],
            obj['nombreInstitucion'],
            obj['aprobado']
        );
    }

    constructor(
        public idHomologacion: number,
        public nombreAsignatura: string,
        public creditos: number,
        public intensidadHoraria: number,
        public calificacion: number,
        public nombrePrograma: string,
        public nombreInstitucion: string,
        public aprobado: boolean
    ) {}
}
