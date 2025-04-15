export class AprobarAsignaturas {
    static nuevoAprobarAsignaturas(obj: Object) {
        return new AprobarAsignaturas(
            obj['idAsignatura'],
            obj['nombre'],
            obj['grupo'],
            obj['nombreDocente'],
            obj['aprobado']
        );
    }

    constructor(
        public idAsignatura: number,
        public nombre: string,
        public grupo: string,
        public nombreDocente: string,
        public aprobado: boolean
    ) {}
}
