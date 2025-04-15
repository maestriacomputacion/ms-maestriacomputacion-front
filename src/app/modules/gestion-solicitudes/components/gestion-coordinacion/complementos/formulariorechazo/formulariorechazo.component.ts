import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-formulariorechazo',
    templateUrl: './formulariorechazo.component.html',
    styleUrls: ['./formulariorechazo.component.scss'],
})
export class FormulariorechazoComponent implements OnInit {
    motivoRechazo: string = '';
    confirmed: boolean = false; // Para verificar si se ha confirmado la acción
    showWarning: boolean = false; // Flag para mostrar advertencia

    constructor(public ref: DynamicDialogRef) {}

    ngOnInit(): void {}

    confirmar() {
        if (!this.motivoRechazo.trim()) {
            // Verifica si el textarea está vacío
            this.showWarning = true;
        } else {
            this.ref.close(this.motivoRechazo); // Envía el motivo y cierra el diálogo
        }
    }

    cancelar() {
        this.ref.close(); // Cierra el diálogo sin enviar datos
    }

    clearWarning() {
        this.showWarning = false; // Limpia la advertencia cuando el usuario escribe algo
    }
}
