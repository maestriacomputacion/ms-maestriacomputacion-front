import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RadicarService } from '../../services/radicar.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpService } from '../../services/http.service';
import { EventoHistorial, NumeroRadicado } from '../../models/indiceModelos';
import { SeguimientoService } from '../../services/seguimiento.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { UtilidadesService } from '../../services/utilidades.service';
import { PdfService } from '../../services/pdf.service';

@Component({
    selector: 'app-opciones',
    templateUrl: './opciones.component.html',
    styleUrls: ['./opciones.component.scss'],
    providers: [ConfirmationService, MessageService],
})
export class OpcionesComponent implements OnInit {
    radicado: string = '';
    buscandoSolicitud = false;
    urlPdf: SafeResourceUrl; // ELIMINAR CODIGO DE PRUEBA

    constructor(
        private router: Router,
        public http: HttpService,
        public radicar: RadicarService,
        private confirmationService: ConfirmationService,
        public seguimiento: SeguimientoService,
        private messageService: MessageService,
        private utilidades: UtilidadesService,
        private servicioPDF: PdfService
    ) {}

    ngOnInit(): void {
        this.radicar.restrablecerValores();
    }

    cargarPagina() {
        this.router.navigate(['/gestionsolicitudes/portafolio/radicar']);
    }

    buscarSolicitud() {
        if (this.radicado != '') {
            this.buscandoSolicitud = true;
            this.http.consultarHistorialSolicitud(this.radicado.trim()).subscribe((data: EventoHistorial[]) => {
                if (data && data.length > 0) {
                    this.seguimiento.historial = data;
                    this.seguimiento.radicado = this.radicado.toUpperCase();
                    this.buscandoSolicitud = false;
                    this.router.navigate(['/gestionsolicitudes/portafolio/seguimiento/historial']);
                } else {
                    this.buscandoSolicitud = false;
                    this.confirmationService.confirm({
                        message:
                            'La solicitud con número de radicado ' +
                            this.radicado.toUpperCase() +
                            ' no fue encontrada.',
                        header: 'Solicitud no encontrada',
                        icon: 'pi pi-exclamation-circle',
                        acceptLabel: 'Aceptar',
                        rejectVisible: false,
                        accept: () => {
                            this.radicado = '';
                        },
                        reject: () => {
                            this.radicado = '';
                        },
                    });
                }
            });
        } else {
            this.showWarn();
        }
    }

    showWarn() {
        this.messageService.add({
            severity: 'warn',
            summary: 'Radicado requerido',
            detail: 'Ingrese el número de radicado',
        });
    }
}
