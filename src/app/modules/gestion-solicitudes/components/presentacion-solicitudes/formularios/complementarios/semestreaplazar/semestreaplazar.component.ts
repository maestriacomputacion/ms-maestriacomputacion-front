import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-semestreaplazar',
    templateUrl: './semestreaplazar.component.html',
    styleUrls: ['./semestreaplazar.component.scss'],
})
export class SemestreaplazarComponent implements OnInit {
    formSemestreAplazar: FormGroup;

    constructor(public radicar: RadicarService, private fb: FormBuilder) {}

    ngOnInit(): void {
        this.formSemestreAplazar = this.fb.group({
            semestre: ['', Validators.required],
            motivo: ['', Validators.required],
        });

        // Verificar si ya hay datos en el servicio
        const formData = this.radicar.formSemestreAplazar.value;
        const hasData = Object.values(formData).some(
            (value) => value !== null && value !== ''
        );

        if (hasData) {
            // Cargar datos en el formulario desde el servicio
            this.formSemestreAplazar.patchValue(formData);
        }

        // Establecer el formulario en el servicio para compartirlo
        this.radicar.formSemestreAplazar = this.formSemestreAplazar;
    }

    obtenerEstadoFormulario(): boolean {
        return this.formSemestreAplazar.valid;
    }
}
