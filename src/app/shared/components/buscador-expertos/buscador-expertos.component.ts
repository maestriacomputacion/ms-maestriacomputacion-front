import { Component, OnInit } from '@angular/core';
import { ExpertoService } from '../../services/experto.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';
import { Experto } from 'src/app/modules/gestion-examen-de-valoracion/models/experto';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import { errorMessage } from 'src/app/core/utils/message-util';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-buscador-expertos',
    templateUrl: './buscador-expertos.component.html',
    styleUrls: ['./buscador-expertos.component.scss'],
})
export class BuscadorExpertosComponent implements OnInit {
    expertos: Experto[] = [];
    expertoSeleccionado: Experto;
    loading: boolean;

    constructor(
        private expertoService: ExpertoService,
        private ref: DynamicDialogRef,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.listExpertos();
    }

    listExpertos() {
        this.loading = true;
        this.expertoService
            .listExpertos()
            .subscribe({
                next: (response) => (this.expertos = response),
                error: (error: any) => {
                    this.handlerResponseException(error);
                },
            })
            .add(() => (this.loading = false));

        this.expertoSeleccionado = null;
    }

    filterExpertos(filter: string) {
        if (filter?.trim().length > 0) {
            this.expertoService.listExpertos().subscribe({
                next: (response) => {
                    this.expertos = response.filter((e) =>
                        e.nombre.includes(filter.trim())
                    );
                },
                error: (error: any) => {
                    this.handlerResponseException(error);
                },
            });
        }
    }

    onCancel() {
        this.ref.close();
    }

    onSeleccionar() {
        if (this.expertoSeleccionado) {
            this.ref.close(this.expertoSeleccionado);
        }
    }

    onRegistrar() {
        this.ref.close();
        this.router.navigate(['expertos/registrar']);
    }

    handlerResponseException(response: any) {
        if (response.status != 501) return;
        const mapException = mapResponseException(response.error);
        mapException.forEach((value, _) => {
            this.messageService.add(errorMessage(value));
        });
    }
}
