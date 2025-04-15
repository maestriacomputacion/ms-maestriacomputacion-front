import { AsignaturaHomologPost } from './asignaturaHomologPost';

export class DatosSolHomologPostRequest {
    static nuevoDatosSolHomologPostRequest(obj: Object) {
        return new DatosSolHomologPostRequest(
            obj['programaProcedencia'],
            obj['institutoProcedencia'],
            obj['datosAsignatura'],
            obj['documentosAdjuntos'],
            obj['estadoSolicitud']
        );
    }

    constructor(
        public programaProcedencia: string,
        public institutoProcedencia: string,
        public datosAsignatura: AsignaturaHomologPost[],
        public documentosAdjuntos: string[],
        public estadoSolicitud: string
    ) {}
}
