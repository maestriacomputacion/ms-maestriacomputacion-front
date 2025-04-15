import { InfoPersonal } from './infoPersonal';

export interface InfoPersonalResponse {
    mensaje: string;
    codigo: string;
    respuesta: boolean;
    estado: number;
    informacionPersonalDto: InfoPersonal;
}
