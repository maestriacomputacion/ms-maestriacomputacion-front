import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-estado-vacio',
    template: `
        <div class="flex flex-column align-items-center p-6 gap-3">
            <span class="material-symbols-rounded" style="font-size: 48px; color: #5056AC;" aria-hidden="true">{{ icono }}</span>
            <p style="font-family: 'Open Sans', sans-serif; font-size: 14px; color: #454444; text-align: center; margin: 0;">
                {{ mensaje }}
            </p>
            <ng-content></ng-content>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstadoVacioComponent {
    /** Nombre del ícono Material Symbols Rounded. Ej: 'inbox', 'person_off' */
    @Input() icono: string = 'inbox';
    @Input() mensaje: string = 'No se encontraron datos.';
}
