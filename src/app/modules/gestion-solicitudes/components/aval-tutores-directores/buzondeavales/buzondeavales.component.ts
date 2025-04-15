import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RadicarService } from '../../../services/radicar.service';

@Component({
    selector: 'app-buzondeavales',
    templateUrl: './buzondeavales.component.html',
    styleUrls: ['./buzondeavales.component.scss'],
})
export class BuzondeavalesComponent implements OnInit {
    itemsMenu: MenuItem[];

    constructor() {}

    ngOnInit(): void {
        this.cargarMenuDeOpciones();
    }

    cargarMenuDeOpciones() {
        this.itemsMenu = [
            {
                label: 'Solicitudes',
                icon: 'pi pi-pw pi-inbox',
                expanded: true,
                items: [
                    {
                        label: 'Pendientes',
                        routerLink: 'pendientes',

                        icon: 'pi pi-fw pi-inbox',
                    },
                ],
            },
        ];
    }
}
