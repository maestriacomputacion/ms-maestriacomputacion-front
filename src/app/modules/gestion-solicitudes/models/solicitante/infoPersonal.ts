export class InfoPersonal {
    static nuevoInfoPersonal(obj: Object) {
        return new InfoPersonal(
            obj['id'],
            obj['nombres'],
            obj['apellidos'],
            obj['correo'],
            obj['celular'],
            obj['codigoAcademico'],
            obj['tipoDocumento'],
            obj['numeroDocumento']
        );
    }

    constructor(
        public id: string,
        public nombres: string,
        public apellidos: string,
        public correo: string,
        public celular: string,
        public codigoAcademico: string,
        public tipoDocumento: string,
        public numeroDocumento: string
    ) {}
}
