import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(
        private autenticacion: AutenticacionService,
        private router: Router
    ) {}

    canActivate(): boolean {
        if (this.autenticacion.isLoggedIn()) {
            return true;
        } else {
            this.autenticacion.login();
            return false;
        }
    }
}
