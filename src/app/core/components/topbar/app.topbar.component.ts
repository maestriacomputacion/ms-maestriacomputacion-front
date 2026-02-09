import { Component, HostListener, OnInit } from '@angular/core';
import { AppMainComponent } from '../main/app.main.component';
import { MenuItem, MessageService } from 'primeng/api';
import { menuItems as originalMenuItems } from '../../constants/menu-items';
import { MenuService } from '../../services/app.menu.service';
import { AutenticacionService } from 'src/app/modules/gestion-autenticacion/services/autenticacion.service';
import { ReportFormatDialogService } from '../../services/report-format-dialog.service';
import {
    MatriculaReporteFormato,
    MatriculaReporteService,
} from 'src/app/modules/gestion-matricula-academica/services/matricula-reporte.service';
import { take } from 'rxjs/operators';

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
        private menuService: MenuService,
        private readonly reportFormatDialog: ReportFormatDialogService,
        private readonly matriculaReporteService: MatriculaReporteService,
        private readonly messageService: MessageService
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

        // Comandos para items que no deben navegar a una ruta.
        this.applyToMenuItem(
            this.items,
            (it) => it.id === 'reporte-matricula-estudiantes',
            (it) => {
                it.command = () => this.abrirReporteMatriculaEstudiantes();
            }
        );

        if (this.autenticacion.isLoggedIn()) {
            const user = this.autenticacion.getLoggedInUser();
            // Asignar routerLink dinámico a Evaluación Docente si existe el usuario y la opción
            if (user && user.idNumber) {
                this.items.forEach((item) => {
                    if (item.label === 'EVALUACIÓN DOCENTE') {
                        item.routerLink = `/gestion-evaluacion-docentes/evaluacion-docente/${user.idNumber}`;
                    }
                });
            }
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
            if (
                item.label === 'GESTIÓN MATRÍCULAS' ||
                item.label === 'GESTIÓN ACADÉMICA'
            ) {
                if (!user) {
                    return false;
                }
                if (item.label === 'GESTIÓN MATRÍCULAS') {
                    if (user.role.includes('ROLE_COORDINADOR')) {
                        item.items = item.items.filter(
                            (subItem) =>
                                subItem.label !== 'Revisión de Matrículas'
                        );
                        return true;
                    }
                    if (user.role.includes('ROLE_DOCENTE')) {
                        item.items = item.items.filter(
                            (subItem) =>
                                subItem.label === 'Revisión de Matrículas'
                        );
                        return true;
                    }
                    return false;
                }
                return user.role.includes('ROLE_COORDINADOR');
            }

            if (item.label === 'EVALUACIÓN DOCENTE') {
                // Solo mostrar si el usuario es estudiante
                return user?.role?.includes('ROLE_ESTUDIANTE');
            }

            return true;
        });
    }

    logout() {
        // Cerrar sesión y reinicializar los elementos del menú
        this.autenticacion.logout();
        this.initializeMenuItems();
    }

    private abrirReporteMatriculaEstudiantes(): void {
        this.reportFormatDialog
            .open({
                title: 'Reporte matricula estudiantes',
                confirmLabel: 'Generar',
                defaultFormat: 'pdf',
            })
            .pipe(take(1))
            .subscribe((formato) => {
                if (!formato) return;
                this.descargarReporteMatriculaEstudiantes(formato);
            });
    }

    private descargarReporteMatriculaEstudiantes(
        formato: MatriculaReporteFormato
    ): void {
        this.matriculaReporteService
            .descargarReporteMatriculaEstudiantes(formato)
            .pipe(take(1))
            .subscribe({
                next: (response) => {
                    const contentDisposition =
                        response.headers.get('content-disposition') ??
                        response.headers.get('Content-Disposition');
                    const nombreArchivo =
                        this.obtenerNombreArchivo(contentDisposition) ??
                        this.nombreArchivoConFecha(formato);
                    if (!response.body) {
                        console.error(
                            '[reporte-matricula-estudiantes] Respuesta vacia',
                            response
                        );
                        return;
                    }
                    const url = globalThis.URL.createObjectURL(response.body);
                    const enlace = document.createElement('a');
                    enlace.href = url;
                    enlace.download = nombreArchivo;
                    enlace.click();
                    globalThis.URL.revokeObjectURL(url);
                },
                error: (err) => {
                    void this.mostrarErrorBackend(
                        'No se pudo generar el reporte',
                        err
                    );
                },
            });
    }

    private async mostrarErrorBackend(
        resumen: string,
        err: unknown
    ): Promise<void> {
        const detail = await this.extraerMensajeError(err);
        this.messageService.add({
            key: 'global',
            severity: 'error',
            summary: resumen,
            detail,
            life: 9000,
        });
        console.error('[reporte-matricula-estudiantes] Error', err);
    }

    private async extraerMensajeError(err: any): Promise<string> {
        const fallback = 'Ocurrió un error inesperado.';
        if (!err) return fallback;

        const e = err?.error;

        if (typeof e === 'string' && e.trim().length > 0) {
            return e;
        }

        if (e && typeof e === 'object' && !(e instanceof Blob)) {
            return (
                e.message ||
                e.mensaje ||
                e.error ||
                e.detail ||
                err.message ||
                fallback
            );
        }

        if (e instanceof Blob) {
            try {
                const text = await e.text();
                if (!text || text.trim().length === 0) {
                    return err.message || fallback;
                }
                try {
                    const json = JSON.parse(text);
                    return (
                        json.message ||
                        json.mensaje ||
                        json.error ||
                        json.detail ||
                        text
                    );
                } catch {
                    return text;
                }
            } catch {
                return err.message || fallback;
            }
        }

        return err.message || fallback;
    }

    private obtenerNombreArchivo(
        contentDisposition?: string | null
    ): string | null {
        if (!contentDisposition) return null;
        // Soporta filename="a.pdf" y filename*=UTF-8''a.pdf
        const filenameStar = contentDisposition.match(
            /filename\*=(?:UTF-8'')?([^;]+)/i
        );
        const filenameBasic = contentDisposition.match(/filename=([^;]+)/i);
        const raw = (filenameStar?.[1] ?? filenameBasic?.[1] ?? '').trim();
        if (!raw) return null;
        const unquoted = raw.replace(/^"|"$/g, '');
        try {
            return decodeURIComponent(unquoted);
        } catch {
            return unquoted;
        }
    }

    private nombreArchivoConFecha(formato: MatriculaReporteFormato): string {
        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const fecha = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(
            d.getDate()
        )}`;
        const hora = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(
            d.getSeconds()
        )}`;
        const ext = formato === 'xlsx' ? 'xlsx' : 'pdf';
        return `reporte_matricula_estudiantes_${fecha}_${hora}.${ext}`;
    }

    private applyToMenuItem(
        items: MenuItem[] | undefined,
        predicate: (item: MenuItem) => boolean,
        apply: (item: MenuItem) => void
    ): void {
        if (!items || items.length === 0) return;
        for (const item of items) {
            if (predicate(item)) {
                apply(item);
            }
            if (item.items?.length) {
                this.applyToMenuItem(item.items, predicate, apply);
            }
        }
    }
}
