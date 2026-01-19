import { Component } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TipoCorreo } from '../../../models/correos.model';
import { TutorService } from '../../../services/tutor.service';
import { NotificacionPrematriculaTutor } from '../../../models/notificacion-prematricula.model';

@Component({
    selector: 'app-tipo-notificacion',
    templateUrl: './tipo-notificacion.component.html',
    styleUrls: ['./tipo-notificacion.component.scss'],
})
export class TipoNotificacionComponent {
    enviandoPrematricula = false;
    resumenVisible = false;
    resumenMessage = '';
    resumenNotificaciones: NotificacionPrematriculaTutor[] = [];
    totalTutoresNotificados = 0;
    totalEstudiantesNotificados = 0;

    tipos: TipoCorreo[] = [
        {
            label: 'Notificar por estudiante',
            descripcion:
                'Notifica al estudiante y al tutor sobre los cursos en los que fue matriculado.',
            icon: 'pi pi-user',
            ruta: '/gestion-matricula-academica/enviar-correo-matricula-final-estudiante',
        },
        {
            label: 'Notificar por cursos',
            descripcion: 'Notifica la matrícula final organizada por cursos.',
            icon: 'pi pi-book',
            ruta: '/gestion-matricula-academica/enviar-correo-matricula-final',
        },
        {
            label: 'Enviar prematrícula a tutor',
            descripcion:
                'Envía la prematrícula al tutor para su revisión y aprobación.',
            icon: 'pi pi-send',
            accion: 'enviar-prematricula',
        },
    ];

    constructor(
        private readonly tutorService: TutorService,
        private readonly messageService: MessageService,
        private readonly confirmationService: ConfirmationService
    ) {}

    enviarPrematriculaATutores(event: Event): void {
        if (this.enviandoPrematricula) {
            return;
        }

        const target = event.currentTarget ?? event.target;
        this.confirmationService.confirm({
            target,
            header: 'Confirmar envío',
            message:
                '¿Deseas enviar la prematrícula a todos los tutores con matrícula activa?',
            acceptLabel: 'Enviar',
            rejectLabel: 'Cancelar',
            accept: () => {
                this.ejecutarEnvioPrematricula();
            },
        });
    }

    private ejecutarEnvioPrematricula(): void {
        this.enviandoPrematricula = true;
        this.tutorService.notificarPrematricula().subscribe({
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
                this.enviandoPrematricula = false;
            },
            error: (err) => {
                console.error('Error enviando prematrícula a tutores', err);
                const detail =
                    err?.error?.message ||
                    err?.message ||
                    'Error enviando prematrícula a tutores';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail,
                });
                this.enviandoPrematricula = false;
            },
        });
    }

    private actualizarResumenNotificacion(
        message: string,
        data: NotificacionPrematriculaTutor[] | null | undefined
    ): void {
        const listado = data ?? [];
        this.resumenMessage = message;
        this.resumenNotificaciones = listado;
        this.totalTutoresNotificados = listado.length;
        this.totalEstudiantesNotificados = listado.reduce(
            (acc, item) =>
                acc + Number(item.totalEstudiantesConMatriculaActiva ?? 0),
            0
        );
    }

    cerrarResumen(): void {
        this.resumenVisible = false;
    }
}
