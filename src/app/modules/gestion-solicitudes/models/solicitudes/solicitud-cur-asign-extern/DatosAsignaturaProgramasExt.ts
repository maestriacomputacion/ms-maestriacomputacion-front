import { AsignaturaExternaResp } from '../../indiceModelos';

export class DatosAsignaturaProgramasExt {
    static nuevoDatosAsignaturaProgramasExt(obj: Object) {
        return new DatosAsignaturaProgramasExt(
            obj['datosAsignaturaOtroProgramas'],
            obj['motivo'],
            obj['documentosAdjuntos']
        );
    }

    constructor(
        public datosAsignaturaOtroProgramas: AsignaturaExternaResp[],
        public motivo: string,
        public documentosAdjuntos: string[]
    ) {}
}
