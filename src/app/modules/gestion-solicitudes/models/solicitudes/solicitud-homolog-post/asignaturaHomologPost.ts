export class AsignaturaHomologPost {
    static nuevoAsignaturaHomologPost(obj: Object) {
        return new AsignaturaHomologPost(
            obj['nombreAsignatura'],
            obj['numeroCreditos'],
            obj['intensidadHoraria'],
            obj['calificacion'],
            obj['contenidoProgramatico']
        );
    }

    constructor(
        public nombreAsignatura: string,
        public numeroCreditos: number,
        public intensidadHoraria: number,
        public calificacion: number,
        public contenidoProgramatico: string
    ) {}
}
