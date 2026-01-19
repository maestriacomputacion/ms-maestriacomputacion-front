import { Estudiante } from '../../gestion-estudiantes/models/estudiante';

export interface EstudiantePorTutor {
    estudiante: Estudiante;
    totalMatriculasPendientesTutor: number | null;
    totalMatriculasPendienteCordinador: number | null;
    totalMatriculas: number | null;
}
