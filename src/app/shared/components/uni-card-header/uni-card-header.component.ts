import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-uni-card-header',
    template: `
        <div class="p-3 flex align-items-center justify-content-between"
             style="background-color: #000066; border-radius: 12px 12px 0 0;">
            <h3 class="flex align-items-center" style="color: #FFFFFF; font-family: 'Titillium Web', sans-serif; font-size: 18px; margin: 0; font-weight: 600;">
                <span *ngIf="icono" class="material-symbols-rounded mr-2" style="font-size:22px;" aria-hidden="true">{{ icono }}</span>
                <span>{{ titulo }}</span>
            </h3>
            <ng-content></ng-content>
        </div>
    `,
    styles: [':host { display: block; }'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniCardHeaderComponent {
    @Input() titulo: string = '';
    /** Nombre del ícono Material Symbols Rounded. Ej: 'person', 'payments'. Dejar vacío para omitir. */
    @Input() icono: string = '';
}
