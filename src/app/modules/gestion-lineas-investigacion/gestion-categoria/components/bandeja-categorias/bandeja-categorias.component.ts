import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { Categoria } from '../../models/categoria';
import { CategoriaService } from '../../services/categoria.service';
import { infoMessage } from 'src/app/core/utils/message-util';
import { Mensaje, TipoRol } from 'src/app/core/enums/enums';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-bandeja-categorias',
    templateUrl: './bandeja-categorias.component.html',
    styleUrls: ['./bandeja-categorias.component.scss'],
})
export class BandejaCategoriasComponent implements OnInit {
    categorias: Categoria[] = [];
    loading: boolean = false;
    displayDialog: boolean = false;
    categoria: Categoria = this.initializeCategoria();
    isNewCategoria: boolean = true;
    mostrarInactivasFlag: boolean = true;

    private subscriptions: Subscription[] = [];

    constructor(
        private breadcrumbService: BreadcrumbService,
        private messageService: MessageService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private categoriaService: CategoriaService
    ) {}

    ngOnInit(): void {
        this.listCategorias();
        this.setBreadcrumb();
    }
    ngOnDestroy(): void {
        // Desuscribirse de todas las suscripciones
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    listCategorias() {
        this.loading = true;
        this.categoriaService.listCategorias().subscribe({
            next: (response) => {
                this.categorias = response.filter(
                    (d) =>
                        d.estado ===
                        (this.mostrarInactivasFlag ? 'ACTIVO' : 'INACTIVO')
                );
            },
            error: (err) => this.handleError(err, 'Error al cargar categorías'),
            complete: () => {
                this.loading = false;
            },
        });
    }

    showDialog() {
        this.categoria = this.initializeCategoria();
        this.isNewCategoria = true;
        this.displayDialog = true;
    }

    onEditar(id: number) {
        this.categoriaService.getCategoria(id).subscribe({
            next: (data) => {
                this.categoria = { ...data };
                this.isNewCategoria = false;
                this.displayDialog = true;
            },
            error: (err) => this.handleError(err, 'Error al cargar la categoría'),
        });
    }

    onSave() {
        if (this.isNewCategoria) {
            this.createCategoria();
        } else {
            this.updateCategoria();
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
            accept: () => this.deleteCategoria(id),
        });
    }

    deleteCategoria(id: number) {
        this.categoriaService.deleteCategoria(id).subscribe({
            next: () => {
                this.messageService.add(
                    infoMessage(TipoRol.CATEGORIA_DESACTIVADA_CORRECTAMENTE)
                );
                this.listCategorias();
            },
            error: (err) => this.handleError(err, 'Error al eliminar categoría'),
        });
    }

    cambiarEstado(event: any, categoria: Categoria, nuevoEstado: string) {
        this.confirmationService.confirm({
            target: event.target,
            message: TipoRol.ESTADO_CATEGORIA_ACTUALIZADO_CORRECTAMENTE,
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            accept: () => this.cambiarEstadoCategoria(categoria, nuevoEstado),
        });
    }

    cambiarEstadoCategoria(categoria: Categoria, nuevoEstado: string) {
        this.categoriaService.cambiarEstadoCategoria(categoria.id!, nuevoEstado).subscribe({
            next: () => {
                this.messageService.add(
                    infoMessage(
                        `Categoria ${
                            nuevoEstado === 'ACTIVO'
                                ? 'habilitada'
                                : 'deshabilitada'
                        } correctamente`
                    )
                );
                this.listCategorias();
            },
            error: (err) => this.handleError(err, 'Error al cambiar el estado de la categoría'),
        });
    }

    setBreadcrumb() {
        this.breadcrumbService.setItems([
            { label: 'Gestión' },
            { label: 'Categorías' },
        ]);
    }

    private initializeCategoria(): Categoria {
        return { nombre: '', descripcion: '' };
    }

    private createCategoria() {
        this.categoriaService.createCategoria(this.categoria).subscribe({
            next: (data) => {
                this.categorias.push(data);
                this.displayDialog = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Categoría agregada con éxito',
                });
                this.listCategorias();
            },
            error: (err) => this.handleError(err, 'Error al agregar categoría'),
        });
    }

    private updateCategoria() {
        this.categoriaService.updateCategoria(this.categoria.id!, this.categoria).subscribe({
            next: (data) => {
                const index = this.categorias.findIndex(
                    (categoria) => categoria.id === data.id
                );
                if (index !== -1) {
                    this.categorias[index] = data;
                }
                this.displayDialog = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Categoría actualizada con éxito',
                });
                this.listCategorias();
            },
            error: (err) => this.handleError(err, 'Error al actualizar categoría'),
        });
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
