export class DatosSolicitudAvalPasantia {
    static nuevoDatosSolicitudAvalPasantia(obj: Object) {
        return new DatosSolicitudAvalPasantia(
            obj['lugarPasantia'],
            obj['fechaInicio'],
            obj['fechaFin'],
            obj['documentosAdjuntos'],
            obj['universidadResidencia'],
            obj['grupoUniversidadResidencia'],
            obj['nombreDocenteExterno']
        );
    }

    constructor(
        public lugarPasantia: string,
        public fechaInicio: string,
        public fechaFin: string,
        public documentosAdjuntos: string[],
        public universidadResidencia: string,
        public grupoUniversidadResidencia: string,
        public nombreDocenteExterno: string
    ) {}
}
