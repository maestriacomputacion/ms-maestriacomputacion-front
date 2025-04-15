import { FormHomologPost } from './formHomologPost';

export class DatosSolHomologPostSave {
    static nuevoDatosSolHomologPostSave(obj: Object) {
        return new DatosSolHomologPostSave(
            obj['datosHomologacionDto'],
            obj['documentosAdjuntos']
        );
    }

    constructor(
        public datosHomologacionDto: FormHomologPost,
        public documentosAdjuntos: string[]
    ) {}
}
