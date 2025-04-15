import { RequisitosSolicitud } from './requisitosSolicitud';

export interface RequisitosSolicitudResponse {
    mensaje: string;
    codigo: string;
    respuesta: boolean;
    estado: number;
    doRequeridoSolicitudDto: RequisitosSolicitud;
}
