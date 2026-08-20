import { Component } from '@angular/core';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading-overlay',
  template: `
    <p-blockUI [blocked]="(loadingService.loading$ | async) || false" [baseZIndex]="9999">
      <div class="loading-content flex flex-column align-items-center gap-3">
        <p-progressSpinner 
          strokeWidth="4" 
          fill="var(--surface-ground)" 
          animationDuration=".8s">
        </p-progressSpinner>
        <span class="text-white text-xl font-medium tracking-wider shadow-text">
          {{ loadingService.message$ | async }}
        </span>
      </div>
    </p-blockUI>
  `,
  styles: [`
    :host ::ng-deep .p-blockui {
      background-color: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(4px);
      transition: all 0.3s ease-in-out;
    }

    .loading-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
    }

    .shadow-text {
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }

    :host ::ng-deep .p-progressspinner-circle {
      animation: p-progressspinner-dash 1.5s ease-in-out infinite, p-progressspinner-color 6s ease-in-out infinite;
    }

    @keyframes p-progressspinner-color {
      100%, 0% { stroke: var(--primary-500); }
      40% { stroke: var(--primary-400); }
      66% { stroke: var(--primary-600); }
      80%, 90% { stroke: var(--primary-300); }
    }
  `]
})
export class LoadingOverlayComponent {
  constructor(public loadingService: LoadingService) {}
}
