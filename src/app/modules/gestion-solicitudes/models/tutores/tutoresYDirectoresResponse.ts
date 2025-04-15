import { TutorYDirector } from './tutorYDirector';

export interface TutoresYDirectoresResponse {
    mensaje: string;
    codigo: string;
    respuesta: boolean;
    estado: number;
    tutores: TutorYDirector[];
}
