import {
    AsignaturaExterna,
    DatosCursarAsignaturaDto,
} from '../../indiceModelos';

export class DatosSolicitudCursarAsignatura {
    static nuevoDatosSolicitudCursarAsignatura(obj: Object) {
        return new DatosSolicitudCursarAsignatura(
            obj['datosCursarAsignaturaDto']
        );
    }

    constructor(public datosCursarAsignaturaDto: DatosCursarAsignaturaDto) {}
}
