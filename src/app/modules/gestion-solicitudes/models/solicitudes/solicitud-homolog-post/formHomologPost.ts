import { AsignaturaHomologPost } from './asignaturaHomologPost';

export class FormHomologPost {
    static nuevoFormHomologPost(obj: Object) {
        return new FormHomologPost(
            obj['programaProcedencia'],
            obj['institucionProcedencia'],
            obj['listaAsignaturas']
        );
    }

    constructor(
        public programaProcedencia: string,
        public institucionProcedencia: string,
        public listaAsignaturas: AsignaturaHomologPost[]
    ) {}
}
