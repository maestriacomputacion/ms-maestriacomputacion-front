import { of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import { GestionInformacionPresupuestariaFacadeService } from './facade.service';
import { GestionInformacionPresupuestariaApiService } from './api.service';
import { GestionInformacionPresupuestariaMapperService } from './mapper.service';
import { ReporteProyeccionEstudiantes, ReportePorGrupos } from '../models/domain-models';
import { PeriodoAcademicoDto } from '../dto/periodo-financiero.dto';
import { ReporteProyeccionEstudiantesDTORespuesta } from '../dto/reporte-proyeccion-estudiantes.dto';
import { ReporteEstudiantesDTORespuesta } from '../dto/reporte-estudiantes.dto';
import { ConsultaReportePorGruposDTORespuesta } from '../dto/reporte-por-grupos.dto';
import { ProyeccionEstudianteDTOPeticion } from '../dto/proyeccion-estudiante.dto';

describe('GestionInformacionPresupuestariaFacadeService', () => {
  let service: GestionInformacionPresupuestariaFacadeService;
  let apiSpy: jasmine.SpyObj<GestionInformacionPresupuestariaApiService>;
  let mapperSpy: jasmine.SpyObj<GestionInformacionPresupuestariaMapperService>;

  // ─── Mocks reutilizables ──────────────────────────────────────────────────────

  const mockPeriodoDto: PeriodoAcademicoDto = {
    id: 10, tagPeriodo: 2, anio: 2024,
    fechaInicio: '2024-01-15', fechaFin: '2024-06-30',
    estado: 'ACTIVO', activo: true
  };

  const mockReporteProyeccionDTO: ReporteProyeccionEstudiantesDTORespuesta = {
    periodo: mockPeriodoDto,
    configuracion: {
      id: 5, biblioteca: 150000, recursosComputacionales: 200000,
      valorSMLV: 1300000, esReporteFinal: false, periodo: mockPeriodoDto,
      porcentajeVotacionFijo: 0.10, porcentajeEgresadoFijo: 0.05
    },
    estudiantes: [],
    totalNeto: 5000000,
    totalDescuentos: 500000,
    totalIngresos: 4500000
  };

  const mockReporteProyeccion: ReporteProyeccionEstudiantes = {
    estudiantes: [],
    objConfiguracion: {
      id: 5, esReporteFinal: false, biblioteca: 150000,
      recursosComputacionales: 200000, valorSMLV: 1300000,
      porcentajeVotacionFijo: 0.10, porcentajeEgresadoFijo: 0.05,
      objPeriodoFinanciero: { periodo: 2, año: 2024 }
    },
    periodo: { periodo: 2, año: 2024 },
    totalNeto: 5000000,
    totalDescuentos: 500000,
    totalIngresos: 4500000
  };

  const mockReporteEstudiantesDTO: ReporteEstudiantesDTORespuesta = {
    periodo: mockPeriodoDto,
    configuracion: {
      id: 5, biblioteca: 150000, recursosComputacionales: 200000,
      valorSMLV: 1300000, esReporteFinal: true, periodo: mockPeriodoDto,
      porcentajeVotacionFijo: 0.10, porcentajeEgresadoFijo: 0.05
    },
    estudiantes: [],
    totalNeto: 5000000,
    totalDescuentos: 500000,
    totalIngresos: 4500000
  };

  const mockReporteGruposDTO: ConsultaReportePorGruposDTORespuesta = {
    periodo: mockPeriodoDto, anio: 2024, esEditable: true,
    auiPorcentaje: 0.10, auiValor: 1000000, excedentesMaestria: 500000,
    item1: 0.30, item2: 0.20, imprevistos: 0.05,
    totalIngresos: 10000000, valorADistribuir: 8000000,
    reportesPorGrupo: [], gastosGenerales: [],
    idConfiguracionReporteGrupos: 3
  };

  const mockReporteGrupos: ReportePorGrupos = {
    gastosGenerales: [],
    filasPorGrupo: [],
    totalNeto: 8000000,
    totalIngresos: 10000000,
    aportePrimerSemestre: 0,
    aporteSegundoSemestre: 0,
    porcentajePrimerSemestre: 50,
    porcentajeSegundoSemestre: 50,
    participacionPrimerSemestre: 100,
    participacionSegundoSemestre: 100,
    participacionPorAnio: 100,
    presupuestoPorGrupoItem1: 0,
    presupuestoPorGrupoItem2: 0,
    presupuestoPorGrupo: 0,
    imprevistos: 0,
    presupuestoPorGrupoImprevistos: 0,
    vigenciasAnteriores: 0,
    objConfiguracionReporteGrupos: {
      aUIPorcentaje: 0.10, aUIValor: 1000000, excedentesMaestria: 500000,
      ingresosNetos: 10000000, valorADistribuir: 8000000,
      item1: 0.30, item2: 0.20, imprevistos: 0.05,
      totalGastosGenerales: 0,
      gastosGenerales: [],
      objPeriodoFinanciero: { periodo: 2, año: 2024 }
    }
  };

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj<GestionInformacionPresupuestariaApiService>(
      'GestionInformacionPresupuestariaApiService',
      [
        'obtenerPeriodos', 'obtenerPeriodosActivos', 'obtenerPeriodosInactivos',
        'obtenerPeriodosActivosYCerrados', 'obtenerPeriodoProyeccion',
        'obtenerProyeccionEstudiantes', 'actualizarProyeccionEstudiante',
        'obtenerReporteFinanciero', 'obtenerIdConfiguracionReporteFinanciero',
        'actualizarConfiguracionReporteFinanciero', 'obtenerReportePorGrupos',
        'actualizarParticipacionGrupo'
      ]
    );
    mapperSpy = jasmine.createSpyObj<GestionInformacionPresupuestariaMapperService>(
      'GestionInformacionPresupuestariaMapperService',
      [
        'mappearDeRespuestaAReporteProyeccionEstudiantes',
        'mappearDeRespuestaAReporteEstudiantes',
        'mappearDeRespuestaAConfiguracionReporteFinanciero',
        'mappearDeRespuestaAReportePorGrupos'
      ]
    );
    service = new GestionInformacionPresupuestariaFacadeService(apiSpy, mapperSpy);
  });

  // ─── Estado inicial ───────────────────────────────────────────────────────────

  it('shouldHaveFalseLoadingAsInitialState', (done) => {
    service.loading$.pipe(take(1)).subscribe(loading => {
      expect(loading).toBeFalse();
      done();
    });
  });

  it('shouldHaveNullErrorAsInitialState', (done) => {
    service.error$.pipe(take(1)).subscribe(error => {
      expect(error).toBeNull();
      done();
    });
  });

  it('shouldHaveNullReporteProyeccionAsInitialState', (done) => {
    service.reporteProyeccionEstudiantes$.pipe(take(1)).subscribe(reporte => {
      expect(reporte).toBeNull();
      done();
    });
  });

  // ─── obtenerPeriodosFinancieros ───────────────────────────────────────────────

  it('shouldEmitLoadingSequenceWhenObtenerPeriodosFinancierosSucceeds', (done) => {
    // Arrange
    apiSpy.obtenerPeriodos.and.returnValue(of([mockPeriodoDto]));
    const loadingValues: boolean[] = [];
    service.loading$.subscribe(v => loadingValues.push(v));

    // Act
    service.obtenerPeriodosFinancieros().subscribe({
      complete: () => {
        setTimeout(() => {
          expect(loadingValues).toContain(true);
          expect(loadingValues[loadingValues.length - 1]).toBeFalse();
          done();
        });
      }
    });
  });

  it('shouldSetErrorWhenObtenerPeriodosFinancierosFails', (done) => {
    // Arrange
    apiSpy.obtenerPeriodos.and.returnValue(throwError(() => new Error('fail')));

    // Act
    service.obtenerPeriodosFinancieros().subscribe({
      error: () => {
        service.error$.pipe(take(1)).subscribe(err => {
          expect(err).toBeTruthy();
          done();
        });
      }
    });
  });

  // ─── obtenerProyeccionEstudiantes ─────────────────────────────────────────────

  it('shouldEmitLoadingWhenObtenerProyeccionEstudiantesSucceeds', (done) => {
    // Arrange
    apiSpy.obtenerProyeccionEstudiantes.and.returnValue(of(mockReporteProyeccionDTO));
    mapperSpy.mappearDeRespuestaAReporteProyeccionEstudiantes.and.returnValue(mockReporteProyeccion);
    const loadingValues: boolean[] = [];
    service.loading$.subscribe(v => loadingValues.push(v));

    // Act
    service.obtenerProyeccionEstudiantes(2, 2024).subscribe({
      complete: () => {
        setTimeout(() => {
          expect(loadingValues).toContain(true);
          expect(loadingValues[loadingValues.length - 1]).toBeFalse();
          done();
        });
      }
    });
  });

  it('shouldUpdateReporteProyeccionStateWhenObtenerProyeccionSucceeds', (done) => {
    // Arrange
    apiSpy.obtenerProyeccionEstudiantes.and.returnValue(of(mockReporteProyeccionDTO));
    mapperSpy.mappearDeRespuestaAReporteProyeccionEstudiantes.and.returnValue(mockReporteProyeccion);

    // Act
    service.obtenerProyeccionEstudiantes(2, 2024).subscribe({
      next: () => {
        service.reporteProyeccionEstudiantes$.pipe(take(1)).subscribe(reporte => {
          expect(reporte).not.toBeNull();
          expect(reporte!.totalNeto).toBe(5000000);
          done();
        });
      }
    });
  });

  it('shouldSetErrorWhenObtenerProyeccionFails', (done) => {
    // Arrange
    apiSpy.obtenerProyeccionEstudiantes.and.returnValue(throwError(() => new Error('fail')));

    // Act
    service.obtenerProyeccionEstudiantes(2, 2024).subscribe({
      error: () => {
        service.error$.pipe(take(1)).subscribe(err => {
          expect(err).toBeTruthy();
          done();
        });
      }
    });
  });

  // ─── actualizarProyeccionEstudiante ───────────────────────────────────────────

  it('shouldEmitLoadingWhenActualizarProyeccionEstudianteSucceeds', (done) => {
    // Arrange
    const peticion: ProyeccionEstudianteDTOPeticion = {
      codigoEstudiante: 'EST001', estaPago: true,
      aplicaVotacion: false, porcentajeBeca: 0.25, aplicaEgresado: false
    };
    apiSpy.actualizarProyeccionEstudiante.and.returnValue(of(mockReporteEstudiantesDTO));
    mapperSpy.mappearDeRespuestaAReporteProyeccionEstudiantes.and.returnValue(mockReporteProyeccion);
    const loadingValues: boolean[] = [];
    service.loading$.subscribe(v => loadingValues.push(v));

    // Act
    service.actualizarProyeccionEstudiante(peticion, 2, 2024).subscribe({
      complete: () => {
        setTimeout(() => {
          expect(loadingValues).toContain(true);
          expect(loadingValues[loadingValues.length - 1]).toBeFalse();
          done();
        });
      }
    });
  });

  it('shouldUpdateReporteProyeccionStateWhenActualizarProyeccionSucceeds', (done) => {
    // Arrange
    const peticion: ProyeccionEstudianteDTOPeticion = {
      codigoEstudiante: 'EST001', estaPago: true,
      aplicaVotacion: false, porcentajeBeca: 0.25, aplicaEgresado: false
    };
    apiSpy.actualizarProyeccionEstudiante.and.returnValue(of(mockReporteEstudiantesDTO));
    mapperSpy.mappearDeRespuestaAReporteProyeccionEstudiantes.and.returnValue(mockReporteProyeccion);

    // Act
    service.actualizarProyeccionEstudiante(peticion, 2, 2024).subscribe({
      next: () => {
        service.reporteProyeccionEstudiantes$.pipe(take(1)).subscribe(reporte => {
          expect(reporte).not.toBeNull();
          done();
        });
      }
    });
  });

  // ─── obtenerReporteFinanciero ─────────────────────────────────────────────────

  it('shouldEmitLoadingWhenObtenerReporteFinancieroSucceeds', (done) => {
    // Arrange
    apiSpy.obtenerReporteFinanciero.and.returnValue(of(mockReporteEstudiantesDTO));
    mapperSpy.mappearDeRespuestaAReporteEstudiantes.and.returnValue({
      estudiantes: [], objConfiguracion: mockReporteProyeccion.objConfiguracion,
      periodo: { periodo: 2, año: 2024 }
    });
    mapperSpy.mappearDeRespuestaAConfiguracionReporteFinanciero.and.returnValue(
      mockReporteProyeccion.objConfiguracion
    );
    const loadingValues: boolean[] = [];
    service.loading$.subscribe(v => loadingValues.push(v));

    // Act
    service.obtenerReporteFinanciero(2, 2024).subscribe({
      complete: () => {
        setTimeout(() => {
          expect(loadingValues).toContain(true);
          expect(loadingValues[loadingValues.length - 1]).toBeFalse();
          done();
        });
      }
    });
  });

  it('shouldSetErrorWhenObtenerReporteFinancieroFails', (done) => {
    // Arrange
    apiSpy.obtenerReporteFinanciero.and.returnValue(throwError(() => new Error('fail')));

    // Act
    service.obtenerReporteFinanciero(2, 2024).subscribe({
      error: () => {
        service.error$.pipe(take(1)).subscribe(err => {
          expect(err).toBeTruthy();
          done();
        });
      }
    });
  });

  // ─── obtenerReporteGrupos ─────────────────────────────────────────────────────

  it('shouldEmitLoadingWhenObtenerReporteGruposSucceeds', (done) => {
    // Arrange
    apiSpy.obtenerReportePorGrupos.and.returnValue(of(mockReporteGruposDTO));
    mapperSpy.mappearDeRespuestaAReportePorGrupos.and.returnValue(mockReporteGrupos);
    const loadingValues: boolean[] = [];
    service.loading$.subscribe(v => loadingValues.push(v));

    // Act
    service.obtenerReporteGrupos(2024).subscribe({
      complete: () => {
        setTimeout(() => {
          expect(loadingValues).toContain(true);
          expect(loadingValues[loadingValues.length - 1]).toBeFalse();
          done();
        });
      }
    });
  });

  it('shouldUpdateReporteGruposStateWhenObtenerReporteGruposSucceeds', (done) => {
    // Arrange
    apiSpy.obtenerReportePorGrupos.and.returnValue(of(mockReporteGruposDTO));
    mapperSpy.mappearDeRespuestaAReportePorGrupos.and.returnValue(mockReporteGrupos);

    // Act
    service.obtenerReporteGrupos(2024).subscribe({
      next: () => {
        service.reporteGrupos$.pipe(take(1)).subscribe(reporte => {
          expect(reporte).not.toBeNull();
          expect(reporte!.totalNeto).toBe(8000000);
          done();
        });
      }
    });
  });

  it('shouldSetErrorWhenObtenerReporteGruposFails', (done) => {
    // Arrange
    apiSpy.obtenerReportePorGrupos.and.returnValue(throwError(() => new Error('fail')));

    // Act
    service.obtenerReporteGrupos(2024).subscribe({
      error: () => {
        service.error$.pipe(take(1)).subscribe(err => {
          expect(err).toBeTruthy();
          done();
        });
      }
    });
  });

  // ─── Limpieza de error ────────────────────────────────────────────────────────

  it('shouldClearErrorAtStartOfEachOperation', (done) => {
    // Arrange — forzar error previo
    apiSpy.obtenerProyeccionEstudiantes.and.returnValue(throwError(() => new Error('prev error')));

    service.obtenerProyeccionEstudiantes(2, 2024).subscribe({
      error: () => {
        // Ahora configurar éxito
        apiSpy.obtenerProyeccionEstudiantes.and.returnValue(of(mockReporteProyeccionDTO));
        mapperSpy.mappearDeRespuestaAReporteProyeccionEstudiantes.and.returnValue(mockReporteProyeccion);

        // Act — segunda llamada debe limpiar el error
        service.obtenerProyeccionEstudiantes(2, 2024).subscribe({
          next: () => {
            service.error$.pipe(take(1)).subscribe(err => {
              expect(err).toBeNull();
              done();
            });
          }
        });
      }
    });
  });
});
