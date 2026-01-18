import { Estudiante } from '../../gestion-estudiantes/models/estudiante';

export interface EstudiantePorTutor {
    estudiante: Estudiante;
    totalMatriculasPendientes: number | null;
    totalMatriculas: number | null;
}
