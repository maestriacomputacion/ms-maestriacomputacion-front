import { of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import { GestionMatriculaFinancieraFacadeService } from './facade.service';
import { GestionMatriculaFinancieraApiService } from './api.service';
import { GestionMatriculaFinancieraMapperService } from './mapper.service';
import { Estudiante, PeriodoAcademico } from '../models/domain-models';
import { EstudianteDTORespuesta } from '../dto/estudiante.dto';
import { PeriodoAcademicoDTORespuesta, PeriodoAcademicoDTOPeticion } from '../dto/periodo-academico.dto';

describe('GestionMatriculaFinancieraFacadeService', () => {
  let service: GestionMatriculaFinancieraFacadeService;
  let apiSpy: jasmine.SpyObj<GestionMatriculaFinancieraApiService>;
  let mapperSpy: jasmine.SpyObj<GestionMatriculaFinancieraMapperService>;

  const mockPeriodo: PeriodoAcademico = {
    id: 1, tagPeriodo: 2, año: 2024,
    fechaInicio: '2024-01-15', fechaFin: '2024-06-30',
    descripcion: 'Semestre 2024-2', estado: 'ACTIVO'
  };

  const mockPeriodoDTOPeticion: PeriodoAcademicoDTOPeticion = {
    tagPeriodo: 2, anio: 2024,
    fechaInicio: '2024-01-15', fechaFin: '2024-06-30',
    descripcion: 'Semestre 2024-2', estado: 'ACTIVO'
  };

  const mockEstudianteDTO: EstudianteDTORespuesta = {
    codigo: 'EST001', nombre: 'Juan', apellido: 'García',
    identificacion: 12345678, cohorte: 2020, periodoIngreso: '2020-1',
    semestreFinanciero: 3, becasDescuentos: [], materias: []
  };

  const mockEstudiante: Estudiante = {
    codigo: 'EST001', nombre: 'Juan', apellido: 'García',
    identificacion: 12345678, cohorte: '2020', periodoIngreso: '2020-1',
    semestreFinanciero: 3, matriculasFinancieras: [],
    descuentos: [], becas: [], becasDescuentos: [], materias: []
  };

  const mockPeriodoDTORespuesta: PeriodoAcademicoDTORespuesta = {
    id: 1, tagPeriodo: 2, anio: 2024,
    fechaInicio: '2024-01-15', fechaFin: '2024-06-30',
    descripcion: 'Semestre 2024-2', estado: 'ACTIVO'
  };

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj<GestionMatriculaFinancieraApiService>(
      'GestionMatriculaFinancieraApiService',
      ['obtenerEstudiantes', 'obtenerEstudiante', 'obtenerPeriodosAcademicos']
    );
    mapperSpy = jasmine.createSpyObj<GestionMatriculaFinancieraMapperService>(
      'GestionMatriculaFinancieraMapperService',
      [
        'mappearDePeriodoAcademicoAPeticion',
        'mappearDeListaRespuestaAEstudiante',
        'mappearDeRespuestaAEstudiante',
        'mappearDeListaRespuestaAPeriodoAcademico'
      ]
    );
    service = new GestionMatriculaFinancieraFacadeService(apiSpy, mapperSpy);
  });

  // ─── Estado inicial ───────────────────────────────────────────────────────────

  it('shouldHaveFalseLoadingAsInitialState', (done) => {
    // Act & Assert
    service.loading$.pipe(take(1)).subscribe(loading => {
      expect(loading).toBeFalse();
      done();
    });
  });

  it('shouldHaveNullErrorAsInitialState', (done) => {
    // Act & Assert
    service.error$.pipe(take(1)).subscribe(error => {
      expect(error).toBeNull();
      done();
    });
  });

  it('shouldHaveEmptyArrayAsInitialEstudiantesState', (done) => {
    // Act & Assert
    service.estudiantes$.pipe(take(1)).subscribe(estudiantes => {
      expect(estudiantes).toEqual([]);
      done();
    });
  });

  // ─── obtenerEstudiantes ───────────────────────────────────────────────────────

  it('shouldEmitLoadingTrueThenFalseWhenObtenerEstudiantesSucceeds', (done) => {
    // Arrange
    mapperSpy.mappearDePeriodoAcademicoAPeticion.and.returnValue(mockPeriodoDTOPeticion);
    apiSpy.obtenerEstudiantes.and.returnValue(of([mockEstudianteDTO]));
    mapperSpy.mappearDeListaRespuestaAEstudiante.and.returnValue([mockEstudiante]);

    const loadingValues: boolean[] = [];
    service.loading$.subscribe(v => loadingValues.push(v));

    // Act
    service.obtenerEstudiantes(mockPeriodo).subscribe({
      complete: () => {
        // Assert: finalize ya corrió — loading debe haber pasado por true y vuelto a false
        setTimeout(() => {
          expect(loadingValues).toContain(true);
          expect(loadingValues[loadingValues.length - 1]).toBeFalse();
          done();
        });
      }
    });
  });

  it('shouldUpdateEstudiantesStateWhenObtenerEstudiantesSucceeds', (done) => {
    // Arrange
    mapperSpy.mappearDePeriodoAcademicoAPeticion.and.returnValue(mockPeriodoDTOPeticion);
    apiSpy.obtenerEstudiantes.and.returnValue(of([mockEstudianteDTO]));
    mapperSpy.mappearDeListaRespuestaAEstudiante.and.returnValue([mockEstudiante]);

    // Act
    service.obtenerEstudiantes(mockPeriodo).subscribe({
      next: () => {
        // Assert
        service.estudiantes$.pipe(take(1)).subscribe(estudiantes => {
          expect(estudiantes.length).toBe(1);
          expect(estudiantes[0].codigo).toBe('EST001');
          done();
        });
      }
    });
  });

  it('shouldSetErrorStateWhenObtenerEstudiantesFails', (done) => {
    // Arrange
    const error = new Error('Network error');
    mapperSpy.mappearDePeriodoAcademicoAPeticion.and.returnValue(mockPeriodoDTOPeticion);
    apiSpy.obtenerEstudiantes.and.returnValue(throwError(() => error));

    // Act
    service.obtenerEstudiantes(mockPeriodo).subscribe({
      error: () => {
        // Assert
        service.error$.pipe(take(1)).subscribe(err => {
          expect(err).toBeTruthy();
          done();
        });
      }
    });
  });

  it('shouldResetLoadingToFalseWhenObtenerEstudiantesFails', (done) => {
    // Arrange
    mapperSpy.mappearDePeriodoAcademicoAPeticion.and.returnValue(mockPeriodoDTOPeticion);
    apiSpy.obtenerEstudiantes.and.returnValue(throwError(() => new Error('fail')));

    // Act
    service.obtenerEstudiantes(mockPeriodo).subscribe({
      error: () => {
        // Assert — finalize corre después del error handler, usar setTimeout
        setTimeout(() => {
          service.loading$.pipe(take(1)).subscribe(loading => {
            expect(loading).toBeFalse();
            done();
          });
        });
      }
    });
  });

  // ─── obtenerEstudiante ────────────────────────────────────────────────────────

  it('shouldEmitLoadingTrueThenFalseWhenObtenerEstudianteSucceeds', (done) => {
    // Arrange
    apiSpy.obtenerEstudiante.and.returnValue(of(mockEstudianteDTO));
    mapperSpy.mappearDeRespuestaAEstudiante.and.returnValue(mockEstudiante);

    const loadingValues: boolean[] = [];
    service.loading$.subscribe(v => loadingValues.push(v));

    // Act
    service.obtenerEstudiante('EST001').subscribe({
      complete: () => {
        setTimeout(() => {
          expect(loadingValues).toContain(true);
          expect(loadingValues[loadingValues.length - 1]).toBeFalse();
          done();
        });
      }
    });
  });

  it('shouldUpdateEstudianteSeleccionadoWhenObtenerEstudianteSucceeds', (done) => {
    // Arrange
    apiSpy.obtenerEstudiante.and.returnValue(of(mockEstudianteDTO));
    mapperSpy.mappearDeRespuestaAEstudiante.and.returnValue(mockEstudiante);

    // Act
    service.obtenerEstudiante('EST001').subscribe({
      next: () => {
        // Assert
        service.estudianteSeleccionado$.pipe(take(1)).subscribe(est => {
          expect(est).not.toBeNull();
          expect(est!.codigo).toBe('EST001');
          done();
        });
      }
    });
  });

  it('shouldSetErrorWhenObtenerEstudianteFails', (done) => {
    // Arrange
    const error = new Error('Not found');
    apiSpy.obtenerEstudiante.and.returnValue(throwError(() => error));

    // Act
    service.obtenerEstudiante('EST999').subscribe({
      error: () => {
        // Assert
        service.error$.pipe(take(1)).subscribe(err => {
          expect(err).toBeTruthy();
          done();
        });
      }
    });
  });

  // ─── obtenerPeriodosAcademicos ────────────────────────────────────────────────

  it('shouldEmitLoadingWhenObtenerPeriodosAcademicosSucceeds', (done) => {
    // Arrange
    apiSpy.obtenerPeriodosAcademicos.and.returnValue(of([mockPeriodoDTORespuesta]));
    mapperSpy.mappearDeListaRespuestaAPeriodoAcademico.and.returnValue([mockPeriodo]);

    const loadingValues: boolean[] = [];
    service.loading$.subscribe(v => loadingValues.push(v));

    // Act
    service.obtenerPeriodosAcademicos().subscribe({
      complete: () => {
        setTimeout(() => {
          expect(loadingValues).toContain(true);
          expect(loadingValues[loadingValues.length - 1]).toBeFalse();
          done();
        });
      }
    });
  });

  it('shouldUpdatePeriodosStateWhenObtenerPeriodosSucceeds', (done) => {
    // Arrange
    apiSpy.obtenerPeriodosAcademicos.and.returnValue(of([mockPeriodoDTORespuesta]));
    mapperSpy.mappearDeListaRespuestaAPeriodoAcademico.and.returnValue([mockPeriodo]);

    // Act
    service.obtenerPeriodosAcademicos().subscribe({
      next: () => {
        // Assert
        service.periodos$.pipe(take(1)).subscribe(periodos => {
          expect(periodos.length).toBe(1);
          expect(periodos[0].tagPeriodo).toBe(2);
          done();
        });
      }
    });
  });

  // ─── Filtros ──────────────────────────────────────────────────────────────────

  it('shouldSetPeriodoFiltroWhenSetPeriodoFiltroIsCalled', () => {
    // Act
    service.setPeriodoFiltro(mockPeriodo);

    // Assert
    expect(service.getPeriodoFiltro()).toEqual(mockPeriodo);
  });

  it('shouldGetPeriodoFiltroWhenGetPeriodoFiltroIsCalled', () => {
    // Arrange
    service.setPeriodoFiltro(mockPeriodo);

    // Act
    const result = service.getPeriodoFiltro();

    // Assert
    expect(result).toEqual(mockPeriodo);
  });

  it('shouldSetSemestreFiltroWhenSetSemestreFiltroIsCalled', () => {
    // Act
    service.setSemestreFiltro(3);

    // Assert
    expect(service.getSemestreFiltro()).toBe(3);
  });

  // ─── Limpieza de error ────────────────────────────────────────────────────────

  it('shouldClearErrorAtStartOfNewOperationWhenPreviousErrorExists', (done) => {
    // Arrange — forzar un error previo
    const error = new Error('Previous error');
    mapperSpy.mappearDePeriodoAcademicoAPeticion.and.returnValue(mockPeriodoDTOPeticion);
    apiSpy.obtenerEstudiantes.and.returnValue(throwError(() => error));

    service.obtenerEstudiantes(mockPeriodo).subscribe({
      error: () => {
        // Ahora configurar éxito para la segunda llamada
        apiSpy.obtenerEstudiantes.and.returnValue(of([mockEstudianteDTO]));
        mapperSpy.mappearDeListaRespuestaAEstudiante.and.returnValue([mockEstudiante]);

        // Act — segunda llamada debe limpiar el error
        service.obtenerEstudiantes(mockPeriodo).subscribe({
          next: () => {
            // Assert — el error se limpió al inicio de la operación
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
