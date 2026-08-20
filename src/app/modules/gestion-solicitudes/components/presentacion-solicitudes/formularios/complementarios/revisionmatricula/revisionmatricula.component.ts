import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-revisionmatricula',
    templateUrl: './revisionmatricula.component.html',
    styleUrls: ['./revisionmatricula.component.scss'],
})
export class RevisionmatriculaComponent implements OnInit {
    formRevisionMatricula: FormGroup;

    constructor(public radicar: RadicarService, private fb: FormBuilder) {}

    ngOnInit(): void {
        this.formRevisionMatricula = this.fb.group({
            solicitudRevision: ['', Validators.required],
        });

        // Verificar si ya hay datos en el servicio
        const formData = this.radicar.formRevisionMatricula.value;
        const hasData = Object.values(formData).some((value) => value !== null && value !== '');

        if (hasData) {
            // Cargar datos en el formulario desde el servicio
            this.formRevisionMatricula.patchValue(formData);
        }

        // Establecer el formulario en el servicio para compartirlo
        this.radicar.formRevisionMatricula = this.formRevisionMatricula;
    }

    obtenerEstadoFormulario(): boolean {
        return this.formRevisionMatricula.valid;
    }
}
