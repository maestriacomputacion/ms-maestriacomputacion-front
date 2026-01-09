import { Component } from '@angular/core';
import { TipoCorreo } from '../../models/correos.model';

@Component({
    selector: 'app-tipo-correos',
    templateUrl: './tipo-correos.component.html',
    styleUrls: ['./tipo-correos.component.scss'],
})
export class TipoCorreosComponent {
    tipos: TipoCorreo[] = [
        {
            label: 'Notificar matrícula a estudiantes y tutor',
            descripcion:
                'Notifica al estudiante y al tutor sobre los cursos en los que fue matriculado.',
            icon: 'pi pi-envelope',
        },
        {
            label: 'Enviar prematrícula a tutor',
            descripcion:
                'Envía la prematrícula al tutor para su revisión y aprobación.',
            icon: 'pi pi-send',
        },
    ];

    seleccionar(tipo: TipoCorreo): void {
        console.log('Enviar:', tipo);
    }
}
