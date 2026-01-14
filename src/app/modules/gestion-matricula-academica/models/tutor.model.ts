import { Persona } from '../../gestion-estudiantes/models/persona';

// Tutor con persona y linea de investigacion.
export interface TutorInfo {
    id: number;
    persona: Persona;
    lineaInvestigacion: string;
}
