import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { MaterialApoyo } from '../../../models/material-apoyo';
import { MaterialApoyoService } from '../../../services/material-apoyo.service';
import { mapResponseException } from 'src/app/core/utils/exception-util';

@Component({
    selector: 'app-gestion-material-apoyo',
    templateUrl: './gestion-material-apoyo.component.html',
    styleUrls: ['./gestion-material-apoyo.component.scss'],
})
export class GestionMaterialApoyoComponent implements OnInit, OnDestroy {
    loading = false;
    materialesApoyo: MaterialApoyo[] = [];
    displayDialog = false;
    materialApoyo: MaterialApoyo = this.initializeMaterialApoyo();
    isNewMaterial = true;
    submitted = false;

    readonly MAX_DESCRIPTION = 255;
    descriptionLength = 0;

    private descriptionTruncatedNotified = false;
    private readonly destroy$ = new Subject<void>();

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

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onDescripcionChange(value: string = ''): void {
        if (value.length > this.MAX_DESCRIPTION) {
            this.materialApoyo.descripcion = value.substring(
                0,
                this.MAX_DESCRIPTION
            );
            this.descriptionLength = this.MAX_DESCRIPTION;

            if (!this.descriptionTruncatedNotified) {
                this.mostrarAdvertenciaRecorte();
                this.descriptionTruncatedNotified = true;

                setTimeout(() => {
                    this.descriptionTruncatedNotified = false;
                }, 2000);
            }
        } else {
            this.descriptionLength = value.length;
            this.materialApoyo.descripcion = value;
        }
    }

    onDescripcionPaste(event: ClipboardEvent): void {
        const legacyClipboard = (globalThis as { clipboardData?: DataTransfer })
            .clipboardData;
        const clipboardData = event.clipboardData || legacyClipboard;
        const pastedText = clipboardData ? clipboardData.getData('text') : '';
        if (!pastedText) return;

        if (pastedText.length > this.MAX_DESCRIPTION) {
            event.preventDefault();
            const toPaste = pastedText.substring(0, this.MAX_DESCRIPTION);
            this.materialApoyo.descripcion = toPaste;
            this.descriptionLength = toPaste.length;
            this.mostrarAdvertenciaRecorte();
        }
    }

    showDialog(): void {
        this.materialApoyo = this.initializeMaterialApoyo();
        this.isNewMaterial = true;
        this.displayDialog = true;
        this.submitted = false;
        this.descriptionLength = this.materialApoyo.descripcion?.length || 0;
    }

    onEditar(id: number): void {
        this.materialApoyoService
            .getMaterialApoyo(id)
            .pipe(takeUntil(this.destroy$))
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
    }

    onSave(): void {
        this.submitted = true;

        if (!this.isFormValid()) {
            return;
        }

        if (this.isNewMaterial) {
            this.createMaterialApoyo();
        } else {
            this.updateMaterialApoyo();
        }
    }

    onCancel(): void {
        this.displayDialog = false;
        this.submitted = false;
    }

    onDelete(event: Event, id: number): void {
        this.confirmationService.confirm({
            target: event.target as HTMLElement,
            message:
                '¿Está seguro de que desea eliminar este material de apoyo?',
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'No',
            accept: () => this.deleteMaterialApoyo(id),
        });
    }

    abrirEnlace(enlace: string): void {
        if (enlace) {
            window.open(enlace, '_blank');
        }
    }

    private setBreadcrumb(): void {
        this.breadcrumbService.setItems([
            { label: 'Gestión' },
            { label: 'Matrícula Académica' },
            { label: 'Material de Apoyo' },
        ]);
    }

    private initializeMaterialApoyo(): MaterialApoyo {
        return {
            nombre: '',
            descripcion: '',
            enlace: '',
            estado: 'ACTIVO',
        };
    }

    private listMaterialApoyo(): void {
        this.loading = true;

        this.materialApoyoService
            .listMaterialApoyo()
            .pipe(takeUntil(this.destroy$))
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
    }

    private createMaterialApoyo(): void {
        this.materialApoyoService
            .createMaterialApoyo(this.materialApoyo)
            .pipe(takeUntil(this.destroy$))
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
    }

    private updateMaterialApoyo(): void {
        this.materialApoyoService
            .updateMaterialApoyo(this.materialApoyo.id || 0, this.materialApoyo)
            .pipe(takeUntil(this.destroy$))
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
    }

    private deleteMaterialApoyo(id: number): void {
        this.materialApoyoService
            .deleteMaterialApoyo(id)
            .pipe(takeUntil(this.destroy$))
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
    }

    private isFormValid(): boolean {
        return !!(
            this.materialApoyo.nombre &&
            this.materialApoyo.nombre.trim() !== '' &&
            this.materialApoyo.enlace &&
            this.materialApoyo.enlace.trim() !== ''
        );
    }

    private mostrarAdvertenciaRecorte(): void {
        this.messageService.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: `El texto fue recortado a ${this.MAX_DESCRIPTION} caracteres.`,
            life: 3000,
        });
    }

    private handleError(error: unknown, defaultMessage: string): void {
        const errorMsg = mapResponseException(error) || defaultMessage;
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: typeof errorMsg === 'string' ? errorMsg : defaultMessage,
        });
    }
}
