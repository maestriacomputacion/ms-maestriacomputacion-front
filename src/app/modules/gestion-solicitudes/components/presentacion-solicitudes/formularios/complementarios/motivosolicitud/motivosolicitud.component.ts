import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-motivosolicitud',
    templateUrl: './motivosolicitud.component.html',
    styleUrls: ['./motivosolicitud.component.scss'],
})
export class MotivosolicitudComponent implements OnInit {
    formMotivoSolicitud: FormGroup;

    constructor(public radicar: RadicarService, private fb: FormBuilder) {
        this.formMotivoSolicitud = this.fb.group({
            motivosolicitud: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        if (this.radicar.motivoDeSolicitud.trim() !== '') {
            this.formMotivoSolicitud.patchValue({
                motivosolicitud: this.radicar.motivoDeSolicitud,
            });
        }

        // Escuchar cambios en el formulario y actualizar el motivoDeSolicitud en radicar
        this.formMotivoSolicitud.valueChanges.subscribe((value) => {
            this.radicar.motivoDeSolicitud = value.motivosolicitud;
        });
    }

    obtenerEstadoFormulario(): boolean {
        return this.formMotivoSolicitud.valid;
    }
}
