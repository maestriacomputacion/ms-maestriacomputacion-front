import { Injectable } from '@angular/core';
import {
    Estudiante,
    MatriculaFinanciera,
    Materia,
    Docente,
    BecaFinanciera,
    DescuentoFinanciero,
    PeriodoAcademico
} from '../models/domain-models';
import { EstudianteDTORespuesta } from '../dto/estudiante.dto';
import { MatriculaFinancieraDTORespuesta } from '../dto/matricula-financiera.dto';
import { MateriaDTORespuesta } from '../dto/materia.dto';
import { DocenteDTORespuesta } from '../dto/docente.dto';
import { BecasDTORespuesta } from '../dto/beca-financiera.dto';
import { PeriodoAcademicoDTORespuesta, PeriodoAcademicoDTOPeticion } from '../dto/periodo-academico.dto';

@Injectable()
export class GestionMatriculaFinancieraMapperService {

    constructor() { }

    mappearDeRespuestaAPeriodoAcademico(dto: PeriodoAcademicoDTORespuesta): PeriodoAcademico {
        const año = dto.anio ?? (dto.fechaInicio ? new Date(dto.fechaInicio).getFullYear() : undefined);
        return {
            id: dto.id,
            tagPeriodo: dto.tagPeriodo,
            periodo: dto.tagPeriodo,
            año: año,
            fechaInicio: dto.fechaInicio,
            fechaFin: dto.fechaFin,
            fechaFinMatricula: dto.fechaFinMatricula,
            descripcion: dto.descripcion,
            estado: dto.estado
        };
    }

    mappearDePeriodoAcademicoAPeticion(domain: PeriodoAcademico): PeriodoAcademicoDTOPeticion {
        return {
            tagPeriodo: domain.tagPeriodo,
            anio: domain.año,
            fechaInicio: domain.fechaInicio,
            fechaFin: domain.fechaFin,
            fechaFinMatricula: domain.fechaFinMatricula,
            descripcion: domain.descripcion,
            estado: domain.estado
        };
    }

    mappearDeRespuestaADocente(dto: DocenteDTORespuesta): Docente {
        return {
            nombre: dto.nombre,
            apellido: dto.apellido
        };
    }

    mappearDeRespuestaAMateria(dto: MateriaDTORespuesta): Materia {
        return {
            codigo_oid: dto.codigoOid,
            materia: dto.materia,
            objDocente: dto.docente ? this.mappearDeRespuestaADocente(dto.docente) : { nombre: '', apellido: '' },
            grupoClase: dto.grupoClase
        };
    }

    mappearDeRespuestaAMatriculaFinanciera(dto: MatriculaFinancieraDTORespuesta): MatriculaFinanciera {
        return {
            valorEnSMLV: dto.valorEnSMLV ?? null,
            objPeriodoAcademico: this.mappearDeRespuestaAPeriodoAcademico(dto.objPeriodoAcademico)
        };
    }

    mappearDeRespuestaABecaFinanciera(dto: BecasDTORespuesta): BecaFinanciera {
        return {
            resolucion: dto.resolucion,
            porcentaje: dto.porcentaje || 0,
            tipo: dto.tipo || '',
            estado: dto.estado || '',
            avaladoConcejo: dto.avaladoConcejo || null
        };
    }

    mappearDeRespuestaADescuentoFinanciero(dto: BecasDTORespuesta): DescuentoFinanciero {
        return {
            resolucion: dto.resolucion || '-',
            porcentaje: dto.porcentaje || 0,
            tipo: dto.tipo || '',
            estado: dto.estado || '',
            avaladoConcejo: dto.avaladoConcejo || null
        };
    }

    mappearDeRespuestaAEstudiante(dto: EstudianteDTORespuesta): Estudiante {
        return {
            codigo: dto.codigo,
            nombre: dto.nombre,
            apellido: dto.apellido,
            identificacion: dto.identificacion,
            cohorte: dto.cohorte?.toString(),
            periodoIngreso: dto.periodoIngreso,
            semestreFinanciero: dto.semestreFinanciero || 0,
            semestreAcademico: dto.semestreAcademico,
            valorEnSMLV: dto.valorEnSMLV ?? null,
            esEgresadoUnicauca: dto.esEgresadoUnicauca ?? false,
            aplicaVotacion: dto.aplicaVotacion ?? false,
            grupoNombre: dto.grupoNombre,
            matriculasFinancieras: [],
            descuentos: (dto.descuentos ?? []).map(b => this.mappearDeRespuestaABecaFinanciera(b)),
            becas: (dto.becas ?? []).map(b => this.mappearDeRespuestaABecaFinanciera(b)),
            becasDescuentos: (dto.becasDescuentos ?? []).map(b => this.mappearDeRespuestaABecaFinanciera(b)),
            materias: (dto.materias ?? []).map(m => this.mappearDeRespuestaAMateria(m)),
            estaPago: dto.estaPago
        };
    }

    mappearDeListaRespuestaAEstudiante(dtos: EstudianteDTORespuesta[]): Estudiante[] {
        return dtos.map(dto => this.mappearDeRespuestaAEstudiante(dto));
    }

    mappearDeListaRespuestaAPeriodoAcademico(dtos: PeriodoAcademicoDTORespuesta[]): PeriodoAcademico[] {
        return dtos.map(dto => this.mappearDeRespuestaAPeriodoAcademico(dto));
    }
}
