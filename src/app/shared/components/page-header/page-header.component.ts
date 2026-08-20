import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-page-header',
    template: `
        <div class="flex align-items-center justify-content-between mb-4 pb-3"
             style="border-bottom: 2px solid #DB141C;">
            <h2 style="font-family: 'Titillium Web', sans-serif; color: #000066; font-size: 22px; margin: 0; font-weight: 700;">
                {{ titulo }}
            </h2>
            <ng-content></ng-content>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageHeaderComponent {
    @Input() titulo: string = '';
}
