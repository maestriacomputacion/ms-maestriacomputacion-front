import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { BreadcrumbService } from './app.breadcrumb.service';

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './app.breadcrumb.component.html'
})
export class AppBreadcrumbComponent implements OnDestroy {

    subscription: Subscription;

    items: MenuItem[];
    home: MenuItem;



    constructor(public breadcrumbService: BreadcrumbService) {
        this.subscription = breadcrumbService.itemsHandler.subscribe(response => {
            this.items = response;
        });
        this.home = {icon: 'pi pi-home', routerLink: '/'};
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
