import { Component, OnInit } from '@angular/core';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/modules/gestion-solicitudes/services/http.service';
import { id } from 'date-fns/locale';
import { AutenticacionService } from 'src/app/modules/gestion-autenticacion/services/autenticacion.service';

@Component({
    selector: 'app-infopersonal',
    templateUrl: './infopersonal.component.html',
    styleUrls: ['./infopersonal.component.scss'],
})
export class InfopersonalComponent implements OnInit {
    identificadorSolicitante: string = 'ctorres@unicauca.edu.co';
    tiposIdentificacion: string[];
    formInfoPersonal: FormGroup;

    constructor(
        public radicar: RadicarService,
        private auth: AutenticacionService,
        private gestorHttp: HttpService,
        private fb: FormBuilder
    ) {
        this.tiposIdentificacion = [
            'Cédula de ciudadania',
            'Cédula de extrangeria',
            'Tarjeta de identidad',
            'Pasaporte',
            'CC',
        ];
    }

    ngOnInit(): void {
        // Inicializar el formulario
        this.formInfoPersonal = this.fb.group({
            id: [''],
            nombres: [{ value: '', disabled: true }, Validators.required],
            apellidos: [{ value: '', disabled: true }, Validators.required],
            correo: [
                { value: '', disabled: true },
                [Validators.required, Validators.email],
            ],
            celular: [{ value: '', disabled: true }, Validators.required],
            codigoAcademico: [
                { value: '', disabled: true },
                Validators.required,
            ],
            tipoDocumento: [{ value: '', disabled: true }, Validators.required],
            numeroDocumento: [
                { value: '', disabled: true },
                Validators.required,
            ],
        });

        // Verificar si ya hay datos en el servicio
        const formData = this.formInfoPersonal.value;
        const hasData = Object.keys(formData)
            .filter((key) => key !== 'id') // Filtrar el campo 'id'
            .some((key) => formData[key] !== null && formData[key] !== ''); // Verificar los otros campos

        if (hasData) {
            // Cargar datos en el formulario desde el servicio
            this.formInfoPersonal.patchValue(formData);
        } else {
            // Obtener información del solicitante desde la base de datos
            this.obtenerInfoDeSolicitante();
        }

        // Establecer el formulario en el servicio para compartirlo
        this.radicar.formInfoPersonal = this.formInfoPersonal;
    }

    obtenerInfoDeSolicitante() {
        this.gestorHttp;

        this.gestorHttp
            .obtenerInfoPersonalSolicitante(this.auth.getLoggedInUser().email)
            .subscribe((respuesta) => {
                if (respuesta) {
                    const mappedData = {
                        id: respuesta.id,
                        nombres: this.auth.getLoggedInUser().firstName,
                        apellidos: this.auth.getLoggedInUser().lastName,
                        correo: this.auth.getLoggedInUser().email,
                        celular: this.auth.getLoggedInUser().phoneNumber,
                        codigoAcademico:
                            this.auth.getLoggedInUser().academicCode,
                        tipoDocumento: this.auth.getLoggedInUser().idType,
                        numeroDocumento: this.auth.getLoggedInUser().idNumber,
                    };

                    this.formInfoPersonal.patchValue(mappedData);
                }
            });
    }
}
