import { AsignaturaExterna } from '../../indiceModelos';

export class DatosCursarAsignaturaDto {
    static nuevoDatosCursarAsignaturaDto(obj: Object) {
        return new DatosCursarAsignaturaDto(
            obj['motivo'],
            obj['listaAsignaturasCursar']
        );
    }

    constructor(
        public motivo: string,
        public listaAsignaturasCursar: AsignaturaExterna[]
    ) {}
}
