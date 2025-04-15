export class DatosApoyoPasantia {
    static nuevoDatosApoyoPasantia(obj: Object) {
        return new DatosApoyoPasantia(
            obj['lugarPasantia'],
            obj['fechaInicio'],
            obj['fechaFin'],
            obj['idDirectorGrupo'],
            obj['nombreDirectorGrupo'],
            obj['grupoInvestigacion'],
            obj['valorApoyo'],
            obj['entidadBancaria'],
            obj['tipoCuenta'],
            obj['numeroCuenta'],
            obj['numeroCedulaAsociada'],
            obj['direccionResidencia'],
            obj['documentosAdjuntos'],
            obj['universidadResidencia'],
            obj['grupoUniversidadResidencia']
        );
    }

    constructor(
        public lugarPasantia: string,
        public fechaInicio: string,
        public fechaFin: string,
        public idDirectorGrupo: string,
        public nombreDirectorGrupo: string,
        public grupoInvestigacion: string,
        public valorApoyo: number,
        public entidadBancaria: string,
        public tipoCuenta: string,
        public numeroCuenta: string,
        public numeroCedulaAsociada: string,
        public direccionResidencia: string,
        public documentosAdjuntos: string[],
        public universidadResidencia: string,
        public grupoUniversidadResidencia: string
    ) {}
}
