import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class MenuService {
    private menuSource = new Subject<string>();
    private resetSource = new Subject();
    private alertLogin = new Subject<void>();

    menuSource$ = this.menuSource.asObservable();
    resetSource$ = this.resetSource.asObservable();
    alertLogin$ = this.alertLogin.asObservable();

    onMenuStateChange(key: string) {
        this.menuSource.next(key);
    }

    reset() {
        this.resetSource.next(true);
    }

    emitAlertLogin() {
        this.alertLogin.next();
    }
}
