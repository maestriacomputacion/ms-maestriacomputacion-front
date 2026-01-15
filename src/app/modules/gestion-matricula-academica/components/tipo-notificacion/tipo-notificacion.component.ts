import { Component } from '@angular/core';
import { TipoCorreo } from '../../models/correos.model';

@Component({
    selector: 'app-tipo-notificacion',
    templateUrl: './tipo-notificacion.component.html',
    styleUrls: ['./tipo-notificacion.component.scss'],
})
export class TipoNotificacionComponent {
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
            ruta: '#',
        },
    ];
}
