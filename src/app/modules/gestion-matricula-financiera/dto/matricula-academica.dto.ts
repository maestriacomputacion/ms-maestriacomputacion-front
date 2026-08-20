import { MateriaDTORespuesta } from "./materia.dto";
import { PeriodoAcademicoDTORespuesta } from "./periodo-academico.dto";

export interface MatriculaAcademicaDTORespuesta {
    semestre: number;
    materias: MateriaDTORespuesta[];
    objPeriodoAcademico: PeriodoAcademicoDTORespuesta;
}
