import { DocMaestria } from './docMaestria';

export interface Acta {
    id?: number;
    numeroActa?: string;
    fechaActa?: string;
    idDocMaestria?: DocMaestria;
    estado?:boolean;
}
