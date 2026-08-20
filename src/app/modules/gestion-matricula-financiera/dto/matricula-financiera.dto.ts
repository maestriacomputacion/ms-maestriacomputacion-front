import { PeriodoAcademicoDTORespuesta } from "./periodo-academico.dto";

export interface MatriculaFinancieraDTORespuesta {
    valorEnSMLV: number | null;
    objPeriodoAcademico: PeriodoAcademicoDTORespuesta;
}
