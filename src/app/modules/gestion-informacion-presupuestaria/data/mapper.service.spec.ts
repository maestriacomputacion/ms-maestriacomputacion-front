import { GestionInformacionPresupuestariaMapperService } from './mapper.service';
import { PeriodoAcademicoDto } from '../dto/periodo-financiero.dto';
import { ConfiguracionReporteFinancieroDTORespuesta } from '../dto/configuracion-reporte-financiero.dto';
import { ProyeccionEstudianteDTORespuesta, MateriaDto } from '../dto/proyeccion-estudiante.dto';
import { ReporteProyeccionEstudiantesDTORespuesta } from '../dto/reporte-proyeccion-estudiantes.dto';
import { ReporteEstudiantesDTORespuesta } from '../dto/reporte-estudiantes.dto';
import { GastoGeneralDTORespuesta } from '../dto/gasto-general.dto';
import { ConsultaReportePorGruposDTORespuesta, ReportePorGrupoDTORespuesta } from '../dto/reporte-por-grupos.dto';

describe('GestionInformacionPresupuestariaMapperService', () => {
  let service: GestionInformacionPresupuestariaMapperService;

  // ─── Mocks reutilizables ──────────────────────────────────────────────────────

  const mockPeriodoDto: PeriodoAcademicoDto = {
    id: 10, tagPeriodo: 2, anio: 2024,
    fechaInicio: '2024-01-15', fechaFin: '2024-06-30',
    estado: 'ACTIVO', activo: true
  };

  const mockConfiguracionDto: ConfiguracionReporteFinancieroDTORespuesta = {
    id: 5,
    biblioteca: 150000,
    recursosComputacionales: 200000,
    valorSMLV: 1300000,
    esReporteFinal: false,
    periodo: mockPeriodoDto,
    porcentajeVotacionFijo: 0.10,
    porcentajeEgresadoFijo: 0.05
  };

  const mockEstudianteDto: ProyeccionEstudianteDTORespuesta = {
    codigoEstudiante: 'EST001',
    identificacion: 12345678,
    nombre: 'Juan',
    apellido: 'García',
    estaPago: true,
    aplicaVotacion: false,
    porcentajeBeca: 0.25,
    aplicaEgresado: false,
    grupoInvestigacion: 'GI-01',
    valorEnSMLV: 2.5,
    materias: [{ codigo: 'M1', nombre: 'Redes', creditos: 3 }],
    estadoMatriculaFinanciera: true,
    valorMatricula: 3250000,
    valorDescuentoVoto: 0,
    valorDescuentoBeca: 812500,
    valorDescuentoEgresado: 0,
    totalDescuentos: 812500,
    valorNeto: 2437500,
    totalNetoConDerechos: 2787500
  };

  beforeEach(() => {
    service = new GestionInformacionPresupuestariaMapperService();
  });

  // ─── PeriodoFinanciero ────────────────────────────────────────────────────────

  it('shouldMapPeriodoFinancieroCorrectlyWhenDtoHasAllFields', () => {
    // Act
    const result = service.mappearDeRespuestaAPeriodoFinanciero(mockPeriodoDto);

    // Assert
    expect(result.periodo).toBe(2);
    expect(result.año).toBe(2024);
  });

  // ─── ConfiguracionReporteFinanciero ───────────────────────────────────────────

  it('shouldMapConfiguracionReporteFinancieroCorrectlyWhenDtoHasAllFields', () => {
    // Act
    const result = service.mappearDeRespuestaAConfiguracionReporteFinanciero(mockConfiguracionDto);

    // Assert
    expect(result.id).toBe(5);
    expect(result.biblioteca).toBe(150000);
    expect(result.recursosComputacionales).toBe(200000);
    expect(result.valorSMLV).toBe(1300000);
    expect(result.esReporteFinal).toBeFalse();
    expect(result.porcentajeVotacionFijo).toBe(0.10);
    expect(result.porcentajeEgresadoFijo).toBe(0.05);
    expect(result.objPeriodoFinanciero.periodo).toBe(2);
    expect(result.objPeriodoFinanciero.año).toBe(2024);
  });

  it('shouldMapConfiguracionWithDefaultPorcentajesWhenDtoHasNullValues', () => {
    // Arrange
    const dto: ConfiguracionReporteFinancieroDTORespuesta = {
      ...mockConfiguracionDto,
      porcentajeVotacionFijo: null as unknown as number,
      porcentajeEgresadoFijo: null as unknown as number
    };

    // Act
    const result = service.mappearDeRespuestaAConfiguracionReporteFinanciero(dto);

    // Assert — defaults del mapper
    expect(result.porcentajeVotacionFijo).toBe(0.10);
    expect(result.porcentajeEgresadoFijo).toBe(0.05);
  });

  // ─── ProyeccionEstudiante ─────────────────────────────────────────────────────

  it('shouldMapProyeccionEstudianteCorrectlyWhenDtoHasAllFields', () => {
    // Act
    const result = service.mappearDeRespuestaAProyeccionEstudiante(mockEstudianteDto);

    // Assert
    expect(result.codigoEstudiante).toBe('EST001');
    expect(result.nombre).toBe('Juan');
    expect(result.apellido).toBe('García');
    expect(result.identificacion).toBe(12345678);
    expect(result.estaPago).toBeTrue();
    expect(result.aplicaVotacion).toBeFalse();
    expect(result.porcentajeBeca).toBe(0.25);
    expect(result.grupoInvestigacion).toBe('GI-01');
    expect(result.valorMatricula).toBe(3250000);
    expect(result.valorDescuentoBeca).toBe(812500);
    expect(result.totalNetoConDerechos).toBe(2787500);
    expect(result.materias!.length).toBe(1);
    expect(result.materias![0].codigo).toBe('M1');
  });

  it('shouldMapProyeccionEstudianteWithDefaultsWhenDtoHasNullFields', () => {
    // Arrange
    const dto: ProyeccionEstudianteDTORespuesta = {
      codigoEstudiante: 'EST002',
      identificacion: 0,
      nombre: null as unknown as string,
      apellido: null as unknown as string,
      estaPago: null as unknown as boolean,
      aplicaVotacion: null as unknown as boolean,
      porcentajeBeca: 0,
      aplicaEgresado: null as unknown as boolean,
      grupoInvestigacion: null as unknown as string,
      valorEnSMLV: 0,
      materias: null as unknown as MateriaDto[]
    };

    // Act
    const result = service.mappearDeRespuestaAProyeccionEstudiante(dto);

    // Assert — defaults del mapper
    expect(result.nombre).toBe('');
    expect(result.apellido).toBe('');
    expect(result.estaPago).toBeFalse();
    expect(result.aplicaVotacion).toBeFalse();
    expect(result.aplicaEgresado).toBeFalse();
    expect(result.grupoInvestigacion).toBe('');
    expect(result.materias).toEqual([]);
  });

  // ─── ReporteProyeccionEstudiantes ─────────────────────────────────────────────

  it('shouldMapReporteProyeccionEstudiantesCorrectlyWhenDtoHasAllFields', () => {
    // Arrange
    const dto: ReporteProyeccionEstudiantesDTORespuesta = {
      periodo: mockPeriodoDto,
      configuracion: mockConfiguracionDto,
      estudiantes: [mockEstudianteDto],
      totalNeto: 2787500,
      totalDescuentos: 812500,
      totalIngresos: 2437500
    };

    // Act
    const result = service.mappearDeRespuestaAReporteProyeccionEstudiantes(dto);

    // Assert
    expect(result.estudiantes.length).toBe(1);
    expect(result.estudiantes[0].codigoEstudiante).toBe('EST001');
    expect(result.objConfiguracion.id).toBe(5);
    expect(result.periodo.periodo).toBe(2);
    expect(result.totalNeto).toBe(2787500);
    expect(result.totalDescuentos).toBe(812500);
    expect(result.totalIngresos).toBe(2437500);
  });

  // ─── ReporteEstudiantes ───────────────────────────────────────────────────────

  it('shouldMapReporteEstudiantesCorrectlyWhenDtoHasAllFields', () => {
    // Arrange
    const dto: ReporteEstudiantesDTORespuesta = {
      periodo: mockPeriodoDto,
      configuracion: mockConfiguracionDto,
      estudiantes: [mockEstudianteDto],
      totalNeto: 2787500,
      totalDescuentos: 812500,
      totalIngresos: 2437500
    };

    // Act
    const result = service.mappearDeRespuestaAReporteEstudiantes(dto);

    // Assert
    expect(result.estudiantes.length).toBe(1);
    expect(result.objConfiguracion.biblioteca).toBe(150000);
    expect(result.totalNeto).toBe(2787500);
  });

  // ─── GastoGeneral ─────────────────────────────────────────────────────────────

  it('shouldMapGastoGeneralCorrectlyWhenDtoHasAllFields', () => {
    // Arrange
    const dto: GastoGeneralDTORespuesta = {
      id: 7,
      categoria: 'ADMINISTRATIVO',
      descripcion: 'Papelería',
      monto: 500000
    };

    // Act
    const result = service.mappearDeRespuestaAGastoGeneral(dto);

    // Assert
    expect(result.idGastoGeneral).toBe(7);
    expect(result.categoria).toBe('ADMINISTRATIVO');
    expect(result.descripcion).toBe('Papelería');
    expect(result.monto).toBe(500000);
  });

  // ─── ReportePorGrupoFila ──────────────────────────────────────────────────────

  it('shouldMapReportePorGrupoFilaCorrectlyWhenDtoHasAllFields', () => {
    // Arrange
    const dto: ReportePorGrupoDTORespuesta = {
      grupoId: 1,
      nombreGrupo: 'Grupo A',
      porcentajeParticipacion: 0.40,
      porcentajePrimerSemestre: 0.40,
      porcentajeSegundoSemestre: 0.40,
      vigenciasAnteriores: 100000,
      presupuestoPorGrupo: 4000000,
      presupuestoPorGrupoItem1: 2000000,
      presupuestoPorGrupoItem2: 1500000,
      imprevistosValor: 200000,
      totalNetoPeriodo: 3800000,
      totalNeto: 3800000,
      aportePrimerSemestre: 2000000,
      aporteSegundoSemestre: 2000000
    };

    // Act
    const result = service.mappearDeRespuestaAReportePorGrupoFila(dto);

    // Assert
    expect(result.grupoId).toBe(1);
    expect(result.nombreGrupo).toBe('Grupo A');
    expect(result.porcentajeParticipacion).toBe(0.40);
    expect(result.vigenciasAnteriores).toBe(100000);
    expect(result.presupuestoPorGrupo).toBe(4000000);
    expect(result.aportePrimerSemestre).toBe(2000000);
    expect(result.presupuestoPorGrupoItem1).toBe(2000000);
    expect(result.presupuestoPorGrupoItem2).toBe(1500000);
    expect(result.imprevistos).toBe(200000);
  });

  // ─── ReportePorGrupos ─────────────────────────────────────────────────────────

  it('shouldMapReportePorGruposCorrectlyWhenDtoHasAllFields', () => {
    // Arrange
    const grupoDto: ReportePorGrupoDTORespuesta = {
      grupoId: 1, nombreGrupo: 'Grupo A',
      porcentajeParticipacion: 0.40,
      porcentajePrimerSemestre: 0.40,
      porcentajeSegundoSemestre: 0.40,
      vigenciasAnteriores: 100000,
      presupuestoPorGrupo: 4000000,
      presupuestoPorGrupoItem1: 2000000,
      presupuestoPorGrupoItem2: 1500000,
      imprevistosValor: 200000,
      totalNeto: 3800000,
      aportePrimerSemestre: 2000000,
      aporteSegundoSemestre: 2000000
    };
    const gastoDto: GastoGeneralDTORespuesta = {
      id: 1, categoria: 'ADMIN', descripcion: 'Papelería', monto: 300000
    };
    const dto: ConsultaReportePorGruposDTORespuesta = {
      periodo: mockPeriodoDto,
      anio: 2024,
      esEditable: true,
      ingresoPeriodo1: 5000000,
      ingresoPeriodo2: 5000000,
      auiPorcentaje: 0.10,
      auiValor: 1000000,
      excedentesMaestria: 500000,
      item1: 0.30,
      item2: 0.20,
      imprevistos: 0.05,
      totalIngresos: 10000000,
      valorADistribuir: 8000000,
      transferenciaUnicauca: 200000,
      reportesPorGrupo: [grupoDto],
      gastosGenerales: [gastoDto],
      idConfiguracionReporteGrupos: 3
    };

    // Act
    const result = service.mappearDeRespuestaAReportePorGrupos(dto);

    // Assert
    expect(result.filasPorGrupo.length).toBe(1);
    expect(result.filasPorGrupo[0].nombreGrupo).toBe('Grupo A');
    expect(result.gastosGenerales.length).toBe(1);
    expect(result.gastosGenerales[0].idGastoGeneral).toBe(1);
    expect(result.objConfiguracionReporteGrupos.aUIPorcentaje).toBe(0.10);
    expect(result.objConfiguracionReporteGrupos.excedentesMaestria).toBe(500000);
    expect(result.anio).toBe(2024);
    expect(result.esEditable).toBeTrue();
    expect(result.totalNeto).toBe(8000000);
  });

  it('shouldMapReportePorGruposWithEmptyArraysWhenDtoHasNullCollections', () => {
    // Arrange
    const dto: ConsultaReportePorGruposDTORespuesta = {
      periodo: mockPeriodoDto,
      auiPorcentaje: 0,
      auiValor: 0,
      excedentesMaestria: 0,
      item1: 0,
      item2: 0,
      imprevistos: 0,
      totalIngresos: 0,
      valorADistribuir: 0,
      reportesPorGrupo: null as unknown as ReportePorGrupoDTORespuesta[],
      gastosGenerales: null as unknown as GastoGeneralDTORespuesta[],
      idConfiguracionReporteGrupos: 0
    };

    // Act
    const result = service.mappearDeRespuestaAReportePorGrupos(dto);

    // Assert
    expect(result.filasPorGrupo).toEqual([]);
    expect(result.gastosGenerales).toEqual([]);
  });
});
