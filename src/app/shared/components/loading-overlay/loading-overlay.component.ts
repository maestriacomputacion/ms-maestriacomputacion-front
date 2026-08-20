import { Component } from '@angular/core';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading-overlay',
  template: `
    <p-blockUI [blocked]="(loadingService.loading$ | async) || false" [baseZIndex]="9999">
      <div class="loading-content flex flex-column align-items-center gap-3">
        <div class="loading-card">
          <app-uni-progress-bar [label]="(loadingService.message$ | async) || ''"></app-uni-progress-bar>
        </div>
      </div>
    </p-blockUI>
  `,
  styles: [`
    :host ::ng-deep .p-blockui {
      background-color: rgba(255, 255, 255, 0.7) !important;
      backdrop-filter: blur(4px);
    }

    .loading-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
    }

    .loading-card {
      background-color: #FFFFFF;
      padding: 2rem 3rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #E5E2E1;
      width: 340px;
      text-align: center;
    }

    .uni-loading-text {
      font-family: 'Open Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #000066;
      letter-spacing: 0.5px;
    }

    :host ::ng-deep .uni-spinner .p-progressspinner-circle {
      stroke: #000066 !important;
      animation: p-progressspinner-dash 1.5s ease-in-out infinite !important;
    }
  `]
})
export class LoadingOverlayComponent {
  constructor(public loadingService: LoadingService) {}
}
