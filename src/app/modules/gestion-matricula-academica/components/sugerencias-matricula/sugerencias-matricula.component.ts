import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';

interface SugerenciaAsignatura {
    id: number;
    asignatura: string;
    estado: string;
    observaciones: string;
    cumpleRequisitos: boolean;
    validarPreRequisito: boolean;
    compatibleConHorario: boolean;
    superposicionHorario: boolean;
    seleccionada: boolean;
}

interface OpcionEstudiante {
    label: string;
    value: number | string;
}

@Component({
    selector: 'app-sugerencias-matricula',
    templateUrl: './sugerencias-matricula.component.html',
    styleUrls: ['./sugerencias-matricula.component.scss'],
})
export class SugerenciasMatriculaComponent implements OnInit {
    loading: boolean = false;
    periodo: number = 2;
    anio: number = 2025;
    nombreTutor: string = 'Daniel Paz';

    estudianteSeleccionado: number | string = 'todos';
    estudiantes: OpcionEstudiante[] = [];

    sugerencias: SugerenciaAsignatura[] = [];

    constructor(private readonly messageService: MessageService) {}

    ngOnInit(): void {
        this.cargarEstudiantes();
        this.cargarSugerencias();
    }

    cargarEstudiantes(): void {
        // Datos de ejemplo - reemplazar con servicio real
        this.estudiantes = [
            { label: 'Todo los estudiantes', value: 'todos' },
            { label: 'Juan Pérez', value: 1 },
            { label: 'María García', value: 2 },
            { label: 'Pedro Martínez', value: 3 },
        ];
    }

    cargarSugerencias(): void {
        // Datos de ejemplo - reemplazar con servicio real
        this.sugerencias = [
            {
                id: 1,
                asignatura: 'Bases de Datos',
                estado: 'Aprobado',
                observaciones: 'Cumple requisitos',
                cumpleRequisitos: true,
                validarPreRequisito: false,
                compatibleConHorario: false,
                superposicionHorario: false,
                seleccionada: false,
            },
            {
                id: 2,
                asignatura: 'Aprendizaje Profundo',
                estado: 'Aprobado',
                observaciones: 'Falta validar pre-requisito',
                cumpleRequisitos: false,
                validarPreRequisito: true,
                compatibleConHorario: false,
                superposicionHorario: false,
                seleccionada: false,
            },
            {
                id: 3,
                asignatura: 'Ingeniería de Software',
                estado: 'Aprobado',
                observaciones: 'Compatible con horario',
                cumpleRequisitos: false,
                validarPreRequisito: false,
                compatibleConHorario: true,
                superposicionHorario: false,
                seleccionada: false,
            },
            {
                id: 4,
                asignatura: 'Fundamentos de Computación',
                estado: 'Aprobado',
                observaciones: 'Superposición de horario',
                cumpleRequisitos: false,
                validarPreRequisito: false,
                compatibleConHorario: false,
                superposicionHorario: true,
                seleccionada: false,
            },
        ];
    }

    onEstudianteChange(): void {
        this.cargarSugerencias();
    }

    seleccionarTodos(event: { checked: boolean }): void {
        const seleccionado = event.checked;
        this.sugerencias.forEach((s) => (s.seleccionada = seleccionado));
    }

    verificarTodosSeleccionados(): boolean {
        return (
            this.sugerencias.length > 0 &&
            this.sugerencias.every((s) => s.seleccionada)
        );
    }

    aprobarSugerencia(sugerencia: SugerenciaAsignatura): void {
        this.messageService.add({
            severity: 'success',
            summary: 'Aprobado',
            detail: `Sugerencia para ${sugerencia.asignatura} aprobada`,
        });
    }

    rechazarSugerencia(sugerencia: SugerenciaAsignatura): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Rechazado',
            detail: `Sugerencia para ${sugerencia.asignatura} rechazada`,
        });
    }

    tieneSeleccionadas(): boolean {
        return this.sugerencias.some((s) => s.seleccionada);
    }

    aplicarSugerencias(): void {
        const seleccionadas = this.sugerencias.filter((s) => s.seleccionada);
        if (seleccionadas.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin seleccion',
                detail: 'Selecciona al menos una sugerencia para aplicar.',
            });
            return;
        }

        this.messageService.add({
            severity: 'success',
            summary: 'Sugerencias aplicadas',
            detail: `Se aplicaron ${seleccionadas.length} sugerencias.`,
        });
    }
}
