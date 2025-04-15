import { DocMaestria } from './docMaestria';

export interface Oficio {
    idOficio?: number;
    numeroOficio?: number;
    fechaOficio?: Date;
    asuntoOfi?: string;
    idDocMaestria?: DocMaestria;
}
