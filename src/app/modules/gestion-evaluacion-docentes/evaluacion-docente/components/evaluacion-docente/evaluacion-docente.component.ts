import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EvaluacionDocenteService } from '../../services/evaluaciondocente.service';

@Component({
  selector: 'app-evaluacion-docente',
  templateUrl: './evaluacion-docente.component.html',
  styleUrls: ['./evaluacion-docente.component.scss'],
})
export class EvaluacionDocenteComponent implements OnInit {
  docentes = [];
  preguntas = [];
  evaluaciones = [];
  currentDocente = 0;
  evaluationCompleted = false;
  idEstudiante: string | null = null;
  idCuestionario: number | null = null;
  idEvaluacionCursoActual: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private evaluacionDocenteService: EvaluacionDocenteService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.idEstudiante = params.get('id');
      if (this.idEstudiante) {
        this.loadDocentes(+this.idEstudiante);
      }
    });
  }

  loadDocentes(idEstudiante: number) {
    this.evaluacionDocenteService
      .getCursosEvaluacion(idEstudiante)
      .subscribe({
        next: (response) => {
          this.idCuestionario = response.idCuestionario;
          this.docentes = response.evaluacionesCurso.map(
            (curso: any) => ({
              nombre: curso.docente,
              asignatura: curso.asignatura,
              notaFinal: curso.nota > 0 ? curso.nota : null,
              completado: curso.estado === 'Evaluado',
              idEvaluacionCurso: curso.idEvaluacionCurso,
            })
          );
          this.loadCuestionario(this.idCuestionario);
        },
        error: (error) => {
          console.error('Error al cargar los docentes:', error);
        },
      });
  }

  loadCuestionario(idCuestionario: number) {
    this.evaluacionDocenteService
      .getCuestionario(idCuestionario)
      .subscribe({
        next: (response) => {
          this.preguntas = response.preguntas.map(
            (pregunta: any) => ({
              id: pregunta.id,
              nombre: pregunta.nombre,
            })
          );
          this.inicializarEvaluaciones();
          this.mostrarPrimeroSinEvaluar();
        },
        error: (error) => {
          console.error('Error al cargar el cuestionario:', error);
        },
      });
  }

  inicializarEvaluaciones() {
    this.evaluaciones = [];
    this.docentes.forEach((docente) => {
      const evaluacion = {
        docente: docente.nombre,
        asignatura: docente.asignatura,
        respuestas: Array(this.preguntas.length).fill(null),
        observacion: ''
      };
      this.evaluaciones.push(evaluacion);
    });
  }


  mostrarPrimeroSinEvaluar() {
    const index = this.docentes.findIndex((docente) => !docente.completado);
    if (index !== -1) {
      this.currentDocente = index;
      this.idEvaluacionCursoActual =
        this.docentes[index].idEvaluacionCurso;
    } else {
      this.evaluationCompleted = true;
    }
  }

  guardarRespuestas() {
    if (this.idEvaluacionCursoActual === null || !this.idEstudiante) {
      console.error('Falta información para guardar las respuestas.');
      return;
    }

    // Validar longitud de la observación antes de enviar
    const observacion = this.evaluaciones[this.currentDocente].observacion.trim();
    if (observacion.length > 255) {
      console.error('La observación supera los 255 caracteres permitidos.');
      return;
    }

    const respuestas = this.evaluaciones[this.currentDocente].respuestas
      .map((valor, index) => {
        const idPregunta = this.preguntas[index]?.id;
        if (!idPregunta) {
          console.error(`Error: La pregunta con índice ${index} no tiene un ID válido.`);
          return null;
        }
        return { idPregunta: idPregunta, valor };
      })
      .filter((respuesta) => respuesta !== null);

    const payload = {
      idEstudiante: +this.idEstudiante,
      idEvaluacionCursoDocente: this.idEvaluacionCursoActual,
      respuestas,
      observacion: observacion,
    };

    if (!respuestas.length) {
      console.error('No hay respuestas válidas para enviar.');
      return;
    }

    this.evaluacionDocenteService.guardarEvaluacion(payload).subscribe({
      next: () => {
        this.docentes[this.currentDocente].completado = true;
        if (this.idEstudiante) {
          this.loadDocentes(+this.idEstudiante);
        }
      },
      error: (error) => {
        console.error('Error al guardar las respuestas:', error);
      },
    });
  }



  get docentesEvaluados() {
    return this.docentes.filter((d) => d.completado).length;
  }

  get totalDocentes() {
    return this.docentes.length;
  }

  get allQuestionsAnswered() {
    const currentEvaluacion = this.evaluaciones[this.currentDocente];
    const allAnswered =
      currentEvaluacion &&
      currentEvaluacion.respuestas.length === this.preguntas.length &&
      currentEvaluacion.respuestas.every(
        (respuesta) => respuesta !== null
      );

    return allAnswered;
  }
}
