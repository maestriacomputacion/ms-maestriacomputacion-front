import { TipoSolicitud } from './tipoSolicitud';

export interface TiposSolicitudResponse {
    mensaje: string;
    codigo: string;
    respuesta: boolean;
    estado: number;
    tipoSolicitudDto: TipoSolicitud[];
}
