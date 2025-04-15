export class DatosActividadPracticaDocente {
    static nuevoDatosActividadPracticaDocente(obj: Object) {
        return new DatosActividadPracticaDocente(
            obj['codigoSubtipo'],
            obj['intensidadHoraria'],
            obj['horasReconocer'],
            obj['documentosAdjuntos'],
            obj['enlacesAdjuntos']
        );
    }

    constructor(
        public codigoSubtipo: string,
        public intensidadHoraria: number,
        public horasReconocer: number,
        public documentosAdjuntos: string[],
        public enlacesAdjuntos: string[]
    ) {}
}
