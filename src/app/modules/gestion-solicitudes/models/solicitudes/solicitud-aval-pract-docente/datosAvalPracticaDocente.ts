export class DatosAvalPracticaDocente {
    static nuevoDatosAvalPracticaDocente(obj: Object) {
        return new DatosAvalPracticaDocente(
            obj['codigoSubtipo'],
            obj['intensidadHoraria'],
            obj['horasReconocer'],
            obj['descripcionActividad'],
            obj['documentoAdjunto']
        );
    }

    constructor(
        public codigoSubtipo: string,
        public intensidadHoraria: number,
        public horasReconocer: number,
        public descripcionActividad: string,
        public documentoAdjunto: string
    ) {}
}
