export class DatosApoyoCongreso {
    static nuevoDatosApoyoCongreso(obj: Object) {
        return new DatosApoyoCongreso(
            obj['nombreCongreso'],
            obj['tipoCongreso'],
            obj['fechaInicio'],
            obj['fechaFin'],
            obj['idDirectorGrupo'],
            obj['nombreDirectorGrupo'],
            obj['tituloPublicacion'],
            obj['valorApoyo'],
            obj['entidadBancaria'],
            obj['tipoCuenta'],
            obj['numeroCuenta'],
            obj['numeroCedulaAsociada'],
            obj['direccionResidencia'],
            obj['documentosAdjuntos'],
            obj['grupoInvestigacion'],
            obj['lugarEvento']
        );
    }

    constructor(
        public nombreCongreso: string,
        public tipoCongreso: string,
        public fechaInicio: string,
        public fechaFin: string,
        public idDirectorGrupo: string,
        public nombreDirectorGrupo: string,
        public tituloPublicacion: string,
        public valorApoyo: number,
        public entidadBancaria: string,
        public tipoCuenta: string,
        public numeroCuenta: string,
        public numeroCedulaAsociada: string,
        public direccionResidencia: string,
        public documentosAdjuntos: string[],
        public grupoInvestigacion: string,
        public lugarEvento: string
    ) {}
}
