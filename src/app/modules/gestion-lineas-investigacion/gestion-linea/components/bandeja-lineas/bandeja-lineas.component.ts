import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { Linea } from '../../models/linea';
import { LineaService } from '../../services/linea.service';
import { Categoria } from '../../models/categoria';
import { CategoriaService } from '../../../gestion-categoria/services/categoria.service';
import { Mensaje, TipoRol } from 'src/app/core/enums/enums';
import { infoMessage } from 'src/app/core/utils/message-util';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-bandeja-lineas',
    templateUrl: './bandeja-lineas.component.html',
    styleUrls: ['./bandeja-lineas.component.scss'],
})
export class BandejaLineasComponent implements OnInit {
    lineas: Linea[] = [];
    categorias: Categoria[] = [];
    loading: boolean = false;
    displayDialog: boolean = false;
    linea: Linea = this.initializeLinea();
    isNew: boolean = true;
    mostrarInactivasFlag: boolean = true;

    private subscriptions: Subscription[] = [];

    constructor(
        private breadcrumbService: BreadcrumbService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private lineaService: LineaService,
        private categoriaService: CategoriaService
    ) {}

    ngOnInit(): void {
        this.listLineas();
        this.listCategorias();
        this.setBreadcrumb();
    }

    ngOnDestroy(): void {
        // Desuscribirse de todas las suscripciones
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    listLineas() {
        this.loading = true;
        this.lineaService.listLineas().subscribe({
            next: (response) => {
                this.lineas = response.filter(
                    (d) =>
                        d.estado ===
                        (this.mostrarInactivasFlag ? 'ACTIVO' : 'INACTIVO')
                );
            },
            error: (err) => this.handleError(err, 'Error al cargar líneas'),
            complete: () => {
                this.loading = false;
            },
        });
    }

    listCategorias() {
        this.categoriaService.listCategorias().subscribe({
            next: (data: Categoria[]) => {
                this.categorias = data;
            },
            error: (err) => this.handleError(err, 'Error al cargar categorías'),
        });
    }

    showDialog() {
        this.linea = this.initializeLinea();
        this.isNew = true;
        this.displayDialog = true;
    }

    onEditar(id: number) {
        this.lineaService.getLinea(id).subscribe({
            next: (data) => {
                this.linea = { ...data };
                this.linea.idCategoria = data.categoria?.id || null;
                this.isNew = false;
                this.displayDialog = true;
            },
            error: (err) => this.handleError(err, 'Error al cargar la línea'),
        });
    }

    onSave() {
        if (this.isNew) {
            this.createLinea();
        } else {
            this.updateLinea();
        }
    }

    onCancel() {
        this.displayDialog = false;
    }

    onDelete(event: any, id: number) {
        this.confirmationService.confirm({
            target: event.target!,
            message: TipoRol.CONFIRMAR_DESACTIVAR_CATEGORIA,
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'No',
            accept: () => this.deleteLinea(id),
        });
    }

    deleteLinea(id: number) {
        this.lineaService.deleteLinea(id).subscribe({
            next: () => {
                this.messageService.add(
                    infoMessage(TipoRol.LINEA_DESACTIVADA_CORRECTAMENTE)
                );
                this.listLineas();
            },
        });
    }

    cambiarEstado(event: any, linea: Linea, nuevoEstado: string) {
        this.confirmationService.confirm({
            target: event.target,
            message: TipoRol.ESTADO_LINEA_ACTUALIZADO_CORRECTAMENTE,
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            accept: () => this.cambiarEstadoLinea(linea, nuevoEstado),
        });
    }

    cambiarEstadoLinea(linea: Linea, nuevoEstado: string) {
        this.lineaService.cambiarEstadoLinea(linea.id!, nuevoEstado).subscribe({
            next: () => {
                this.messageService.add(
                    infoMessage(
                        `Línea ${
                            nuevoEstado === 'ACTIVO'
                                ? 'habilitada'
                                : 'deshabilitada'
                        } correctamente`
                    )
                );
                this.listLineas();
            },
        });
    }

    setBreadcrumb() {
        this.breadcrumbService.setItems([
            { label: 'Gestión' },
            { label: 'Líneas de Investigación' },
        ]);
    }

    private initializeLinea(): Linea {
        return { titulo: '', idCategoria: null, descripcion: '' };
    }

    private createLinea() {
        this.lineaService.createLinea(this.linea).subscribe({
            next: (data) => {
                this.assignCategoriaToLinea(data);
                this.lineas.push(data);
                this.displayDialog = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Línea agregada con éxito',
                });
                this.listLineas();
            },
            error: (err) => this.handleError(err, 'Error al agregar línea'),
        });
    }

    private updateLinea() {
        this.lineaService.updateLinea(this.linea.id!, this.linea).subscribe({
            next: (data) => {
                const index = this.lineas.findIndex(
                    (linea) => linea.id === data.id
                );
                if (index !== -1) {
                    this.assignCategoriaToLinea(data);
                    this.lineas[index] = data;
                }
                this.displayDialog = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Línea actualizada con éxito',
                });
                this.listLineas();
            },
            error: (err) => this.handleError(err, 'Error al actualizar línea'),
        });
    }

    private assignCategoriaToLinea(linea: Linea) {
        const categoria = this.categorias.find(
            (cat) => cat.id === this.linea.idCategoria
        );
        if (categoria) {
            linea.categoria = categoria;
        }
    }

    private handleError(error: any, detail: string) {
        console.error(error);
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: detail,
        });
    }
}
