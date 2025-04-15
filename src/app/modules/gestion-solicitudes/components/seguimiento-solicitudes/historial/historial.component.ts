import { Component, OnInit } from '@angular/core';
import { PrimeIcons } from 'primeng/api';
import { SeguimientoService } from '../../../services/seguimiento.service';
import { EventoHistorial } from '../../../models/indiceModelos';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';

@Component({
    selector: 'app-historial',
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnInit {
    eventos: EventoHistorial[] = [];

    personalizacion: {
        [estadoSolicitud: string]: { color: string; icon: string };
    } = {
        Creada: { color: '#0F2041', icon: 'pi pi-check-circle' },
        Avalada: { color: '#0F2041', icon: 'pi pi-check-circle' },
        'Avalada Tutor': { color: '#0F2041', icon: 'pi pi-check-circle' },
        'Avalada Director': { color: '#0F2041', icon: 'pi pi-check-circle' },
        'En Coordinación': { color: '#0F2041', icon: 'pi pi-check-circle' },
        'No Avalada Tutor': { color: '#AF0000', icon: 'pi pi-ban' },
        'No Avalada Director': { color: '#AF0000', icon: 'pi pi-ban' },
        'Rechazada Coordinador': { color: '#AF0000', icon: 'pi pi-ban' },
        'En comité': { color: '#0F2041', icon: 'pi pi-check-circle' },
        'En concejo': { color: '#0F2041', icon: 'pi pi-check-circle' },
        'Aprobada': { color: '#0F2041', icon: 'pi pi-check-circle' },
        Resuelta: { color: '#0F2041', icon: 'pi pi-check-circle' },
    };

    constructor(public seguimiento: SeguimientoService, private datePipe: DatePipe, private router: Router) {}

    ngOnInit(): void {
        if (this.seguimiento.historial.length > 0) {
            this.eventos = this.seguimiento.historial;
        } else {
            this.router.navigate(['/gestionsolicitudes/portafolio/opciones']);
        }
    }

    retornarNombreArchivo(cadena: string): string {
        return cadena.split(':')[0];
    }

    descargarArchivo(cadena: string) {
        const archivo = this.convertirBase64AFile(cadena);
        // Crea un enlace temporal
        const enlace = document.createElement('a');
        // Crea una URL para el archivo
        const url = URL.createObjectURL(archivo);
        enlace.href = url;
        enlace.download = archivo.name;
        // Agrega el enlace al DOM
        document.body.appendChild(enlace);
        // Hace clic en el enlace para iniciar la descarga
        enlace.click();
        // Elimina el enlace del DOM
        document.body.removeChild(enlace);
        // Revoca la URL creada
        URL.revokeObjectURL(url);
    }

    cambiarFormatoFecha(fecha: string): string {
        return this.datePipe.transform(fecha, 'dd-MM-yyyy h:mm a') || '';
    }

    convertirBase64AFile(base64String: string): File | null {
        // Divide la cadena base64 en nombre y contenido
        const partes = base64String.split(':');
        if (partes.length !== 2) {
            return null; // La cadena base64 no tiene el formato esperado
        }

        const nombre = partes[0];
        const contenidoBase64 = partes[1];

        // Decodifica el contenido base64 en un ArrayBuffer
        const binaryString = window.atob(contenidoBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Crea un nuevo archivo Blob a partir del ArrayBuffer
        const blob = new Blob([bytes]);

        // Crea un nuevo objeto File a partir del Blob y asigna el nombre del archivo
        const archivo = new File([blob], nombre);

        return archivo;
    }
}
