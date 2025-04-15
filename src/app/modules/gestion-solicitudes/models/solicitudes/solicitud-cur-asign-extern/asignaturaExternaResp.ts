export class AsignaturaExternaResp {
    static nuevaAsignaturaExternaResp(obj: Object) {
        return new AsignaturaExternaResp(
            obj['nombrePrograma'],
            obj['nombre'],
            obj['creditos'],
            obj['intensidadHoraria'],
            obj['codigo'],
            obj['grupo'],
            obj['nombreDocente']
        );
    }

    constructor(
        public nombrePrograma: string,
        public nombre: string,
        public creditos: number,
        public intensidadHoraria: number,
        public codigo: string,
        public grupo: string,
        public nombreDocente: string
    ) {}
}
