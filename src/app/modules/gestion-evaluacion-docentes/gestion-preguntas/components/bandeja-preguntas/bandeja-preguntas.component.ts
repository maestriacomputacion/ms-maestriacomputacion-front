import { Component, OnInit } from '@angular/core';
import { Pregunta } from '../../models/pregunta';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { PreguntaService } from '../../services/pregunta.service';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { Mensaje } from 'src/app/core/enums/enums';
import { Subscription } from 'rxjs';


@Component({
    selector: 'app-bandeja-preguntas',
    templateUrl: './bandeja-preguntas.component.html',
    styleUrls: ['./bandeja-preguntas.component.scss'],
})
export class BandejaPreguntasComponent implements OnInit {
    loading: boolean = false;
    preguntas: Pregunta[] = [];
    displayDialog: boolean = false;
    isNewPregunta: boolean = true;
    mostrarInactivasFlag: boolean = true;
    pregunta: Pregunta = this.initializePregunta();

    private subscriptions: Subscription[] = [];

    constructor(
        private breadcrumbService: BreadcrumbService,
        private preguntaService: PreguntaService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.setBreadcrumb();
        this.loadPreguntas();
    }

    ngOnDestroy(): void {
        // Desuscribirse de todas las suscripciones
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    setBreadcrumb() {
        this.breadcrumbService.setItems([
            { label: 'Gestión' },
            { label: 'Preguntas' },
        ]);
    }

    loadPreguntas() {
        this.loading = true;
        this.subscriptions.push(
            this.preguntaService.listPreguntas().subscribe({
                next: (response) => this.filterPreguntas(response),
                error: (err) => this.handleError(err, 'Error al cargar preguntas'),
                complete: () => (this.loading = false),
            })
        );
    }

    filterPreguntas(preguntas: Pregunta[]) {
        this.preguntas = preguntas.filter(
            (d) =>
                d.estado === (this.mostrarInactivasFlag ? 'ACTIVO' : 'INACTIVO')
        );
    }

    showDialog() {
        this.resetPregunta();
        this.isNewPregunta = true;
        this.displayDialog = true;
    }

    onCancel() {
        this.displayDialog = false;
    }

    onSave() {
        this.isNewPregunta ? this.createPregunta() : this.updatePregunta();
    }

    onEdit(id: number) {
        this.subscriptions.push(
            this.preguntaService.getPregunta(id).subscribe({
                next: (data) => this.editPregunta(data),
                error: (err) => this.handleError(err, 'Error al cargar la pregunta'),
            })
        );
    }

    onDelete(event: any, id: number) {
        this.confirmationService.confirm({
            target: event.target!,
            message: Mensaje.CONFIRMAR_DESACTIVAR_PREGUNTA,
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Sí, desactivar',
            rejectLabel: 'No',
            accept: () => this.deletePregunta(id),
        });
    }

    changeEstado(event: any, pregunta: Pregunta, nuevoEstado: string) {
        this.confirmationService.confirm({
            target: event.target,
            message: Mensaje.ESTADO_PREGUNTA_ACTUALIZADO_CORRECTAMENTE,
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => this.updatePreguntaEstado(pregunta, nuevoEstado),
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

    private initializePregunta(): Pregunta {
        return {
            nombre: '',
            observacion: '',
        };
    }

    private resetPregunta() {
        this.pregunta = this.initializePregunta();
    }

    private createPregunta() {
        this.subscriptions.push(
            this.preguntaService.createPregunta(this.pregunta).subscribe({
                next: (data) => this.onPreguntaCreated(data),
                error: (err) => this.handleError(err, 'Error al agregar la pregunta'),
            })
        );
    }

    private updatePregunta() {
        this.subscriptions.push(
            this.preguntaService
                .updatePregunta(this.pregunta.id!, this.pregunta)
                .subscribe({
                    next: (data) => this.onPreguntaUpdated(data),
                    error: (err) => this.handleError(err, 'Error al actualizar la pregunta'),
                })
        );
    }

    private deletePregunta(id: number) {
        this.subscriptions.push(
            this.preguntaService.deletePregunta(id).subscribe({
                next: () => this.onPreguntaDeleted(),
                error: (err) => this.handleError(err, 'Error al desactivar la pregunta'),
            })
        );
    }

    private updatePreguntaEstado(pregunta: Pregunta, nuevoEstado: string) {
        this.subscriptions.push(
            this.preguntaService
                .cambiarEstadoPregunta(pregunta.id!, nuevoEstado)
                .subscribe({
                    next: () => this.onEstadoUpdated(nuevoEstado),
                    error: (err) =>
                        this.handleError(
                            err,
                            'Error al cambiar el estado de la pregunta'
                        ),
                })
        );
    }

    private editPregunta(data: Pregunta) {
        this.pregunta = { ...data };
        this.isNewPregunta = false;
        this.displayDialog = true;
    }

    private onPreguntaCreated(data: Pregunta) {
        this.preguntas.push(data);
        this.displayDialog = false;
        this.showMessage('Éxito', 'Pregunta agregada con éxito', 'success');
        this.loadPreguntas();
    }

    private onPreguntaUpdated(data: Pregunta) {
        const index = this.preguntas.findIndex(
            (pregunta) => pregunta.id === data.id
        );
        if (index !== -1) {
            this.preguntas[index] = data;
        }
        this.displayDialog = false;
        this.showMessage('Éxito', 'Pregunta actualizada con éxito', 'success');
        this.loadPreguntas();
    }

    private onPreguntaDeleted() {
        this.showMessage(
            'Éxito',
            Mensaje.PREGUNTA_DESACTIVADA_CORRECTAMENTE,
            'info'
        );
        this.loadPreguntas();
    }

    private onEstadoUpdated(nuevoEstado: string) {
        const estado =
            nuevoEstado === 'ACTIVO' ? 'habilitada' : 'deshabilitada';
        this.showMessage('Éxito', `Pregunta ${estado} correctamente`, 'info');
        this.loadPreguntas();
    }

    private showMessage(summary: string, detail: string, severity: string) {
        this.messageService.add({ severity, summary, detail });
    }
}
