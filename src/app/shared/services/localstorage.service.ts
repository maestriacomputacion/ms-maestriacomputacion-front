import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    saveLocalStorage(obj: any, key: string) {
        localStorage.setItem(key, JSON.stringify(obj));
    }

    clearLocalStorage(key: string) {
        localStorage.removeItem(key);
    }

    getLocalStorage(key: string): any {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : null;
    }
}
