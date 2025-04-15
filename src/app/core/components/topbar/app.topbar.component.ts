import { Component, HostListener, OnInit } from '@angular/core';
import { AppMainComponent } from '../main/app.main.component';
import { MenuItem } from 'primeng/api';
import { menuItems as originalMenuItems } from '../../constants/menu-items';
import { MenuService } from '../../services/app.menu.service';
import { AutenticacionService } from 'src/app/modules/gestion-autenticacion/services/autenticacion.service';

interface Usuario {
    username: string;
    email: string;
    role: string[];
    phoneNumber: string;
    academicCode: string;
    firstName: string;
    lastName: string;
    idType: string;
    idNumber: string;
}
@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
})
export class AppTopBarComponent implements OnInit {
    isTopBarVisible = true;
    items: MenuItem[];

    constructor(
        public appMain: AppMainComponent,
        private autenticacion: AutenticacionService,
        private menuService: MenuService
    ) {}

    ngOnInit() {
        // Inicializar los elementos del menú al iniciar el componente
        this.initializeMenuItems();
        // Suscribirse a cambios en el estado de autenticación
        this.menuService.alertLogin$.subscribe(() => {
            const user: Usuario | null = this.autenticacion.getLoggedInUser();
            if (user) {
                this.initializeMenuItems();
            }
        });

        // Suscribirse al evento de logout
        this.autenticacion.logoutSuccess$.subscribe(() => {
            this.initializeMenuItems();
        });
    }

    @HostListener('window:scroll', ['$event'])
    onWindowScroll(event) {
        // Mostrar/ocultar la barra superior en función del desplazamiento de la página
        if (window.pageYOffset > 120) {
            this.isTopBarVisible = false;
        } else {
            this.isTopBarVisible = true;
        }
    }

    initializeMenuItems() {
        // Crear una copia profunda de los elementos del menú originales
        this.items = JSON.parse(JSON.stringify(originalMenuItems));

        // Asigna el comando de login al botón LOGIN
        this.items.forEach((item) => {
            if (item.label === 'LOGIN') {
                item.command = () => this.autenticacion.login();
            }
        });

        if (this.autenticacion.isLoggedIn()) {
            this.updateMenuForLoggedInUser();
        } else {
            this.filterMenuItems(null);
        }
    }

    updateMenuForLoggedInUser() {
        const user = this.autenticacion.getLoggedInUser();

        if (user) {
            // Actualizar el menú para mostrar el nombre del usuario y opción de cerrar sesión
            this.items = this.items.map((item) => {
                if (item.label === 'LOGIN') {
                    return {
                        label: `${user.firstName
                            .split(' ')[0]
                            .toUpperCase()} ${user.lastName
                            .split(' ')[0]
                            .toUpperCase()}`,
                        icon: 'pi pi-fw pi-user',
                        items: [
                            {
                                label: 'Cerrar sesión',
                                icon: 'pi pi-fw pi-sign-out',
                                command: () => this.logout(),
                            },
                        ],
                    };
                }
                return item;
            });
            // Filtrar elementos del menú según el rol del usuario
            this.filterMenuItems(user);
        }
    }

    filterMenuItems(user: Usuario | null) {
        this.items = this.items.filter((item) => {
            if (item.label === 'GESTIÓN') {
                if (!user) {
                    // No mostrar el elemento GESTIÓN si no hay usuario
                    return false;
                } else if (user.role.includes('ROLE_COORDINADOR')) {
                    // Mostrar todos los subítems menos "AVALES" si el usuario es coordinador
                    item.items = item.items.filter(
                        (subItem) => subItem.label !== 'AVALES'
                    );
                    return true;
                } else if (user.role.includes('ROLE_DOCENTE')) {
                    // Mostrar solo el subítem "AVALES" si el usuario es docente
                    item.items = item.items.filter(
                        (subItem) => subItem.label === 'AVALES'
                    );
                    return true;
                }
                return false;
            }
            if (item.label === 'GESTIÓN TRABAJO DE GRADO') {
                if (!user) {
                    return false;
                } else if (user.role.includes('ROLE_COORDINADOR')) {
                    item.items = item.items.filter(
                        (subItem) =>
                            subItem.label === 'Seguimiento a egresados' ||
                            subItem.label === 'Trabajo de Grado'
                    );
                    return true;
                } else if (user.role.includes('ROLE_DOCENTE')) {
                    item.items = item.items.filter(
                        (subItem) => subItem.label === 'Trabajo de Grado'
                    );
                    return true;
                } else if (user.role.includes('ROLE_ESTUDIANTE')) {
                    item.items = item.items.filter(
                        (subItem) =>
                            subItem.label === 'Seguimiento a egresados' ||
                            subItem.label === 'Trabajo de Grado' ||
                            subItem.label === 'Generar Hoja de Vida'
                    );
                    return true;
                }

                return false;
            }
            return true;
        });
    }

    logout() {
        // Cerrar sesión y reinicializar los elementos del menú
        this.autenticacion.logout();
        this.initializeMenuItems();
    }
}
