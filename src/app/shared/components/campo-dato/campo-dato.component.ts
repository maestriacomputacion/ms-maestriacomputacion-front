import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-campo-dato',
    template: `
        <div [class]="colClass + ' mb-2'">
            <span class="campo-label">{{ label }}</span>
            <span class="campo-valor">{{ valor ?? '-' }}</span>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampoDatoComponent {
    @Input() label: string = '';
    @Input() valor: string | number | null | undefined = '';
    /** Clase de columna PrimeFlex. Por defecto ocupa 4 columnas en md. */
    @Input() colClass: string = 'col-12 md:col-4';
}
