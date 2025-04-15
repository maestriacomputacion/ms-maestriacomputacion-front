import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InfoCoordinadorComponent } from '../../components/presentacion-solicitudes/formularios/complementarios/info-coordinador/info-coordinador.component';
import { InfoPresidenteConsejoComponent } from '../../components/presentacion-solicitudes/formularios/complementarios/info-presidente-consejo/info-presidente-consejo.component';
import { InfoCertificadoVotacionComponent} from '../../components/presentacion-solicitudes/formularios/complementarios/info-certificado-votacion/info-certificado-votacion.component';

@Component({
    selector: 'app-gestion',
    templateUrl: './gestion.component.html',
    styleUrls: ['./gestion.component.scss'],
})
export class GestionComponent implements OnInit {
    items: MenuItem[];
    itemstab: MenuItem[];
    activeItem: MenuItem;

    constructor(private dialogService: DialogService) {}

    ngOnInit(): void {
        this.fetchMenuGestion();
    }

    fetchMenuGestion() {
        this.items = [
            {
                label: 'Buzón',
                icon: 'pi pi-pw pi-inbox',
                expanded: true,
                items: [
                    {
                        label: 'Nuevas',
                        routerLink: 'buzon/nuevas',
                        icon: 'pi pi-fw pi-arrow-down',
                    },
                    {
                        label: 'Rechazadas',
                        routerLink: 'buzon/rechazadas',
                        icon: 'pi pi-fw pi-times',
                    },
                ],
            },
            {
                label: 'En tramite',
                icon: 'pi pi-fw pi-pencil',
                items: [
                    {
                        label: 'En comite',
                        routerLink: 'buzon/comite',
                        icon: 'pi pi-fw pi-users',
                    },
                    {
                        label: 'En consejo',
                        routerLink: 'buzon/consejo',
                        icon: 'pi pi-fw pi-users',
                    },
                ],
            },
            {
                label: 'Archivo',
                icon: 'pi pi-fw pi-folder',
                items: [
                    {
                        label: 'Resueltas',
                        routerLink: 'buzon/resueltas',
                        icon: 'pi pi-fw pi-check-circle',
                    },
                ],
            },
            {
                label: 'Ajustes',
                icon: 'pi pi-fw pi-cog',
                items: [
                    {
                        label: 'Editar',
                        icon: 'pi pi-fw pi-pencil',
                        items: [
                            {
                                label: 'Coordninador(a)',
                                icon: 'pi pi-fw pi-user-edit',
                                command: () => this.openDialog('coordinador'),
                            },
                            {
                                label: 'Decano Consejo',
                                icon: 'pi pi-fw pi-user-edit',
                                command: () => this.openDialog('presidente'),
                            },
                            {
                                label: 'Habilitar registro Certificado votación',
                                icon: 'pi pi-fw pi-user-edit',
                                command: () => this.openDialog('certificado votacion'),
                            },

                        ],
                    },
                    {
                        label: 'Ayuda',
                        icon: 'pi pi-fw pi-question-circle',
                        items: [
                            {
                                label: 'Guia de uso',
                                icon: 'pi pi-fw pi-info-circle',
                            },
                        ],
                    },
                ],
            },
        ];
    }

    openDialog(cargo: string) {
        let ref: DynamicDialogRef;

        if (cargo === 'coordinador') {
            ref = this.dialogService.open(InfoCoordinadorComponent, {
                header: 'Editar información del Coordinador',
                width: '70%',
            });
        }

        if (cargo === 'presidente') {
            ref = this.dialogService.open(InfoPresidenteConsejoComponent, {
                header: 'Editar información del Presidente del Consejo',
                width: '70%',
            });
        }

        if (cargo === 'certificado votacion') {   
            ref = this.dialogService.open(InfoCertificadoVotacionComponent, {
                header: 'Editar fecha de registro certificado votación',
                width: '70%',
            });
        }

        ref.onClose.subscribe((data) => {
            if (data) {
                // Manejar los datos que regresen del diálogo, si es necesario
            }
        });
    }
}
