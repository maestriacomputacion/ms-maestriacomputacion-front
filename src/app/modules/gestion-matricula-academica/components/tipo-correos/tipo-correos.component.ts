import { Component } from '@angular/core';

interface TipoCorreo {
    label: string;
    descripcion: string;
    icon: string;
}

@Component({
    selector: 'app-tipo-correos',
    templateUrl: './tipo-correos.component.html',
    styleUrls: ['./tipo-correos.component.scss'],
})
export class TipoCorreosComponent {
    tipos: TipoCorreo[] = [
        {
            label: 'Correo de cursos matriculados',
            descripcion: 'Notifica al estudiante los cursos en los que fue matriculado.',
            icon: 'pi pi-envelope',
        },
        {
            label: 'Correo de cursos actualizados',
            descripcion: 'Informa cambios en su matrícula o ajustes recientes.',
            icon: 'pi pi-refresh',
        },
    ];

    seleccionar(tipo: TipoCorreo): void {
        console.log('Enviar:', tipo);
    }
}
