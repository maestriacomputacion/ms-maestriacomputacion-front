export class AsignaturaExterna {
    static nuevaAsignaturaExterna(obj: Object) {
        return new AsignaturaExterna(
            obj['programaProcedencia'],
            obj['institutoProcedencia'],
            obj['nombreAsignatura'],
            obj['numeroCreditos'],
            obj['intensidadHoraria'],
            obj['contenidoProgramatico'],
            obj['codigoAsignatura'],
            obj['grupo'],
            obj['nombreDocente'],
            obj['tituloDocente'],
            obj['cartaAceptacion']
        );
    }

    constructor(
        public programaProcedencia: string,
        public institutoProcedencia: string,
        public nombreAsignatura: string,
        public numeroCreditos: number,
        public intensidadHoraria: number,
        public contenidoProgramatico: string,
        public codigoAsignatura: string,
        public grupo: string,
        public nombreDocente: string,
        public tituloDocente: string,
        public cartaAceptacion: string
    ) {}
}
