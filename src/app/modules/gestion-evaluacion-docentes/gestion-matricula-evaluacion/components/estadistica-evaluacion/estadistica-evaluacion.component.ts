import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EstadisticaEvaluacionService } from '../../services/estaditica-evaluacion.service';

@Component({
  selector: 'app-estadistica-evaluacion',
  templateUrl: './estadistica-evaluacion.component.html',
  styleUrls: ['./estadistica-evaluacion.component.scss'],
})
export class EstadisticaEvaluacionComponent implements OnInit {
  evaluacion: any = {};
  resultados: any[] = [];
  filtroDocentes: string = 'todos';
  docenteFiltro: string = '';
  asignaturas: any[] = [];
  asignaturaSeleccionada: any = null;
  docentes: any[] = [];
  idEvaluacion!: number;
  docenteSeleccionado: any = null;

  estadisticasDocente: any[] = [];
  estadisticasDocenteTotal: number = 0;
  estadisticasDocenteRespondidas: number = 0;

  tipoReporteSeleccionado: string | null = null;

  docentesOptions = [
    { label: 'Todos los docentes', value: 'todos' },
    { label: 'Docente en particular', value: 'particular' },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly estadisticaEvaluacionService: EstadisticaEvaluacionService
  ) { }

  ngOnInit(): void {
    this.initializeIdEvaluacion();
    this.loadResultados();
    this.loadAsignaturas();
  }

  private initializeIdEvaluacion(): void {
    const idEvaluacion = +this.route.snapshot.params['id'];
    if (isNaN(idEvaluacion)) {
      console.error('El ID de evaluación no es válido:', idEvaluacion);
      return;
    }
    this.idEvaluacion = idEvaluacion;
  }

  private loadResultados(): void {
    this.estadisticaEvaluacionService
      .getEstadisticasEvaluacion(this.idEvaluacion)
      .subscribe(
        (data) => (this.resultados = Array.isArray(data) ? data : []),
        (error) => {
          console.error(
            'Error al obtener los datos de la evaluación',
            error
          );
          alert(
            'No se pudieron cargar los resultados de la evaluación. Intenta nuevamente.'
          );
        }
      );
  }

  private loadAsignaturas(): void {
    this.estadisticaEvaluacionService
      .getAsignaturasEvaluacion(this.idEvaluacion)
      .subscribe(
        (asignaturas) =>
        (this.asignaturas = Array.isArray(asignaturas)
          ? asignaturas
          : []),
        (error) =>
          console.error(
            'Error al obtener las asignaturas de la evaluación',
            error
          )
      );
  }




  resultadosFiltrados(): any[] {
    if (this.filtroDocentes === 'todos') return this.resultados;
    if (this.filtroDocentes === 'particular' && this.docenteFiltro) {
      return this.resultados.filter((r) =>
        r.docente
          ?.toLowerCase()
          .includes(this.docenteFiltro.toLowerCase())
      );
    }
    return [];
  }

  obtenerDocentesPorAsignatura(): void {
    if (this.asignaturaSeleccionada?.id && this.idEvaluacion) {
      this.estadisticaEvaluacionService
        .getDocentesPorAsignatura(
          this.idEvaluacion,
          this.asignaturaSeleccionada.id
        )
        .subscribe(
          (data) => (this.docentes = Array.isArray(data) ? data : []),
          (error) =>
            console.error(
              'Error al obtener los docentes por asignatura',
              error
            )
        );
    }
  }

  obtenerEstadisticasDocente(): void {
    if (
      this.asignaturaSeleccionada?.id &&
      this.docenteSeleccionado?.id &&
      this.idEvaluacion
    ) {
      this.estadisticaEvaluacionService
        .getEstadisticasDocente(
          this.idEvaluacion,
          this.asignaturaSeleccionada.id,
          this.docenteSeleccionado.id
        )
        .subscribe(
          (data) => {
            if (data) {
              this.estadisticasDocente =
                data.promedioRespuestas || [];
              this.estadisticasDocenteTotal =
                data.totalEvaluaciones || 0;
              this.estadisticasDocenteRespondidas =
                data.totalRespondidas || 0;
            }
          },
          (error) =>
            console.error(
              'Error al obtener las estadísticas del docente',
              error
            )
        );
    }
  }

  resetFiltros(): void {
    this.asignaturaSeleccionada = null;
    this.docenteSeleccionado = null;
    this.estadisticasDocente = [];
  }


  generarReporte(): void {
    this.estadisticaEvaluacionService.generarReporte(this.idEvaluacion).subscribe(
      (response: Blob) => {
        // Crear un enlace de descarga
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(response);  // Crear URL para el blob recibido
        a.href = url;
        a.download = `reporte_evaluacion_${this.idEvaluacion}.xlsx`;  // Establecer nombre del archivo
        a.click();  // Forzar la descarga del archivo
        window.URL.revokeObjectURL(url);  // Liberar el objeto URL
      },
      (error) => {
        console.error('Error al generar el reporte', error);
        alert('Hubo un error al generar el reporte. Intenta nuevamente.');
      }
    );
  }
}
