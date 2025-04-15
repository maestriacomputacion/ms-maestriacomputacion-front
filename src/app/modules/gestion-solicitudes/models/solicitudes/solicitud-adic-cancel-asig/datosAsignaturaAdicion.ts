export class DatosAsignaturaAdicion {
    static nuevoDatosAsignaturaAdicion(obj: Object) {
        return new DatosAsignaturaAdicion(
            obj['id'],
            obj['nombreAsignatura'],
            obj['codigoAsignatura'],
            obj['nombreDocente'],
            obj['infoAsignatura']
        );
    }

    constructor(
        public id: number,
        public nombreAsignatura: string,
        public codigoAsignatura: string,
        public nombreDocente: string,
        public infoAsignatura: string
    ) {}
}
