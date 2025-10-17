import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { MaterialApoyo } from '../../models/material-apoyo';
import { MaterialApoyoService } from '../../services/material-apoyo.service';
import { Subscription } from 'rxjs';
import { mapResponseException } from 'src/app/core/utils/exception-util';

@Component({
    selector: 'app-gestion-material-apoyo',
    templateUrl: './gestion-material-apoyo.component.html',
    styleUrls: ['./gestion-material-apoyo.component.scss'],
})
export class GestionMaterialApoyoComponent implements OnInit, OnDestroy {
    loading: boolean = false;
    materialesApoyo: MaterialApoyo[] = [];
    displayDialog: boolean = false;
    materialApoyo: MaterialApoyo = this.initializeMaterialApoyo();
    isNewMaterial: boolean = true;
    submitted: boolean = false;

    readonly MAX_DESCRIPTION: number = 255;
    descriptionLength: number = 0;
    private descriptionTruncatedNotified: boolean = false;

    private readonly subscriptions: Subscription[] = [];

    constructor(
        private readonly breadcrumbService: BreadcrumbService,
        private readonly materialApoyoService: MaterialApoyoService,
        private readonly messageService: MessageService,
        private readonly confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.setBreadcrumb();
        this.listMaterialApoyo();
    }

    // Actualiza el contador de caracteres y asegura maxlength
    onDescripcionChange(value: string = '') {
        if (value.length > this.MAX_DESCRIPTION) {
            // recortar y actualizar el modelo
            this.materialApoyo.descripcion = value.substring(
                0,
                this.MAX_DESCRIPTION
            );
            this.descriptionLength = this.MAX_DESCRIPTION;

            // notificar al usuario sólo una vez por recorte continuo
            if (!this.descriptionTruncatedNotified) {
                // Notificar recorte al usuario
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Aviso',
                    detail: `El texto fue recortado a ${this.MAX_DESCRIPTION} caracteres.`,
                    life: 3000,
                });
                this.descriptionTruncatedNotified = true;

                // resetear la notificación después de 2s para permitir futuras notificaciones
                setTimeout(() => {
                    this.descriptionTruncatedNotified = false;
                }, 2000);
            }
        } else {
            this.descriptionLength = value.length;
            this.materialApoyo.descripcion = value;
        }
    }

    // Maneja el evento paste para detectar pegado de texto mayor al máximo permitido
    onDescripcionPaste(event: ClipboardEvent) {
        const clipboardData =
            event.clipboardData || (globalThis as any).clipboardData;
        const pastedText = clipboardData ? clipboardData.getData('text') : '';
        if (!pastedText) {
            return;
        }

        // Si el texto pegado excede el límite, evitamos que el navegador lo pegue completo
        if (pastedText.length > this.MAX_DESCRIPTION) {
            event.preventDefault();
            // Pegar solo la porción permitida y actualizar modelo/contador
            const toPaste = pastedText.substring(0, this.MAX_DESCRIPTION);
            this.materialApoyo.descripcion = toPaste;
            this.descriptionLength = toPaste.length;

            // notificar al usuario
            this.messageService.add({
                severity: 'warn',
                summary: 'Aviso',
                detail: `El texto fue recortado a ${this.MAX_DESCRIPTION} caracteres.`,
                life: 3000,
            });
        }
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            if (subscription && !subscription.closed) {
                subscription.unsubscribe();
            }
        }
    }

    setBreadcrumb() {
        this.breadcrumbService.setItems([
            { label: 'Gestión' },
            { label: 'Matrícula Académica' },
            { label: 'Material de Apoyo' },
        ]);
    }

    initializeMaterialApoyo(): MaterialApoyo {
        return {
            nombre: '',
            descripcion: '',
            enlace: '',
            estado: 'ACTIVO',
        };
    }

    listMaterialApoyo() {
        this.loading = true;

        const subscription = this.materialApoyoService
            .listMaterialApoyo()
            .subscribe({
                next: (response) => {
                    if (response.typeResponse === 'SUCCESS') {
                        this.materialesApoyo = response.data;
                    }
                },
                error: (err) =>
                    this.handleError(err, 'Error al cargar material de apoyo'),
                complete: () => {
                    this.loading = false;
                },
            });
        this.subscriptions.push(subscription);
    }

    showDialog() {
        this.materialApoyo = this.initializeMaterialApoyo();
        this.isNewMaterial = true;
        this.displayDialog = true;
        this.submitted = false;
        this.descriptionLength = this.materialApoyo.descripcion?.length || 0;
    }

    onEditar(id: number) {
        const subscription = this.materialApoyoService
            .getMaterialApoyo(id)
            .subscribe({
                next: (data) => {
                    this.materialApoyo = { ...data };
                    this.isNewMaterial = false;
                    this.displayDialog = true;
                    this.submitted = false;
                    this.descriptionLength =
                        this.materialApoyo.descripcion?.length || 0;
                },
                error: (err) =>
                    this.handleError(
                        err,
                        'Error al cargar el material de apoyo'
                    ),
            });
        this.subscriptions.push(subscription);
    }

    onSave() {
        this.submitted = true;

        if (
            !this.materialApoyo.nombre ||
            this.materialApoyo.nombre.trim() === '' ||
            !this.materialApoyo.enlace ||
            this.materialApoyo.enlace.trim() === ''
        ) {
            return;
        }

        if (this.isNewMaterial) {
            this.createMaterialApoyo();
        } else {
            this.updateMaterialApoyo();
        }
    }

    onCancel() {
        this.displayDialog = false;
        this.submitted = false;
    }

    onDelete(event: any, id: number) {
        this.confirmationService.confirm({
            target: event.target!,
            message:
                '¿Está seguro de que desea eliminar este material de apoyo?',
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'No',
            accept: () => this.deleteMaterialApoyo(id),
        });
    }

    abrirEnlace(enlace: string) {
        if (enlace) {
            window.open(enlace, '_blank');
        }
    }

    private createMaterialApoyo() {
        const subscription = this.materialApoyoService
            .createMaterialApoyo(this.materialApoyo)
            .subscribe({
                next: (response) => {
                    if (response.typeResponse === 'SUCCESS') {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: response.message,
                        });
                        this.displayDialog = false;
                        this.listMaterialApoyo();
                    }
                },
                error: (err) =>
                    this.handleError(
                        err,
                        'Error al crear el material de apoyo'
                    ),
            });
        this.subscriptions.push(subscription);
    }

    private updateMaterialApoyo() {
        const subscription = this.materialApoyoService
            .updateMaterialApoyo(this.materialApoyo.id || 0, this.materialApoyo)
            .subscribe({
                next: (response) => {
                    if (response.typeResponse === 'SUCCESS') {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: response.message,
                        });
                        this.displayDialog = false;
                        this.listMaterialApoyo();
                    }
                },
                error: (err) =>
                    this.handleError(
                        err,
                        'Error al actualizar el material de apoyo'
                    ),
            });
        this.subscriptions.push(subscription);
    }

    private deleteMaterialApoyo(id: number) {
        const subscription = this.materialApoyoService
            .deleteMaterialApoyo(id)
            .subscribe({
                next: (response) => {
                    if (response.typeResponse === 'SUCCESS') {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: response.message,
                        });
                        this.listMaterialApoyo();
                    }
                },
                error: (err) =>
                    this.handleError(
                        err,
                        'Error al eliminar el material de apoyo'
                    ),
            });
        this.subscriptions.push(subscription);
    }

    private handleError(error: any, defaultMessage: string) {
        const errorMsg = mapResponseException(error) || defaultMessage;
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: typeof errorMsg === 'string' ? errorMsg : defaultMessage,
        });
    }
}
