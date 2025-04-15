import { AprobarAvalComite } from '../indiceModelos';
import { AprobarAsignaturas } from './aprobarAsignaturas';
import { AprobarAsignaturasExt } from './aprobarAsignaturasExt';
import { AprobarHomologacion } from './aprobarHomologacion';

export class SolicitudEnComiteResponse {
    static nuevoSolicitudEnComiteResponse(obj: Object) {
        return new SolicitudEnComiteResponse(
            obj['idSolicitud'],
            obj['enComite'],
            obj['avaladoComite'],
            obj['conceptoComite'],
            obj['numeroActa'],
            obj['fechaAval'],
            obj['asignaturasAprobadas'],
            obj['asignaturasHomologadas'],
            obj['asignaturasOtroPrograma'],
            obj['avalActPracticaDocente'],
            obj['reconocimientoCreditosPD']
        );
    }

    constructor(
        public idSolicitud: number,
        public enComite: boolean,
        public avaladoComite: string,
        public conceptoComite: string,
        public numeroActa: string,
        public fechaAval: string,
        public asignaturasAprobadas: AprobarAsignaturas[],
        public asignaturasHomologadas: AprobarHomologacion[],
        public asignaturasOtroPrograma: AprobarAsignaturasExt[],
        public avalActPracticaDocente: AprobarAvalComite[],
        public reconocimientoCreditosPD: AprobarAvalComite[]
    ) {}
}
