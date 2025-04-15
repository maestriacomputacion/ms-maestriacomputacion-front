import { DocMaestria } from './docMaestria';
export interface Microcurriculo {
    idOtroDoc?:number;
    nombreDocumento?:string;
    descripcionDocumento?:string;
    versionDoc?:number|string;
    idDocMaestria?: DocMaestria;
}
