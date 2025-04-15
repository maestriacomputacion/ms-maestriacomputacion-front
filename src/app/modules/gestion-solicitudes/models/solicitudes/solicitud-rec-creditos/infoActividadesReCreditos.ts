export class InfoActividadesReCreditos {
    static nuevoInfoActividadesReCreditos(obj: Object) {
        return new InfoActividadesReCreditos(
            obj['id'],
            obj['idTipoSolicitud'],
            obj['codigo'],
            obj['nombre'],
            obj['abreviatura'],
            obj['peso'],
            obj['horasAsignadas'],
            obj['documentos'],
            obj['enlaces']
        );
    }

    constructor(
        public id: number,
        public idTipoSolicitud: number,
        public codigo: string,
        public nombre: string,
        public abreviatura: string,
        public peso: number,
        public horasAsignadas: number,
        public documentos: string[],
        public enlaces: string[]
    ) {}
}
