export class DatosReCreditosPracticaDocente {
    static nuevoDatosReCreditosPracticaDocente(obj: Object) {
        return new DatosReCreditosPracticaDocente(
            obj['nombreActividad'],
            obj['horasReconocer'],
            obj['documentos'],
            obj['enlaces']
        );
    }

    constructor(
        public nombreActividad: string,
        public horasReconocer: number,
        public documentos: string[],
        public enlaces: string[]
    ) {}
}
