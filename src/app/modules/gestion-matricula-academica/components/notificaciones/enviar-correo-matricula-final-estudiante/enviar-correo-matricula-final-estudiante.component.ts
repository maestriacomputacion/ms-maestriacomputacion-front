import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EstudianteCorreo } from '../../../models/correos.model';
import { NotificacionPrematriculaTutor } from '../../../models/notificacion-prematricula.model';
import { CorreoMatriculaFinalService } from '../../../services/correo-matricula-final.service';

type ResumenEstudiante = {
    tutorNombre: string;
    tutorCodigo: string;
    estudianteNombre: string;
    estudianteCodigo: string;
    estudianteCorreo: string;
};

@Component({
    selector: 'app-enviar-correo-matricula-final-estudiante',
    templateUrl: './enviar-correo-matricula-final-estudiante.component.html',
    styleUrls: ['./enviar-correo-matricula-final-estudiante.component.scss'],
})
export class EnviarCorreoMatriculaFinalEstudianteComponent implements OnInit {
    estudiantes: EstudianteCorreo[] = [];
    estudiantesFiltrados: EstudianteCorreo[] = [];
    seleccionParaEnviar: EstudianteCorreo[] = [];
    enviando = false;
    resumenVisible = false;
    resumenMessage = '';
    resumenNotificaciones: NotificacionPrematriculaTutor[] = [];
    resumenEstudiantes: ResumenEstudiante[] = [];
    totalTutoresNotificados = 0;
    totalEstudiantesNotificados = 0;

    busqueda = '';

    constructor(
        private readonly correoMatriculaFinalService: CorreoMatriculaFinalService,
        private readonly messageService: MessageService,
        private readonly confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.cargarEstudiantes();
    }

    onBuscar(term: string): void {
        this.busqueda = term;
        this.aplicarFiltro();
    }

    aplicarFiltro(): void {
        const t = this.busqueda.toLowerCase();
        const idsSeleccionados = new Set(
            this.seleccionParaEnviar.map((e) => e.id)
        );
        this.estudiantesFiltrados = this.estudiantes.filter((e) => {
            if (idsSeleccionados.has(e.id)) {
                return false;
            }
            return (
                !t ||
                e.codigo.toLowerCase().includes(t) ||
                e.nombre.toLowerCase().includes(t) ||
                e.correo.toLowerCase().includes(t)
            );
        });
    }

    removerEnvio(estudiante: EstudianteCorreo): void {
        this.seleccionParaEnviar = this.seleccionParaEnviar.filter(
            (e) => e.id !== estudiante.id
        );
        this.aplicarFiltro();
    }

    seleccionar(estudiante: EstudianteCorreo): void {
        if (this.estaSeleccionado(estudiante.id)) {
            return;
        }
        this.seleccionParaEnviar = [...this.seleccionParaEnviar, estudiante];
        this.aplicarFiltro();
    }

    seleccionarTodosFiltrados(): void {
        if (!this.estudiantesFiltrados.length) {
            return;
        }
        const idsSeleccionados = new Set(
            this.seleccionParaEnviar.map((e) => e.id)
        );
        const nuevos = this.estudiantesFiltrados.filter(
            (e) => !idsSeleccionados.has(e.id)
        );
        if (!nuevos.length) {
            return;
        }
        this.seleccionParaEnviar = [...this.seleccionParaEnviar, ...nuevos];
        this.aplicarFiltro();
    }

    estaSeleccionado(estudianteId: number): boolean {
        return this.seleccionParaEnviar.some((e) => e.id === estudianteId);
    }

    enviarCorreos(event: Event): void {
        if (!this.seleccionParaEnviar.length) {
            return;
        }
        if (this.enviando) {
            return;
        }

        const target = event.currentTarget ?? event.target;
        this.confirmationService.confirm({
            target,
            header: 'Confirmar envío',
            message:
                '¿Deseas enviar el correo de matrícula final a los estudiantes seleccionados?',
            acceptLabel: 'Enviar',
            rejectLabel: 'Cancelar',
            accept: () => {
                this.ejecutarEnvioCorreos();
            },
        });
    }

    private cargarEstudiantes(): void {
        this.correoMatriculaFinalService
            .getEstudiantesConMatriculaFinal()
            .subscribe((response) => {
                this.estudiantes = response.data ?? [];
                this.aplicarFiltro();
            });
    }

    private ejecutarEnvioCorreos(): void {
        const estudianteIds = this.seleccionParaEnviar.map((e) => e.id);
        this.enviando = true;
        this.correoMatriculaFinalService
            .enviarCorreoMatriculaFinal({ estudianteIds })
            .subscribe({
                next: (response) => {
                    if (response.typeResponse === 'SUCCESS') {
                        this.actualizarResumenNotificacion(
                            response.message,
                            response.data
                        );
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: response.message,
                        });
                        this.resumenVisible = true;
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: response.message,
                        });
                    }
                    this.enviando = false;
                },
                error: (err) => {
                    console.error(
                        'Error enviando correo de matricula final',
                        err
                    );
                    const detail =
                        err?.error?.message ||
                        err?.message ||
                        'Error enviando correo de matricula final';
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail,
                    });
                    this.enviando = false;
                },
            });
    }

    private actualizarResumenNotificacion(
        message: string,
        data: NotificacionPrematriculaTutor[] | null | undefined
    ): void {
        const listado = data ?? [];
        const estudiantesListado = listado.reduce<ResumenEstudiante[]>(
            (acc, item) => {
                const estudiantes = item.estudiantes ?? [];
                const mapped = estudiantes.map((estudiante) => {
                    const nombre = `${estudiante.persona?.nombre ?? ''} ${
                        estudiante.persona?.apellido ?? ''
                    }`.trim();
                    return {
                        tutorNombre: item.nombre,
                        tutorCodigo: item.codigo,
                        estudianteNombre: nombre || 'Sin nombre',
                        estudianteCodigo: estudiante.codigo ?? '',
                        estudianteCorreo:
                            estudiante.correoUniversidad ??
                            estudiante.persona?.correoElectronico ??
                            '',
                    };
                });
                return acc.concat(mapped);
            },
            []
        );
        this.resumenMessage = message;
        this.resumenNotificaciones = listado;
        this.totalTutoresNotificados = listado.length;
        this.resumenEstudiantes = estudiantesListado;
        this.totalEstudiantesNotificados =
            estudiantesListado.length > 0
                ? estudiantesListado.length
                : listado.reduce(
                      (acc, item) =>
                          acc +
                          Number(item.totalEstudiantesConMatriculaActiva ?? 0),
                      0
                  );
    }

    cerrarResumen(): void {
        this.resumenVisible = false;
    }
}
