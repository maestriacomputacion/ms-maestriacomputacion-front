import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-otrasolicitud',
    templateUrl: './otrasolicitud.component.html',
    styleUrls: ['./otrasolicitud.component.scss'],
})
export class OtrasolicitudComponent implements OnInit {
    formInfoOtraSolicitud: FormGroup;

    constructor(public radicar: RadicarService, private fb: FormBuilder, private cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.formInfoOtraSolicitud = this.fb.group({
            asuntoSolicitud: ['', Validators.required],
            contenidoSolicitud: ['', Validators.required],
            requiereAvalTutor: [false],
            requiereAvalDirector: [false],
        });

        // Verificar si ya hay datos en el servicio
        const formData = this.radicar.formInfoOtraSolicitud.value;
        const hasData = Object.values(formData).some((value) => value !== null && value !== '');

        if (hasData) {
            // Cargar datos en el formulario desde el servicio
            this.formInfoOtraSolicitud.patchValue(formData);
        }

        // Establecer el formulario en el servicio para compartirlo
        this.radicar.formInfoOtraSolicitud = this.formInfoOtraSolicitud;

        // Suscribirse a los cambios de `requiereAvalTutor`
        this.formInfoOtraSolicitud.get('requiereAvalTutor')?.valueChanges.subscribe((value) => {
            this.radicar.seRequiereTutor = value;
            this.cdr.detectChanges(); // Forza actualización
        });

        // Suscribirse a los cambios de `requiereAvalDirector`
        this.formInfoOtraSolicitud.get('requiereAvalDirector')?.valueChanges.subscribe((value) => {
            this.radicar.seRequieraDirector = value;
            this.cdr.detectChanges(); // Forza actualización
        });
    }

    obtenerEstadoFormulario(): boolean {
        return this.formInfoOtraSolicitud.valid;
    }
}
