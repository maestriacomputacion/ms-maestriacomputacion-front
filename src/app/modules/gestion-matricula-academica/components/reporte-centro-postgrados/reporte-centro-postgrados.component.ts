import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-reporte-centro-postgrados',
    templateUrl: './reporte-centro-postgrados.component.html',
    styleUrls: ['./reporte-centro-postgrados.component.scss'],
})
export class ReporteCentroPostgradosComponent {
    reporteForm: FormGroup;

    constructor(private readonly fb: FormBuilder) {
        this.reporteForm = this.fb.group({
            consecutivo: [''],
            copia: [''],
            destinatario: [''],
            titulo: [''],
            organizacion: [''],
            rol: [''],
        });
    }

    generarReporte(): void {
        if (!this.reporteForm) {
            return;
        }
    }
}
