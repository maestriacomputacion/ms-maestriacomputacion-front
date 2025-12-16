import { Persona } from '../../gestion-estudiantes/models/persona';

export interface TutorInfo {
    id: number;
    persona: Persona;
    lineaInvestigacion: string;
}
