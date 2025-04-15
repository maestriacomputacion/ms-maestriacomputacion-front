import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-radicador',
    templateUrl: './radicador.component.html',
    styleUrls: ['./radicador.component.scss'],
})
export class RadicadorComponent implements OnInit {
    paso: number = 1; // Controla el paso actual del flujo

    constructor() {}

    ngOnInit(): void {}

    // Método para manejar el cambio de paso
    manejarCambioDePaso(cantidad: number) {
        this.paso += cantidad; // Aumentar o disminuir el paso según el valor emitido
        if (this.paso < 1) {
            this.paso = 1; // Limitar el paso mínimo
        } else if (this.paso > 4) {
            this.paso = 4; // Limitar el paso máximo
        }
    }

    esPasoActual(paso: number): boolean {
        return this.paso === paso; // Verificar si es el paso actual
    }
}
