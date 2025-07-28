import { Component, OnInit } from '@angular/core';
import { CuestionarioService } from '../../../gestion-cuestionarios/services/cuestionario.service';
import { MatriculaEvaluacionService } from '../../services/matricula-evaluacion.service';
import { Cuestionario } from '../../../gestion-cuestionarios/models/cuestionario';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-agregar-evaluacion',
    templateUrl: './agregar-evaluacion.component.html',
    styleUrls: ['./agregar-evaluacion.component.scss'],
})
export class AgregarEvaluacionComponent implements OnInit {
    evaluacion: any = {
        anio: null,
        periodo: null,
        cuestionario: null,
        fecha_inicio: null,
        fecha_fin: null
    };
    selectedYear: Date | null = null;
    cuestionarios: any[] = [];
    mostrarDetalles: boolean = false;
    evaluacionExistente: boolean = false;
    yearRange: string;
    areasFormacion: any[] = [];
    cantidadEstudiantesRegistrados: number = 0;

    loading: boolean = false;

    constructor(
        private readonly cuestionarioService: CuestionarioService,
        private readonly matriculaEvaluacionService: MatriculaEvaluacionService,
        private readonly messageService: MessageService
    ) {
        const currentYear = new Date().getFullYear();
        this.yearRange = `${currentYear - 100}:${currentYear}`;
    }

    ngOnInit(): void {
        this.cuestionarios = [{ label: 'Seleccionar cuestionario', value: null }];
        this.loadCuestionarios();
    }

    loadCuestionarios(): void {
        this.cuestionarioService.listCuestionarios().subscribe({
            next: (data: Cuestionario[]) => {
                this.cuestionarios = data.map((c) => ({
                    label: c.nombre,
                    value: c.id,
                }));
                this.cuestionarios.unshift({ label: 'Seleccionar cuestionario', value: null });
            },
            error: (error) => console.error('Error al cargar los cuestionarios', error)
        });
    }

    onYearSelect(event: Date) {
        this.evaluacion.anio = event.getFullYear();
        console.log('Año seleccionado:', this.evaluacion.anio);
    }

    verDetalles() {
        const { anio, periodo } = this.evaluacion;

        if (!anio || !periodo) {
            console.error('Debe seleccionar año y periodo');
            return;
        }

        this.matriculaEvaluacionService.obtenerEvaluacionMetadata(anio, periodo).subscribe({
            next: (data) => {
                this.mostrarDetalles = true;
                this.evaluacionExistente = data?.evaluacionActiva || false;
                this.areasFormacion = data?.areasFormacion ?? [];
                this.cantidadEstudiantesRegistrados = data?.cantidadEstudiantesResgistrados ?? 0;
            },
            error: (error) => console.error('Error al obtener los detalles de la evaluación:', error)
        });
    }

    registrarEvaluacion() {
        const { anio, periodo, cuestionario, fecha_inicio, fecha_fin } = this.evaluacion;

        // Validación de campos
        if (!anio || !periodo || !cuestionario || !fecha_inicio || !fecha_fin) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Campos incompletos',
                detail: 'Debe completar todos los campos para registrar la evaluación.',
            });
            return;
        }

        // Validar que periodo solo sea 1 o 2
        if (periodo !== 1 && periodo !== 2) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Periodo inválido',
                detail: 'El periodo solo puede ser 1 o 2.',
            });
            return;
        }

        // Validar que fecha_fin no sea menor que fecha_inicio
        if (new Date(fecha_fin) < new Date(fecha_inicio)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Error en fechas',
                detail: 'La fecha de fin no puede ser menor que la fecha de inicio.',
            });
            return;
        }

        const body = {
            anio,
            periodo,
            id_cuestionario: cuestionario,
            fecha_inicio: fecha_inicio.toLocaleDateString('es-ES'),
            fecha_fin: fecha_fin.toLocaleDateString('es-ES')
        };

        this.loading = true;
        this.matriculaEvaluacionService.registrarEvaluacion(body).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Evaluación Registrada',
                    detail: `La evaluación con el cuestionario "${response?.nombreCuestionario}" se registró exitosamente para el año ${response?.anio} y período ${response?.periodo}.`
                });
            },
            error: (error) => {
                console.error('Error al registrar la evaluación:', error);

                // 📌 Extraer el mensaje de error si está disponible
                const errorMessage = error?.error?.message ?? 'Ocurrió un error inesperado.';

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al registrar',
                    detail: errorMessage,
                });
            },
            complete: () => {
                this.loading = false;
            },
        });
    }
}
