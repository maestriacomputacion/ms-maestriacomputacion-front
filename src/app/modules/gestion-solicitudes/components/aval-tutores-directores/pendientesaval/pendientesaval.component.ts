import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { GestorService } from '../../../services/gestor.service';
import { SolicitudRecibida, TipoSolicitud } from '../../../models/indiceModelos';
import { HttpService } from '../../../services/http.service';
import { RadicarService } from '../../../services/radicar.service';
import { Router } from '@angular/router';
import { UtilidadesService } from '../../../services/utilidades.service';
import { DatePipe } from '@angular/common';
import { AutenticacionService } from 'src/app/modules/gestion-autenticacion/services/autenticacion.service';

@Component({
    selector: 'app-pendientesaval',
    templateUrl: './pendientesaval.component.html',
    styleUrls: ['./pendientesaval.component.scss'],
    providers: [DialogService],
})
export class PendientesavalComponent implements OnInit {
    //correoUsuario: string = 'lsierra@unicauca.edu.co';
    //correoUsuario: string = 'luz123@unicauca.edu.co';
    solicitudes: SolicitudRecibida[] = [];
    seleccionada: SolicitudRecibida;
    cargando: boolean = true;
    buzonVacio: boolean = false;
    solicitudSeleccionada: SolicitudRecibida = {
        idSolicitud: 0,
        codigoSolicitud: '',
        nombreEstudiante: '',
        nombreTipoSolicitud: '',
        abreviatura: '',
        fecha: undefined,
        identificacionSolicitante: '',
    };

    constructor(
        public gestor: GestorService,
        public radicar: RadicarService,
        private router: Router,
        private datePipe: DatePipe,
        public utilidades: UtilidadesService,
        public dialogService: DialogService,
        public http: HttpService,
        private auth: AutenticacionService
    ) {}

    ngOnInit(): void {
        this.gestor.restablecerValores();
        this.cargarSolicitudes();

        /*
        this.gestor.cargarSolicitudes$.subscribe(() => {
            this.cargarSolicitudes();
        });
        */
        this.gestor.restablecerValores();
    }

    cargarSolicitudes() {
        this.gestor.obtenerSolicitudesTutorDirector(this.auth.getLoggedInUser().email).subscribe(
            (solicitudes: SolicitudRecibida[]) => {
                //this.solicitudes = solicitudes;
                this.cargando = false;
                this.buzonVacio = solicitudes.length === 0;
            },
            (error) => {
                console.error('Error al cargar las solicitudes:', error);
            }
        );
    }

    formatearFechaConHora(fecha: string): string {
        const fechaDate = new Date(fecha);
        const fechaActual = new Date();
        const esHoy = this.isSameDay(fechaDate, fechaActual);
        const esAyer = this.isSameDay(fechaDate, new Date(fechaActual.setDate(fechaActual.getDate() - 1)));

        const formatoHora = this.datePipe.transform(fecha, 'h:mm a');
        return esHoy
            ? `Hoy ${formatoHora}`
            : esAyer
            ? `Ayer ${formatoHora}`
            : this.datePipe.transform(fecha, 'dd-MM-yyyy h:mm a') || '';
    }

    private isSameDay(date1: Date, date2: Date): boolean {
        return date1.toDateString() === date2.toDateString();
    }

    // Limpia los filtros de la tabla
    limpiarFiltros(table: any): void {
        table.clear();
    }

    mostrarDetalles() {
        localStorage.setItem('solicitudSeleccionadaTutorDirector', JSON.stringify(this.seleccionada));

        // Navega a VistaComponent pasando la ID de la solicitud seleccionada como parámetro de ruta
        this.router.navigate(['/gestionsolicitudes/avales/pendientes/detalles']);
    }
}
