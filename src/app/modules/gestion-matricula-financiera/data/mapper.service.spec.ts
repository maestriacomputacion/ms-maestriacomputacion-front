import { GestionMatriculaFinancieraMapperService } from './mapper.service';
import { PeriodoAcademicoDTORespuesta } from '../dto/periodo-academico.dto';
import { EstudianteDTORespuesta } from '../dto/estudiante.dto';
import { DocenteDTORespuesta } from '../dto/docente.dto';
import { MateriaDTORespuesta } from '../dto/materia.dto';
import { BecasDTORespuesta } from '../dto/beca-financiera.dto';
import { PeriodoAcademico } from '../models/domain-models';

describe('GestionMatriculaFinancieraMapperService', () => {
  let service: GestionMatriculaFinancieraMapperService;

  beforeEach(() => {
    service = new GestionMatriculaFinancieraMapperService();
  });

  // ─── PeriodoAcademico ────────────────────────────────────────────────────────

  it('shouldMapPeriodoAcademicoCorrectlyWhenDtoHasAllFields', () => {
    // Arrange
    const dto: PeriodoAcademicoDTORespuesta = {
      id: 1,
      tagPeriodo: 2,
      anio: 2024,
      fechaInicio: '2024-01-15',
      fechaFin: '2024-06-30',
      fechaFinMatricula: '2024-02-15',
      descripcion: 'Primer semestre 2024',
      estado: 'ACTIVO'
    };

    // Act
    const result = service.mappearDeRespuestaAPeriodoAcademico(dto);

    // Assert
    expect(result.id).toBe(1);
    expect(result.tagPeriodo).toBe(2);
    expect(result.año).toBe(2024);
    expect(result.fechaInicio).toBe('2024-01-15');
    expect(result.fechaFin).toBe('2024-06-30');
    expect(result.fechaFinMatricula).toBe('2024-02-15');
    expect(result.descripcion).toBe('Primer semestre 2024');
    expect(result.estado).toBe('ACTIVO');
  });

  it('shouldMapPeriodoAcademicoWithYearFromFechaInicioWhenAnioIsNull', () => {
    // Arrange
    const dto: PeriodoAcademicoDTORespuesta = {
      id: 2,
      tagPeriodo: 1,
      anio: undefined,
      fechaInicio: '2023-07-10',
    };

    // Act
    const result = service.mappearDeRespuestaAPeriodoAcademico(dto);

    // Assert
    expect(result.año).toBe(2023);
  });

  it('shouldMapPeriodoAcademicoAPeticionCorrectlyWhenDomainIsValid', () => {
    // Arrange
    const domain: PeriodoAcademico = {
      tagPeriodo: 2,
      año: 2024,
      fechaInicio: '2024-01-15',
      fechaFin: '2024-06-30',
      fechaFinMatricula: '2024-02-15',
      descripcion: 'Primer semestre 2024',
      estado: 'ACTIVO'
    };

    // Act
    const result = service.mappearDePeriodoAcademicoAPeticion(domain);

    // Assert
    expect(result.tagPeriodo).toBe(2);
    expect(result.anio).toBe(2024);
    expect(result.fechaInicio).toBe('2024-01-15');
    expect(result.fechaFin).toBe('2024-06-30');
    expect(result.fechaFinMatricula).toBe('2024-02-15');
    expect(result.descripcion).toBe('Primer semestre 2024');
    expect(result.estado).toBe('ACTIVO');
  });

  // ─── Docente ─────────────────────────────────────────────────────────────────

  it('shouldMapDocenteCorrectlyWhenDtoHasAllFields', () => {
    // Arrange
    const dto: DocenteDTORespuesta = {
      nombre: 'Carlos',
      apellido: 'Pérez'
    };

    // Act
    const result = service.mappearDeRespuestaADocente(dto);

    // Assert
    expect(result.nombre).toBe('Carlos');
    expect(result.apellido).toBe('Pérez');
  });

  // ─── Materia ─────────────────────────────────────────────────────────────────

  it('shouldMapMateriaCorrectlyWhenDtoHasAllFields', () => {
    // Arrange
    const dto: MateriaDTORespuesta = {
      codigoOid: 'MAT001',
      materia: 'Algoritmos',
      grupoClase: 'G1',
      docente: { nombre: 'Ana', apellido: 'López' }
    };

    // Act
    const result = service.mappearDeRespuestaAMateria(dto);

    // Assert
    expect(result.codigo_oid).toBe('MAT001');
    expect(result.materia).toBe('Algoritmos');
    expect(result.grupoClase).toBe('G1');
    expect(result.objDocente.nombre).toBe('Ana');
    expect(result.objDocente.apellido).toBe('López');
  });

  // ─── BecaFinanciera ───────────────────────────────────────────────────────────

  it('shouldMapBecaFinancieraCorrectlyWhenDtoHasAllFields', () => {
    // Arrange
    const dto: BecasDTORespuesta = {
      resolucion: 'RES-001',
      porcentaje: 50,
      tipo: 'BECA_EXCELENCIA',
      estado: 'ACTIVO',
      avaladoConcejo: 'SI'
    };

    // Act
    const result = service.mappearDeRespuestaABecaFinanciera(dto);

    // Assert
    expect(result.resolucion).toBe('RES-001');
    expect(result.porcentaje).toBe(50);
    expect(result.tipo).toBe('BECA_EXCELENCIA');
    expect(result.estado).toBe('ACTIVO');
    expect(result.avaladoConcejo).toBe('SI');
  });

  it('shouldMapBecaFinancieraWithDefaultsWhenDtoHasNullFields', () => {
    // Arrange
    const dto: BecasDTORespuesta = {
      resolucion: 'RES-002',
      porcentaje: 0,
      tipo: '',
      estado: undefined,
      avaladoConcejo: undefined
    };

    // Act
    const result = service.mappearDeRespuestaABecaFinanciera(dto);

    // Assert
    expect(result.porcentaje).toBe(0);
    expect(result.tipo).toBe('');
    expect(result.estado).toBe('');
    expect(result.avaladoConcejo).toBeNull();
  });

  // ─── Estudiante ───────────────────────────────────────────────────────────────

  it('shouldMapEstudianteCorrectlyWhenDtoHasAllFields', () => {
    // Arrange
    const dto: EstudianteDTORespuesta = {
      codigo: 'EST001',
      nombre: 'Juan',
      apellido: 'García',
      identificacion: 12345678,
      cohorte: 2020,
      periodoIngreso: '2020-1',
      semestreFinanciero: 3,
      semestreAcademico: 3,
      valorEnSMLV: 2.5,
      esEgresadoUnicauca: false,
      aplicaVotacion: true,
      becas: [{ resolucion: 'R1', porcentaje: 25, tipo: 'BECA', estado: 'ACTIVO' }],
      descuentos: [],
      becasDescuentos: [],
      materias: [{ codigoOid: 'M1', materia: 'Redes', grupoClase: 'G1' }],
      estaPago: true
    };

    // Act
    const result = service.mappearDeRespuestaAEstudiante(dto);

    // Assert
    expect(result.codigo).toBe('EST001');
    expect(result.nombre).toBe('Juan');
    expect(result.apellido).toBe('García');
    expect(result.identificacion).toBe(12345678);
    expect(result.cohorte).toBe('2020');
    expect(result.periodoIngreso).toBe('2020-1');
    expect(result.semestreFinanciero).toBe(3);
    expect(result.valorEnSMLV).toBe(2.5);
    expect(result.esEgresadoUnicauca).toBeFalse();
    expect(result.aplicaVotacion).toBeTrue();
    expect(result.becas.length).toBe(1);
    expect(result.materias.length).toBe(1);
    expect(result.estaPago).toBeTrue();
  });

  it('shouldMapEstudianteWithEmptyArraysWhenDtoHasNullCollections', () => {
    // Arrange
    const dto: EstudianteDTORespuesta = {
      codigo: 'EST002',
      nombre: 'María',
      apellido: 'Torres',
      identificacion: 87654321,
      cohorte: 2021,
      periodoIngreso: '2021-2',
      semestreFinanciero: 1,
      becas: undefined,
      descuentos: undefined,
      becasDescuentos: [],
      materias: []
    };

    // Act
    const result = service.mappearDeRespuestaAEstudiante(dto);

    // Assert
    expect(result.becas).toEqual([]);
    expect(result.descuentos).toEqual([]);
    expect(result.becasDescuentos).toEqual([]);
    expect(result.materias).toEqual([]);
    expect(result.matriculasFinancieras).toEqual([]);
  });

  it('shouldMapListaEstudiantesCorrectlyWhenArrayHasMultipleItems', () => {
    // Arrange
    const dtos: EstudianteDTORespuesta[] = [
      {
        codigo: 'A1', nombre: 'Ana', apellido: 'Ruiz', identificacion: 111,
        cohorte: 2020, periodoIngreso: '2020-1', semestreFinanciero: 2,
        becasDescuentos: [], materias: []
      },
      {
        codigo: 'B2', nombre: 'Luis', apellido: 'Mora', identificacion: 222,
        cohorte: 2021, periodoIngreso: '2021-1', semestreFinanciero: 1,
        becasDescuentos: [], materias: []
      }
    ];

    // Act
    const result = service.mappearDeListaRespuestaAEstudiante(dtos);

    // Assert
    expect(result.length).toBe(2);
    expect(result[0].codigo).toBe('A1');
    expect(result[1].codigo).toBe('B2');
  });
});
