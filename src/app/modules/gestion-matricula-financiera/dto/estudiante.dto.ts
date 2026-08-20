import { DescuentosDTORespuesta } from "./descuento-financiero.dto";
import { BecasDTORespuesta } from "./beca-financiera.dto";
import { MateriaDTORespuesta } from "./materia.dto";

export interface EstudianteDTORespuesta {
    codigo: string;
    nombre: string;
    apellido: string;
    identificacion: number;
    cohorte: number;
    periodoIngreso: string;
    semestreFinanciero: number;
    semestreAcademico?: number;
    valorEnSMLV?: number | null;
    esEgresadoUnicauca?: boolean;
    aplicaVotacion?: boolean;
    grupoNombre?: string;
    becas?: BecasDTORespuesta[];
    descuentos?: BecasDTORespuesta[];
    becasDescuentos: BecasDTORespuesta[];
    materias: MateriaDTORespuesta[];
    estaPago?: boolean;
}
