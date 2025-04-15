export class InformacionRoles {
    static nuevoInformacionRoles(obj: Object) {
        return new InformacionRoles(obj['cargo'], obj['nombreCompleto'], obj['titulo'], obj['tratamiento']);
    }

    constructor(
        public cargo: string,
        public nombreCompleto: string,
        public titulo: string,
        public tratamiento: string
    ) {}
}
