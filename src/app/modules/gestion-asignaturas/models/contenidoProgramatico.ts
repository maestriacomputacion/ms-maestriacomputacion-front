import { DocMaestria } from './docMaestria';
export interface ContenidoProgramatico {
    idOtroDoc?:number;
    nombreDocumento?:string;
    descripcionDocumento?:string;
    versionDoc?:number;
    idDocMaestria?: DocMaestria;
}
