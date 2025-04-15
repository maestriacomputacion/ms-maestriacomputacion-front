export class AprobarAvalComite {
    static nuevoAprobarAvalComite(obj: Object) {
        return new AprobarAvalComite(
            obj['idSubtipo'],
            obj['nombreActividad'],
            obj['aprobado'],
            obj['horasReconocer'],
            obj['creditosReconocer']
        );
    }

    constructor(
        public idSubtipo: number,
        public nombreActividad: string,
        public aprobado: boolean,
        public horasReconocer: number,
        public creditosReconocer: number
    ) {}
}
