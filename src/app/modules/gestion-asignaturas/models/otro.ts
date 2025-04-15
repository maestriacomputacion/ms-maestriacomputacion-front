import { DocMaestria } from "./docMaestria";

export interface Otro{
    id?:number;
    nombreDocumento?: string;
    versionDoc?:string;
    descripcionDocumento?: string;
    idDocMaestria?:DocMaestria;
}
