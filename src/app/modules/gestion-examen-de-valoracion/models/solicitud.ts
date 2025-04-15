import { Docente } from '../../gestion-docentes/models/docente';
import { Experto } from './experto';

export interface Solicitud {
    id?: number;
    titulo?: string;
    linkFormatoA?: string;
    linkFormatoD?: string;
    linkFormatoE?: string;
    linkAnexos?: string;
    evaluadorExterno?: Experto;
    evaluadorInterno?: Docente;
    actaAprobacionExamen?: string;
    fechaActa?: string;
    linkOficioDirigidoEvaluadores?: string;
    fechaMaximaEvaluacion?: string;
    linkOficioConsejo?: string;
}
