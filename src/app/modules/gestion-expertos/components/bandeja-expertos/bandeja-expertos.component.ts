import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService, PrimeIcons } from 'primeng/api';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { Mensaje, TipoRol } from 'src/app/core/enums/enums';
import { infoMessage } from 'src/app/core/utils/message-util';
import { ExpertoService } from '../../services/experto.service';
import { Experto } from '../../models/experto';
import { excludedKeys, fieldMap } from '../../utils/fieldmap';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-bandeja-expertos',
    templateUrl: './bandeja-expertos.component.html',
    styleUrls: ['./bandeja-expertos.component.scss'],
})
export class BandejaExpertosComponent implements OnInit {
    loading: boolean = false;
    expertos: Experto[] = [];
    displayDialog: boolean = false;
    expertoSeleccionado: any = null;
    fieldMap = fieldMap;
    excludedKeys = excludedKeys;
    mostrarInactivosFlag: boolean = true; // Mostrar activos por defecto

    private subscriptions: Subscription[] = [];

    constructor(
        private breadcrumbService: BreadcrumbService,
        private expertoService: ExpertoService,
        private messageService: MessageService,
        private router: Router,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.setBreadcrumb();
        this.listExpertos();
    }

    ngOnDestroy(): void {
        // Desuscribirse de todas las suscripciones
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    listExpertos() {
        this.loading = true;
        this.expertoService.listExpertos().subscribe({
            next: (response) => {
                this.expertos = response.filter(
                    (experto) =>
                        experto.estado ===
                        (this.mostrarInactivosFlag ? 'ACTIVO' : 'INACTIVO')
                );
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los expertos',
                });
            },
            complete: () => (this.loading = false),
        });
    }

    setBreadcrumb() {
        this.breadcrumbService.setItems([
            { label: 'Gestión' },
            { label: 'Expertos' },
        ]);
    }

    onRegistrarExperto() {
        this.router.navigate(['expertos/registrar']);
    }

    onEditar(id: number) {
        this.router.navigate(['expertos/editar', id]);
    }

    onDelete(event: any, id: number) {
        this.confirmAction(event, TipoRol.CONFIRMAR_DESACTIVAR_EXPERTO, () =>
            this.deleteExperto(id)
        );
    }

    deleteExperto(id: number) {
        this.expertoService.deleteExperto(id).subscribe({
            next: () => {
                this.messageService.add(
                    infoMessage(TipoRol.EXPERTO_DESACTIVADO_CORRECTAMENTE)
                );
                this.listExpertos();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al desactivar el experto',
                });
            },
        });
    }

    onCargaExitosa() {
        this.listExpertos();
    }

    onPrevisualizar(experto: any) {
        this.expertoSeleccionado = experto;
        this.displayDialog = true;
    }

    mostrarInactivos() {
        this.mostrarInactivosFlag = !this.mostrarInactivosFlag;
        this.listExpertos();
    }

    cambiarEstado(event: any, experto: Experto, nuevoEstado: string) {
        this.confirmAction(
            event,
            TipoRol.ESTADO_EXPERTO_ACTUALIZADO_CORRECTAMENTE,
            () => this.cambiarEstadoExperto(experto, nuevoEstado)
        );
    }

    cambiarEstadoExperto(experto: Experto, nuevoEstado: string) {
        this.expertoService
            .cambiarEstadoExperto(experto.id!, nuevoEstado)
            .subscribe({
                next: () => {
                    this.listExpertos();
                    this.messageService.add(
                        infoMessage(
                            `Experto ${
                                nuevoEstado === 'ACTIVO'
                                    ? 'habilitado'
                                    : 'deshabilitado'
                            } correctamente`
                        )
                    );
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al cambiar el estado del experto',
                    });
                },
            });
    }

    getKeys(obj: any, prefix: string = ''): any[] {
        let keys: any[] = [];

        for (const [key, value] of Object.entries(obj)) {
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (this.isExcludedKey(newKey)) continue;

            keys = keys.concat(this.processKey(newKey, value));
        }

        return keys;
    }

    isExcludedKey(key: string): boolean {
        return excludedKeys.some((excludedKey) => key.endsWith(excludedKey));
    }

    processKey(key: string, value: any): any[] {
        if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
        ) {
            return this.getKeys(value, key);
        } else if (Array.isArray(value)) {
            return value.reduce(
                (acc, item, index) =>
                    acc.concat(this.getKeys(item, `${key}.${index}`)),
                []
            );
        } else {
            return [
                {
                    key: this.fieldMap[key] || this.formatKey(key),
                    value: value,
                },
            ];
        }
    }

    formatKey(key: string): string {
        const displayKey = key.split('.').pop();
        return displayKey
            ? displayKey.charAt(0).toUpperCase() + displayKey.slice(1)
            : '';
    }

    confirmAction(event: any, message: string, acceptCallback: () => void) {
        this.confirmationService.confirm({
            target: event.target,
            message: message,
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            accept: acceptCallback,
        });
    }
}
