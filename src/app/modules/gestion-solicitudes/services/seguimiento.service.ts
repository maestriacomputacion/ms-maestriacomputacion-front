import { Injectable } from '@angular/core';
import { EventoHistorial } from '../models/indiceModelos';

@Injectable({
    providedIn: 'root',
})
export class SeguimientoService {
    // Número de radicado actual de la solicitud en seguimiento.
    radicado = '';

    // Historial de eventos asociados a la solicitud en seguimiento.
    historial: EventoHistorial[] = [];

    // Restablece el radicado y el historial de eventos a sus valores iniciales.
    restablecerValores() {
        this.radicado = '';
        this.historial = [];
    }
}
