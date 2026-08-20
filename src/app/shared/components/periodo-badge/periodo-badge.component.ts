import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-periodo-badge',
    template: `
        <span class="periodo-badge flex align-items-center gap-2"
              role="status"
              style="background-color: #F6F6F6; color: #000066; padding: 0.4rem 1rem; border-radius: 999px; font-family: 'Open Sans', sans-serif; font-weight: 600; font-size: 14px; border: 1px solid #E0E0E0;"
              [attr.aria-label]="'Período académico: ' + label">
            <span class="material-symbols-rounded" style="font-size: 20px;" aria-hidden="true">calendar_month</span>
            <span>{{ label }}</span>
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeriodoBadgeComponent {
    @Input() label: string = '';
}
