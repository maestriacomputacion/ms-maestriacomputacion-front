import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { GestorService } from '../../../services/gestor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { SolicitudRecibida } from '../../../models/indiceModelos';
import { SeguimientoService } from '../../../services/seguimiento.service';
import { DatePipe } from '@angular/common';

interface ConfiguracionBuzon {
    titulo: string;
    icono: string;
    columnaFecha: string;
}

@Component({
    selector: 'app-buzon',
    templateUrl: './buzon.component.html',
    styleUrls: ['./buzon.component.scss'],
    providers: [DialogService],
})
export class BuzonComponent implements OnInit {
    seleccionada: SolicitudRecibida;

    cargandoSolicitudes: boolean = true;

    tituloBuzon: string;
    iconoBuzon: string;
    columnaFecha: string;

    // Configuraciones de personalización según estado de solicitudes
    private configuraciones: Record<string, ConfiguracionBuzon> = {
        nuevas: {
            titulo: 'Solicitudes nuevas',
            icono: 'pi pi-arrow-down',
            columnaFecha: 'Fecha de recepción',
        },
        rechazadas: {
            titulo: 'Solicitudes rechazadas',
            icono: 'pi pi-times',
            columnaFecha: 'Fecha de rechazo',
        },
        comite: {
            titulo: 'Solicitudes en comite de programa',
            icono: 'pi pi-users',
            columnaFecha: 'Fecha de envio',
        },
        consejo: {
            titulo: 'Solicitudes en consejo de facultad',
            icono: 'pi pi-users',
            columnaFecha: 'Fecha de envio',
        },
        resueltas: {
            titulo: 'Solicitudes resueltas',
            icono: 'pi pi-check-circle',
            columnaFecha: 'Fecha de cierre',
        },
    };

    constructor(
        public gestor: GestorService,
        private router: Router,
        private route: ActivatedRoute,
        private datePipe: DatePipe,
        public seguimiento: SeguimientoService,
        public http: HttpService,
        public dialogService: DialogService
    ) {}

    ngOnInit(): void {
        const filtro = this.extraerFiltroDeRuta() || 'nuevas';
        this.setConfiguracion(filtro);
        this.cargarSolicitudes(this.obtenerEstadoAsociado(filtro));
        this.restablecerValoresEnServicios();
    }

    // Extrae el filtro de la ruta actual
    extraerFiltroDeRuta(): string {
        return this.route.snapshot.url.join('/').split('/').pop();
    }

    // Personaliza la vista del buzón según el filtro
    setConfiguracion(filtro: string): void {
        const config = this.configuraciones[filtro] || this.configuraciones.nuevas;
        this.tituloBuzon = config.titulo;
        this.iconoBuzon = config.icono;
        this.columnaFecha = config.columnaFecha;
    }

    // Carga las solicitudes desde el servidor según el filtro
    cargarSolicitudes(prmFiltro: string): void {
        // Limpiar la lista de solicitudes antes de hacer la nueva carga
        this.gestor.solicitudesCoordinadorCache = [];
        this.cargandoSolicitudes = true; // Mostrar el estado de carga

        this.gestor.obtenerSolicitudesCoordinador(prmFiltro).subscribe(
            (solicitudes: SolicitudRecibida[]) => {
                this.cargandoSolicitudes = false; // Ocultar el indicador de carga cuando se obtienen los datos
            },
            (error) => {
                console.error('Error al cargar las solicitudes:', error);
                this.cargandoSolicitudes = false; // Asegurarse de ocultar el estado de carga en caso de error
            }
        );
    }

    // Proporciona el estado en BD asociado al filtro
    obtenerEstadoAsociado(filtro: string): string {
        const estados: Record<string, string> = {
            nuevas: 'AVALADA',
            rechazadas: 'RECHAZADA',
            comite: 'EN_COMITE',
            consejo: 'EN_CONCEJO',
            resueltas: 'RESUELTA',
        };

        return estados[filtro] || '';
    }

    // Restablece los valores de los servicios necesarios
    restablecerValoresEnServicios(): void {
        this.seguimiento.restablecerValores();
        this.gestor.restablecerValores();
    }

    // Muestra los detalles de la solicitud seleccionada
    mostrarDetalles(): void {
        localStorage.setItem('solicitudSeleccionada', JSON.stringify(this.seleccionada));
        this.router.navigate(['/gestionsolicitudes/visor']);
    }

    // Limpia los filtros de la tabla
    limpiarFiltros(table: any): void {
        table.clear();
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
}
