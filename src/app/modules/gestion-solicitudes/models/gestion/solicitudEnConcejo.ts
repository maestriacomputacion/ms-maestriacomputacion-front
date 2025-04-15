import { AprobarAsignaturasExt, AprobarAvalComite, AprobarHomologacion } from '../indiceModelos';
import { AprobarAsignaturas } from './aprobarAsignaturas';

export class SolicitudEnConcejoResponse {
    static nuevoSolicitudEnConcejoResponse(obj: Object) {
        return new SolicitudEnConcejoResponse(
            obj['idSolicitud'],
            obj['enConcejo'],
            obj['avaladoConcejo'],
            obj['conceptoConcejo'],
            obj['numeroActa'],
            obj['fechaAval'],
            obj['documentosConcejo'],
            obj['asignaturasAprobadas'],
            obj['asignaturasHomologadas'],
            obj['asignaturasOtroPrograma'],
            obj['avalActPracticaDocente'],
            obj['reconocimientoCreditosPD']
        );
    }

    constructor(
        public idSolicitud: number,
        public enConcejo: boolean,
        public avaladoConcejo: string,
        public conceptoConcejo: string,
        public numeroActa: string,
        public fechaAval: string,
        public documentosConcejo: string[],
        public asignaturasAprobadas: AprobarAsignaturas[],
        public asignaturasHomologadas: AprobarHomologacion[],
        public asignaturasOtroPrograma: AprobarAsignaturasExt[],
        public avalActPracticaDocente: AprobarAvalComite[],
        public reconocimientoCreditosPD: AprobarAvalComite[]
    ) {}
}
