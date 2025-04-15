import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';
import { MessageService } from 'primeng/api';

@Injectable({
    providedIn: 'root',
})
export class RoleGuard implements CanActivate {
    constructor(
        private autenticacion: AutenticacionService,
        private router: Router,
        private messageService: MessageService
    ) {}

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const expectedRoles = route.data['expectedRole'];
        const userRoles = this.autenticacion.getRole();

        if (!expectedRoles.some((role) => userRoles.includes(role))) {
            // Agrega un mensaje de advertencia
            this.messageService.add({
                severity: 'warn',
                summary: 'Acceso denegado',
                detail: 'No tienes el rol requerido para acceder a esta página.',
            });

            // Redirige a la página principal
            this.router.navigate(['']);
            return false;
        }
        return true;
    }
}
