import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-uni-progress-bar',
    template: `
        <div class="uni-progress-bar-container">
            <div class="uni-progress-bar" [attr.role]="'status'" [attr.aria-label]="label">
                <div class="uni-progress-bar__track"></div>
            </div>
            <span *ngIf="label" class="uni-progress-label">{{ label }}</span>
        </div>
    `,
    styles: [`
        .uni-progress-bar-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }
        .uni-progress-label {
            font-family: 'Open Sans', sans-serif;
            font-size: 13px;
            font-weight: 600;
            color: #000066;
            text-align: center;
            display: block;
            margin-top: 4px;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniProgressBarComponent {
    @Input() label: string = 'Cargando...';
}
